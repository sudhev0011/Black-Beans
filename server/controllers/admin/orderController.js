const Order = require("../../models/orderModel");
const Wallet = require("../../models/walletModel");
const Product = require("../../models/productModel");
const Variant = require("../../models/varients");
const adminWalletController = require('../admin/adminWalletController');
const { nanoid } = require("nanoid");

exports.processReturn = async (req, res) => {
  try {
    const { orderId, action, adminNotes } = req.body;

    if (!orderId || !action) {
      return res
        .status(400)
        .json({ message: "Order ID and action are required" });
    }
    if (action !== "approve" && action !== "reject") {
      return res
        .status(400)
        .json({ message: "Invalid action. Use 'approve' or 'reject'" });
    }

    const order = await Order.findOne({ orderId }).populate(
      "items.productId items.variantId user"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.returnRequest.status !== "requested") {
      return res
        .status(400)
        .json({ message: "No pending return request for this order" });
    }

    if (action === "approve") {
      order.returnRequest.status = "approved";
      order.status = "returned";

      const eligibleItems = order.items.filter(
        (item) => item.status !== "returned" && item.status !== "cancelled"
      );

      let totalRefundAmount = 0;
      const shippingCostPerItem = order.shipping / order.items.length;

      for (const item of eligibleItems) {
        if (item.variantId) {
          const variant = await Variant.findById(item.variantId);
          if (!variant) {
            return res
              .status(404)
              .json({ message: `Variant with ID ${item.variantId} not found` });
          }
          variant.stock += item.quantity;
          await variant.save();
        } else {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res
              .status(404)
              .json({ message: `Product with ID ${item.productId} not found` });
          }
          if (product.variants.length > 0) {
            return res.status(400).json({
              message: `Product ${item.productId} has variants; stock should be managed via variants`,
            });
          }
          product.stock += item.quantity;
          await product.save();
        }

        const itemTotal = item.price * item.quantity;
        totalRefundAmount += itemTotal + shippingCostPerItem;
      }

      if (eligibleItems.length > 0 && totalRefundAmount > 0) {
        let wallet = await Wallet.findOne({ user: order.user._id });
        if (!wallet) {
          wallet = new Wallet({ user: order.user._id, balance: 0 });
        }

        await adminWalletController.recordTransaction({
          type: "debit",
          amount: totalRefundAmount,
          description: `Refund for returned order: #${orderId}`,
          orderId,
          userId: order.user._id,
          transactionType: "return",
        });

        wallet.balance += totalRefundAmount;
        wallet.transactions.push({
          transactionId: nanoid(10),
          type: "credit",
          amount: totalRefundAmount,
          description: `Refund: Return approved for Order #${orderId}`,
          orderId,
        });
        await wallet.save();
      }
    } else if (action === "reject") {
      order.returnRequest.status = "rejected";
    }

    order.returnRequest.processedAt = Date.now();
    order.returnRequest.adminNotes = adminNotes || "";

    await order.save();

    res.status(200).json({
      success: true,
      message: `Return request ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error processing return:", error);
    res.status(500).json({
      message: "Failed to process return",
      error: error.message,
    });
  }
};

exports.processRequestItemReturn = async (req, res) => {
  try {
    const { orderId, itemIds, action, adminNotes } = req.body;
    const adminId = req.user.id;

    // Validate input
    if (
      !orderId ||
      !itemIds ||
      !Array.isArray(itemIds) ||
      itemIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Order ID and item IDs are required" });
    }
    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Invalid action. Must be 'approve' or 'reject'" });
    }

    // Find the order
    const order = await Order.findOne({ orderId }).populate(
      "items.productId items.variantId user"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemsToProcess = [];
    for (const itemId of itemIds) {
      const [productId, variantId] = itemId.split("-");
      const item = order.items.find((i) => {
        const itemProductId = i.productId?._id?.toString();
        const itemVariantId = i.variantId?._id?.toString() || "noVariant";
        return itemProductId === productId && itemVariantId === variantId;
      });

      if (!item) {
        return res
          .status(404)
          .json({ message: `Item ${itemId} not found in order` });
      }
      if (item.returnRequest?.status !== "requested") {
        return res.status(400).json({
          message: `Item ${itemId} does not have a pending return request`,
        });
      }
      itemsToProcess.push({ item, index: order.items.indexOf(item) });
    }

    // Process each item
    let totalRefundAmount = 0;
    const shippingCostPerItem = order.shipping / order.items.length;

    for (const { item, index } of itemsToProcess) {
      // Update return status and notes
      order.items[index].status =
        action === "approve" ? "returned" : "return-rejected";
      order.items[index].returnRequest.status =
        action === "approve" ? "approved" : "rejected";
      order.items[index].adminNotes = adminNotes || "";

      if (action === "approve") {
        if (item.variantId) {
          const variant = await Variant.findById(item.variantId);
          if (!variant) {
            return res
              .status(404)
              .json({ message: `Variant ${item.variantId} not found` });
          }
          variant.stock += item.quantity;
          await variant.save();
        } else {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res
              .status(404)
              .json({ message: `Product ${item.productId} not found` });
          }
          if (product.variants.length > 0) {
            return res.status(400).json({
              message: `Product ${item.productId} has variants; stock should be managed via variants`,
            });
          }
          product.stock += item.quantity;
          await product.save();
        }

        // Calculate refund for this item
        const itemTotal = item.price * item.quantity;
        totalRefundAmount += itemTotal + shippingCostPerItem;
      }
    }

    // Process refund for approved returns
    if (action === "approve" && totalRefundAmount > 0) {
      let wallet = await Wallet.findOne({ user: order.user._id });
      if (!wallet) {
        wallet = new Wallet({ user: order.user._id, balance: 0 });
      }

      await adminWalletController.recordTransaction({
        type: "debit",
        amount: totalRefundAmount,
        description: `Partial refund for returned items in order: #${orderId}`,
        orderId,
        userId: order.user._id,
        transactionType: "item-return",
      });
      
      wallet.balance += totalRefundAmount;
      wallet.transactions.push({
        transactionId: nanoid(10),
        type: "credit",
        amount: totalRefundAmount,
        description: `Partial refund: Return approved for items in Order #${orderId}`,
        orderId,
      });
      await wallet.save();
    }

    // Update order metadata
    order.updatedAt = Date.now();
    await order.save();

    res.status(200).json({
      success: true,
      message: `Item return request(s) ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error processing item return:", error);
    res.status(500).json({
      message: "Failed to process item return",
      error: error.message,
    });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "" } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "shippingAddress.fullname": { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("user", "username email")
      .populate("items.productId")
      .populate("items.variantId")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.status(200).json({
      orders,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

exports.getAdminOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId }).populate(
      "user",
      "username email"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch order details", error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("order when togling the status", order, status);

    if (
      // (order.status === "cancelled" && status !== "cancelled") ||
      (order.status === "delivered" && status !== "delivered")
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    res.status(200).json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to update order status", error: error.message });
  }
};
