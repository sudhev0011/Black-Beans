const Razorpay = require("razorpay");
const Order = require("../../models/orderModel");
const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");

const Wallet = require("../../models/walletModel");
const Variant = require("../../models/varients");
const Coupon = require("../../models/couponModel");
const ReferralCoupon = require("../../models/referralCouponModel");
const { generateOrderId } = require("../../utils/services/generateOrderId");
const adminWalletController = require("../admin/adminWalletController");
const crypto = require("crypto");
const Decimal = require("decimal.js");
const PDFDocument = require("pdfkit");
const { nanoid } = require("nanoid");
const {calculateRefund} = require('../../utils/helperFunctions/calculateRefund')
const razorpay = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

exports.placeOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod, cart, orderNotes, appliedCoupon } =
      req.body;
    const userId = req.user.id;
    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const address = addressId;
    if (
      !address ||
      !address.fullname ||
      !address.addressLine ||
      !address.city ||
      !address.state ||
      !address.country ||
      !address.phone ||
      !address.pincode
    ) {
      return res.status(400).json({ message: "Invalid or incomplete address" });
    }

    const { subtotal, shipping, tax } = cart;

    let discount = 0;
    let appliedCoupons = [];

    if (appliedCoupon && appliedCoupon.code) {
      let coupon = await Coupon.findOne({
        code: appliedCoupon.code.toUpperCase(),
      });
      let isReferral = false;

      if (!coupon) {
        coupon = await ReferralCoupon.findOne({
          code: appliedCoupon.code.toUpperCase(),
        });
        isReferral = true;
        if (!coupon) {
          return res.status(400).json({ message: "Invalid coupon code" });
        }
      }

      // Validate coupon
      const now = new Date();
      if (!isReferral) {
        if (now < coupon.startDate || now > coupon.endDate) {
          return res.status(400).json({ message: "This coupon has expired" });
        }
      }

      if (
        coupon.status === "Expired" ||
        coupon.usageCount >= coupon.usageLimit
      ) {
        return res
          .status(400)
          .json({
            message: "This coupon has reached its usage limit or is expired",
          });
      }

      if (coupon.minPurchase > subtotal) {
        return res.status(400).json({
          message: `This coupon requires a minimum purchase of ₹${coupon.minPurchase}`,
        });
      }

      if (coupon.restrictions.newCustomersOnly) {
        const hasPreviousOrders = await Order.exists({ user: userId });
        if (hasPreviousOrders) {
          return res
            .status(400)
            .json({ message: "This coupon is only for new customers" });
        }
      }

      if (coupon.restrictions.onePerCustomer) {
        const hasUsedCoupon = await Order.exists({
          user: userId,
          "appliedCoupons.code": coupon.code,
        });
        if (hasUsedCoupon) {
          return res.status(400).json({
            message: "This coupon can only be used once per customer",
          });
        }
      }

      // Calculate discount
      if (
        coupon.discountType === "percentage" ||
        coupon.discountType === "referral"
      ) {
        discount = (subtotal * coupon.discountValue) / 100;
      } else if (coupon.discountType === "fixed") {
        discount = coupon.discountValue;
      } else if (coupon.discountType === "shipping") {
        discount = shipping;
      }
      discount = Math.min(discount, subtotal);
      appliedCoupons = [{ code: coupon.code, discount, isReferral }];

      coupon.usageCount += 1;
      if (coupon.usageCount >= coupon.usageLimit) {
        coupon.status = "Expired";
      }
      await coupon.save();
    }

    const total = subtotal + shipping + tax - discount;

    if (paymentMethod === "wallet" || paymentMethod === "cash-on-delivery") {
      const wallet = await Wallet.findOne({ user: userId });
      if (paymentMethod === "wallet") {
        if (!wallet || wallet.balance < total) {
          return res
            .status(400)
            .json({ message: "Insufficient wallet balance" });
        }
      }

      if (paymentMethod === "cash-on-delivery" && total > 1000) {
        return res.status(400).json({
          success: false,
          message: "Cannot make COD for order above 1000",
        });
      }

      const orderId = await generateOrderId();
      const orderItems = cart.items.map((item) => ({
        productId: item.productId._id,
        variantId: item.variantId?._id || null,
        quantity: item.quantity,
        price: item.productId?.salePrice || item.variantId?.salePrice,
      }));

      await reduceStock(orderItems);

      const order = new Order({
        orderId,
        user: userId,
        items: orderItems,
        shippingAddress: {
          fullname: address.fullname,
          email: address.email || "",
          addressLine: address.addressLine,
          city: address.city,
          state: address.state,
          postalCode: address.pincode,
          country: address.country,
          phone: address.phone,
        },
        paymentMethod,
        paymentStatus: "success",
        orderNotes: orderNotes || "",
        subtotal,
        shipping,
        discount,
        tax,
        appliedCoupons,
        total,
        status: "processing",
      });

      await order.save();

      if (paymentMethod === "wallet") {
        wallet.balance -= total;
        const transactionId = nanoid(10);
        wallet.transactions.push({
          transactionId,
          type: "debit",
          amount: total,
          description: `Purchase: Order #${orderId}`,
          orderId,
        });
        await wallet.save();

        await adminWalletController.recordTransaction({
          type: "credit",
          amount: total,
          description: `Order payment received from user wallet: #${orderId}`,
          orderId,
          userId: userId,
          transactionType: "order",
        });
      }

      // Credit referrer's wallet if referral coupon was used
      if (appliedCoupons.length > 0 && appliedCoupons[0].isReferral) {
        console.log("coupons was referral");

        const user = await User.findById(userId);
        console.log("user placing the order", user);
        if (user.referredBy) {
          console.log("user referredBy code", user.referredBy);
          const referrer = await User.findOne({
            referralCode: user.referredBy,
          });
          console.log("refrrer", referrer);
          if (referrer) {
            const referrerWallet = await Wallet.findOne({ user: referrer._id });
            console.log("refrrer's wallet", referrerWallet);
            if (referrerWallet) {
              const referralBonus = 500;
              referrerWallet.balance += referralBonus;
              referrerWallet.transactions.push({
                transactionId: nanoid(10),
                type: "credit",
                amount: referralBonus,
                description: `Referral bonus for order #${orderId} by ${user.email}`,
                orderId,
              });
              await referrerWallet.save();

              await adminWalletController.recordTransaction({
                type: "debit",
                amount: referralBonus,
                description: `Referral bonus paid for order #${orderId}`,
                orderId,
                userId: referrer._id,
                transactionType: "referral",
              });
            }
          }
        }
      }

      await Cart.findOneAndUpdate({ user: userId }, { items: [], total: 0 });

      return res.status(201).json({
        success: true,
        orderId,
        total,
        paymentMethod,
      });
    }

    if (paymentMethod === "razorpay") {
      const orderId = await generateOrderId();
      const razorpayOrder = await razorpay.orders.create({
        amount: parseInt(total * 100),
        currency: "INR",
        receipt: `receipt_${orderId}`,
        payment_capture: 1,
      });

      const pendingOrder = new Order({
        orderId,
        user: userId,
        items: cart.items.map((item) => ({
          productId: item.productId._id,
          variantId: item.variantId?._id || null,
          quantity: item.quantity,
          price: item.productId?.salePrice || item.variantId?.salePrice,
        })),
        shippingAddress: {
          fullname: address.fullname,
          email: address.email || "",
          addressLine: address.addressLine,
          city: address.city,
          state: address.state,
          postalCode: address.pincode,
          country: address.country,
          phone: address.phone,
        },
        paymentMethod,
        paymentStatus: "pending",
        orderNotes: orderNotes || "",
        subtotal,
        shipping,
        discount,
        tax,
        appliedCoupons,
        total,
        status: "pending",
        razorpayOrderId: razorpayOrder.id,
      });

      await pendingOrder.save();
      await Cart.findOneAndUpdate({ user: userId }, { items: [], total: 0 });

      res.status(200).json({
        success: true,
        orderId,
        razorpayOrderId: razorpayOrder.id,
        total,
        paymentMethod: "razorpay",
      });
    } else {
      res.status(400).json({ message: "Invalid payment method" });
    }
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({
      message: "Failed to create payment intent",
      error: error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;
    const userId = req.user.id;

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.key_secret)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    // Find and update the pending order
    const order = await Order.findOne({
      orderId,
      user: userId,
      paymentMethod: "razorpay",
      status: "pending",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Reduce stock
    await reduceStock(order.items);

    // Update order status
    order.status = "processing";
    order.paymentStatus = "success";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Credit referrer's wallet if referral coupon was used
    if (order.appliedCoupons.length > 0 && order.appliedCoupons[0].isReferral) {
      const user = await User.findById(userId);
      if (user.referredBy) {
        const referrer = await User.findOne({ referralCode: user.referredBy });
        if (referrer) {
          const referrerWallet = await Wallet.findOne({ user: referrer._id });
          if (referrerWallet) {
            const referralBonus = 500; // ₹500
            referrerWallet.balance += referralBonus;
            referrerWallet.transactions.push({
              transactionId: nanoid(10),
              type: "credit",
              amount: referralBonus,
              description: `Referral bonus for order #${orderId} by ${user.email}`,
              orderId,
            });
            await referrerWallet.save();

            await adminWalletController.recordTransaction({
              type: "debit",
              amount: referralBonus,
              description: `Referral bonus paid for order #${orderId}`,
              orderId,
              userId: referrer._id,
              transactionType: "referral",
            });
          }
        }
      }
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: userId }, { items: [], total: 0 });

    res.status(201).json({
      success: true,
      orderId,
      message: "Order confirmed successfully",
    });
  } catch (error) {
    console.error("Confirm order error:", error);
    res
      .status(500)
      .json({ message: "Failed to confirm order", error: error.message });
  }
};

exports.retryPayment = async (req, res) => {
  console.log("call received at the retry payment controller");

  try {
    const { orderId } = req.body;
    const userId = req.user.id;
    console.log("orderId and userId", orderId, userId);

    // Find the pending order
    const order = await Order.findOne({
      orderId,
      user: userId,
      paymentMethod: "razorpay",
      status: "pending",
      paymentStatus: "pending",
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "No failed order found for retry" });
    }

    // Create new Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: parseInt(order.total * 100),
      currency: "INR",
      receipt: `receipt_${orderId}_retry`,
      payment_capture: 1,
    });

    // Update order with new Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      orderId,
      razorpayOrderId: razorpayOrder.id,
      total: order.total,
      paymentMethod: "razorpay",
    });
  } catch (error) {
    console.error("Retry payment error:", error);
    res
      .status(500)
      .json({ message: "Failed to retry payment", error: error.message });
  }
};

async function reduceStock(orderItems) {
  for (const item of orderItems) {
    if (item.variantId) {
      await Variant.findByIdAndUpdate(item.variantId, {
        $inc: { stock: -item.quantity },
      });
    } else {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }
  }
}

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
    } = req.query;

    const sortableFields = ["createdAt", "total", "status", "orderId"];
    const sortField = sortableFields.includes(sortBy) ? sortBy : "createdAt";

    const query = { user: userId };
    if (search) {
      query.orderId = { $regex: search, $options: "i" };
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { [sortField]: sortOrder === "asc" ? 1 : -1 },
      populate: "user items.productId items.variantId",
    };

    const result = await Order.paginate(query, options);

    res.status(200).json({
      orders: result.docs,
      total: result.totalDocs,
      pages: result.totalPages,
      currentPage: result.page,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId, user: req.user.id }).populate(
      "items.productId items.variantId"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch order details", error: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ orderId, user: userId })
      .populate("items.productId")
      .populate("items.variantId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${order.orderId}.pdf`
    );

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    doc.pipe(res);
    const currencySymbol = "Rs.";

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("BLACK BEANS", { align: "center" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Premium Coffee Store", { align: "center" });
    doc.moveDown(0.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();
    doc.moveDown();

    const startY = doc.y;

    // Left column - Invoice details
    doc.font("Helvetica-Bold").fontSize(14).text("INVOICE", 50, startY);
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Invoice Number: INV-${order.orderId}`, 50, doc.y + 5);
    doc.text(
      `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      50,
      doc.y + 5
    );
    doc.text(`Order ID: ${order.orderId}`, 50, doc.y + 5);
    doc.text(
      `Payment Method: ${order.paymentMethod || "Online Payment"}`,
      50,
      doc.y + 5
    );
    doc.text(
      `Payment Status: ${order.paymentStatus || "Online Payment"}`,
      50,
      doc.y + 5
    );

    // Right column - Customer details
    const customerStartY = startY;
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("BILLED TO:", doc.page.width - 200, customerStartY);
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(
        `${order.shippingAddress.fullname}`,
        doc.page.width - 200,
        doc.y + 5
      );
    doc.text(
      `Email: ${order.shippingAddress.email}`,
      doc.page.width - 200,
      doc.y + 5
    );
    doc.text(
      `Phone: ${order.shippingAddress.phone}`,
      doc.page.width - 200,
      doc.y + 5
    );

    doc.y = Math.max(doc.y, customerStartY + 100);

    // Shipping Address Section
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("SHIPPING ADDRESS:", 50, doc.y + 5);
    const address = order.shippingAddress;
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`${address.addressLine}`, 50, doc.y + 5);
    doc.text(`${address.city}, ${address.state}`, 50, doc.y + 5);
    doc.text(`${address.country} - ${address.postalCode}`, 50, doc.y + 5);
    doc.moveDown(2);

    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();
    doc.moveDown();

    // Table Header with background
    const tableTop = doc.y;
    const tableHeaders = ["Item Description", "Qty", "Unit Price", "Amount"];
    const columnWidths = [250, 70, 100, 80];

    doc.rect(50, tableTop - 5, doc.page.width - 100, 20).fill("#f0f0f0");

    // Add table headers
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#000000");
    let xPos = 50;
    tableHeaders.forEach((header, i) => {
      const textOptions =
        i === 0
          ? { width: columnWidths[i] }
          : { width: columnWidths[i], align: "right" };
      doc.text(header, xPos, tableTop, textOptions);
      xPos += columnWidths[i];
    });

    doc.moveDown(1.5);

    // Table Content
    doc.font("Helvetica").fontSize(10);
    let itemY = doc.y;
    let alternateRow = false;

    order.items.forEach((item) => {
      alternateRow = !alternateRow;
      const name = item.productId?.name || "Unnamed Product";
      const variant = item.variantId?.name ? ` (${item.variantId.name})` : "";
      const quantity = item.quantity;
      const price = item.price;
      const total = quantity * price;

      if (alternateRow) {
        doc.rect(50, itemY - 5, doc.page.width - 100, 20).fill("#f9f9f9");
      }

      doc.fillColor("#000000");
      doc.text(`${name}${variant}`, 50, itemY, { width: columnWidths[0] });
      doc.text(quantity.toString(), 50 + columnWidths[0], itemY, {
        width: columnWidths[1],
        align: "right",
      });
      doc.text(
        `${currencySymbol}${price.toFixed(2)}`,
        50 + columnWidths[0] + columnWidths[1],
        itemY,
        { width: columnWidths[2], align: "right" }
      );
      doc.text(
        `${currencySymbol}${total.toFixed(2)}`,
        50 + columnWidths[0] + columnWidths[1] + columnWidths[2],
        itemY,
        { width: columnWidths[3], align: "right" }
      );

      itemY = doc.y + 15;
      doc.y = itemY;
    });

    doc
      .moveTo(50, doc.y - 5)
      .lineTo(doc.page.width - 50, doc.y - 5)
      .stroke();
    doc.moveDown(0.5);

    // Define summary section layout
    const summaryLabelWidth = 100;
    const summaryValueWidth = 120;
    const summaryTableX =
      doc.page.width - summaryLabelWidth - summaryValueWidth - 50;

    const addSummaryRow = (label, value, isBold = false) => {
      const currentY = doc.y;

      if (isBold) {
        doc.font("Helvetica-Bold").fontSize(12);
      } else {
        doc.font("Helvetica").fontSize(10);
      }

      doc.text(label, summaryTableX, currentY, {
        width: summaryLabelWidth,
        align: "left",
      });

      // Draw value in the right column without word wrap
      doc.text(value, summaryTableX + summaryLabelWidth, currentY, {
        width: summaryValueWidth,
        align: "right",
        lineBreak: false,
      });

      doc.moveDown(0.8);
    };

    addSummaryRow("Subtotal:", `${currencySymbol}${order.subtotal.toFixed(2)}`);
    addSummaryRow("Shipping:", `${currencySymbol}${order.shipping.toFixed(2)}`);
    addSummaryRow("Tax:", `${currencySymbol}${order.tax.toFixed(2)}`);
    addSummaryRow(
      "Discount:",
      `-${currencySymbol}${order.discount.toFixed(2)}`
    );

    doc
      .moveTo(summaryTableX, doc.y)
      .lineTo(summaryTableX + summaryLabelWidth + summaryValueWidth, doc.y)
      .stroke();
    doc.moveDown(0.5);

    addSummaryRow("Total:", `${currencySymbol}${order.total.toFixed(2)}`, true);

    doc.moveDown(2);

    // Footer
    doc.fontSize(8).font("Helvetica").fillColor("#555555");
    doc.text(
      "Thank you for shopping with Black Beans. For any queries relating to your order, please contact our customer service.",
      50,
      doc.y,
      {
        align: "center",
        width: doc.page.width - 100,
      }
    );

    doc.moveDown(0.5);
    doc.text(
      "This is a computer-generated invoice and does not require a signature.",
      {
        align: "center",
        width: doc.page.width - 100,
      }
    );

    // Page number
    const pageNumber = "Page 1 of 1";
    doc.fontSize(8).text(pageNumber, 50, doc.page.height - 50, {
      align: "center",
      width: doc.page.width - 100,
    });

    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};

exports.requestReturn = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({ orderId, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        message: "Returns can only be requested for delivered orders",
      });
    }

    const daysSinceDelivery =
      (Date.now() - order.updatedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      return res
        .status(400)
        .json({ message: "Return period has expired (7 days)" });
    }

    if (order.returnRequest.status !== "none") {
      return res
        .status(400)
        .json({ message: "Return request already processed or pending" });
    }

    order.returnRequest = {
      status: "requested",
      reason,
      requestedAt: Date.now(),
    };

    await order.save();
    res.status(200).json({
      success: true,
      message: "Return request submitted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to request return", error: error.message });
  }
};

exports.requestItemReturn = async (req, res) => {
  try {
    const { orderId, itemId, reason } = req.body;
    const userId = req.user.id;
    const order = await Order.findOne({ orderId: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Only delivered orders can be returned" });
    }

    const itemIndex = order.items.findIndex(
      (item) =>
        item.productId?._id.toString() === itemId ||
        item.variantId?._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    if (
      ["cancelled", "returned", "return-requested"].includes(
        order.items[itemIndex].status
      )
    ) {
      return res.status(400).json({
        message: `Item is already ${order.items[itemIndex].status}`,
      });
    }

    order.items[itemIndex].returnRequest = {
      reason,
      requestedAt: new Date(),
      status: "requested",
    };

    await order.save();
    res.status(200).json({
      success: true,
      message: "Return request submitted successfully",
      itemStatus: "return-requested",
    });
  } catch (error) {
    console.error("Error requesting item return:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.cancelOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ orderId, user: userId }).populate(
      "items.productId items.variantId"
    );
    console.log("order details from the single order db return", order);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemIndex = order.items.findIndex(
      (item) =>
        item.productId?._id.toString() === itemId ||
        (item.variantId && item.variantId._id.toString() === itemId)
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    const item = order.items[itemIndex];
    if (item.status !== "none") {
      return res
        .status(400)
        .json({ message: `Item is already ${item.status}` });
    }

    const lastItem = order.items.find(
      (OrderItem) => OrderItem.status === "none" && item._id !== OrderItem._id
    );

    if (!lastItem) {
      return res.status(400).json({
        message:
          "Cannot cancel the last item. Use cancel order to cancel the entire order instead.",
      });
    }

    // Calculate refund
    const { refundAmount, breakdown } = await calculateRefund(order, [item]);

    

    // Update item refund details
    item.refundedAmount = breakdown.subtotal;
    item.refundedShipping = breakdown.shipping;
    item.refundedTax = breakdown.tax;
    item.refundedDiscount = breakdown.discount;
    item.status = "cancelled";

    // Update order refund tracking
    order.totalRefunded = (order.totalRefunded || 0) + refundAmount;
    order.refundBreakdown.subtotal =
      (order.refundBreakdown.subtotal || 0) + breakdown.subtotal;
    order.refundBreakdown.shipping =
      (order.refundBreakdown.shipping || 0) + breakdown.shipping;
    order.refundBreakdown.tax =
      (order.refundBreakdown.tax || 0) + breakdown.tax;
    order.refundBreakdown.discount =
      (order.refundBreakdown.discount || 0) + breakdown.discount;

    // Restore stock
    if (item.variantId) {
      await Variant.findByIdAndUpdate(item.variantId, {
        $inc: { stock: item.quantity },
      });
    } else {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    // Update wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new Wallet({ user: userId, balance: 0 });
    }

    const transactionId = nanoid(10);
    await adminWalletController.recordTransaction({
      type: "debit",
      amount: refundAmount,
      description: `Partial refund for item in order #${orderId}`,
      orderId,
      userId,
      transactionType: "refund",
    });

    wallet.balance += refundAmount;
    wallet.transactions.push({
      transactionId,
      type: "credit",
      amount: refundAmount,
      description: `Partial refund: Item from order #${orderId}`,
      orderId,
    });

    order.updatedAt = new Date();
    await order.save();
    await wallet.save();

    res.status(200).json({
      success: true,
      message: "Item cancelled successfully",
      refundAmount,
      breakdown,
    });
  } catch (error) {
    console.error("Item cancellation error:", error);
    res.status(500).json({
      message: "Failed to cancel item",
      error: error.message,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ orderId, user: userId }).populate(
      "items.productId items.variantId"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const activeItems = order.items.filter((item) => item.status === "none");
    if (activeItems.length === 0) {
      return res.status(400).json({ message: "No active items to cancel" });
    }

    // Calculate refund
    const { refundAmount, breakdown } = await calculateRefund(
      order,
      activeItems,
      true
    );

    // Update all active items
    for (const item of activeItems) {
      const itemTotal = new Decimal(item.price).times(item.quantity).toNumber();
      const itemProportion = order.subtotal ? itemTotal / order.subtotal : 0;

      item.refundedAmount = itemTotal;
      item.refundedShipping = breakdown.shipping * itemProportion;
      item.refundedTax = breakdown.tax * itemProportion;
      item.refundedDiscount = breakdown.discount * itemProportion;
      item.status = "cancelled";

      // Restore stock
      if (item.variantId) {
        await Variant.findByIdAndUpdate(item.variantId, {
          $inc: { stock: item.quantity },
        });
      } else {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // Update order refund tracking
    order.totalRefunded = (order.totalRefunded || 0) + refundAmount;
    order.refundBreakdown.subtotal =
      (order.refundBreakdown.subtotal || 0) + breakdown.subtotal;
    order.refundBreakdown.shipping =
      (order.refundBreakdown.shipping || 0) + breakdown.shipping;
    order.refundBreakdown.tax =
      (order.refundBreakdown.tax || 0) + breakdown.tax;
    order.refundBreakdown.discount =
      (order.refundBreakdown.discount || 0) + breakdown.discount;
    order.status = "cancelled";

    // Update wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new Wallet({ user: userId, balance: 0 });
    }

    const transactionId = nanoid(10);
    await adminWalletController.recordTransaction({
      type: "debit",
      amount: refundAmount,
      description: `Full refund for order #${orderId}`,
      orderId,
      userId,
      transactionType: "refund",
    });

    wallet.balance += refundAmount;
    wallet.transactions.push({
      transactionId,
      type: "credit",
      amount: refundAmount,
      description: `Full refund: Order #${orderId}`,
      orderId,
    });

    order.updatedAt = new Date();
    await order.save();
    await wallet.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      refundAmount,
      breakdown,
    });
  } catch (error) {
    console.error("Order cancellation error:", error);
    res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};
