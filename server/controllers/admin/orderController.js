const Order = require("../../models/orderModel");
const Wallet = require("../../models/walletModel");
const Product = require("../../models/productModel");
const Variant = require("../../models/varients");
const adminWalletController = require('../admin/adminWalletController');
const {calculateRefund} = require('../../utils/helperFunctions/calculateRefund')
const { nanoid } = require("nanoid");
const Decimal = require("decimal.js");

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

exports.processReturn = async (req, res) => {
  try {
    const { orderId, action, adminNotes } = req.body;

    // Validate input
    if (!orderId || !action) {
      return res.status(400).json({ message: 'Order ID and action are required' });
    }
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use 'approve' or 'reject'" });
    }

    // Find order
    const order = await Order.findOne({ orderId }).populate('items.productId items.variantId user');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check return request status
    if (order.returnRequest.status !== 'requested') {
      return res.status(400).json({ message: 'No pending return request for this order' });
    }

    if (action === 'reject') {
      order.returnRequest.status = 'rejected';
      order.returnRequest.processedAt = Date.now();
      order.returnRequest.adminNotes = adminNotes || '';
      await order.save();
      return res.status(200).json({
        success: true,
        message: 'Return request rejected successfully',
      });
    }

    // Handle approval
    order.returnRequest.status = 'approved';
    order.returnRequest.processedAt = Date.now();
    order.returnRequest.adminNotes = adminNotes || '';
    order.status = 'returned';

    // Identify eligible items (not already returned or cancelled)
    const eligibleItems = order.items.filter(
      (item) => item.status !== 'returned' && item.status !== 'cancelled'
    );
    if (eligibleItems.length === 0) {
      await order.save();
      return res.status(400).json({ message: 'No eligible items to return' });
    }

    // Calculate refund
    const { refundAmount, breakdown } = await calculateRefund(order, eligibleItems, true);

    // Validate payment
    // await validatePayment(order, refundAmount);

    // Update items
    for (const item of eligibleItems) {
      const itemTotal = new Decimal(item.price).times(item.quantity).toNumber();
      const itemProportion = order.subtotal ? itemTotal / order.subtotal : 0;

      item.refundedAmount = itemTotal;
      item.refundedShipping = breakdown.shipping * itemProportion;
      item.refundedTax = breakdown.tax * itemProportion;
      item.refundedDiscount = breakdown.discount * itemProportion;
      item.status = 'returned';
      item.returnRequest.status = 'approved';
      item.returnRequest.processedAt = Date.now();
      item.returnRequest.adminNotes = adminNotes || '';

      // Restore stock
      if (item.variantId) {
        await Variant.findByIdAndUpdate(item.variantId, {
          $inc: { stock: item.quantity },
        });
      } else {
        const product = await Product.findById(item.productId);
        if (product.variants.length > 0) {
          throw new Error(`Product ${item.productId} has variants; stock should be managed via variants`);
        }
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // Update order refund tracking
    order.totalRefunded = (order.totalRefunded || 0) + refundAmount;
    order.refundBreakdown.subtotal = (order.refundBreakdown.subtotal || 0) + breakdown.subtotal;
    order.refundBreakdown.shipping = (order.refundBreakdown.shipping || 0) + breakdown.shipping;
    order.refundBreakdown.tax = (order.refundBreakdown.tax || 0) + breakdown.tax;
    order.refundBreakdown.discount = (order.refundBreakdown.discount || 0) + breakdown.discount;

    // Update wallet
    let wallet = await Wallet.findOne({ user: order.user._id });
    if (!wallet) {
      wallet = new Wallet({ user: order.user._id, balance: 0 });
    }

    const transactionId = nanoid(10);
    await adminWalletController.recordTransaction({
      type: 'debit',
      amount: refundAmount,
      description: `Refund for returned order: #${orderId}`,
      orderId,
      userId: order.user._id,
      transactionType: 'return',
    });

    wallet.balance += refundAmount;
    wallet.transactions.push({
      transactionId,
      type: 'credit',
      amount: refundAmount,
      description: `Refund: Return approved for Order #${orderId}`,
      orderId,
    });

    order.updatedAt = Date.now();
    await order.save();
    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Return request approved successfully',
      refundAmount,
      breakdown,
    });
  } catch (error) {
    console.error('Error processing return:', error);
    res.status(500).json({
      message: 'Failed to process return',
      error: error.message,
    });
  }
};

exports.processRequestItemReturn = async (req, res) => {
  try {
    const { orderId, itemIds, action, adminNotes } = req.body;

    // Validate input
    if (!orderId || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: 'Order ID and item IDs are required' });
    }
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'" });
    }

    // Find order
    const order = await Order.findOne({ orderId }).populate('items.productId items.variantId user');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Identify items to process
    const itemsToProcess = [];
    for (const itemId of itemIds) {
      const [productId, variantId] = itemId.split('-');
      const item = order.items.find((i) => {
        const itemProductId = i.productId?._id?.toString();
        const itemVariantId = i.variantId?._id?.toString() || 'noVariant';
        return itemProductId === productId && itemVariantId === variantId;
      });

      if (!item) {
        return res.status(404).json({ message: `Item ${itemId} not found in order` });
      }
      if (item.returnRequest?.status !== 'requested') {
        return res.status(400).json({
          message: `Item ${itemId} does not have a pending return request`,
        });
      }
      itemsToProcess.push({ item, index: order.items.indexOf(item) });
    }

    if (action === 'reject') {
      for (const { item, index } of itemsToProcess) {
        order.items[index].returnRequest.status = 'rejected';
        order.items[index].returnRequest.processedAt = Date.now();
        order.items[index].returnRequest.adminNotes = adminNotes || '';
      }
      await order.save();
      return res.status(200).json({
        success: true,
        message: 'Item return request(s) rejected successfully',
      });
    }

    // Handle approval
    // Check if returning these items would leave no active items
    const activeItems = order.items.filter(
      (item) => item.status === 'none' && !itemsToProcess.some((p) => p.item === item)
    );
    if (activeItems.length === 0) {
      return res.status(400).json({
        message:
          'Cannot return the last active item(s). Use full order return instead.',
      });
    }

    // Calculate refund
    const itemsToRefund = itemsToProcess.map((p) => p.item);
    const { refundAmount, breakdown } = await calculateRefund(order, itemsToRefund, false);

    // Validate payment
    // await validatePayment(order, refundAmount);

    // Update items
    for (const { item, index } of itemsToProcess) {
      const itemTotal = new Decimal(item.price).times(item.quantity).toNumber();
      const itemProportion = order.subtotal ? itemTotal / order.subtotal : 0;

      order.items[index].refundedAmount = itemTotal;
      order.items[index].refundedShipping = breakdown.shipping * itemProportion;
      order.items[index].refundedTax = breakdown.tax * itemProportion;
      order.items[index].refundedDiscount = breakdown.discount * itemProportion;
      order.items[index].status = 'returned';
      order.items[index].returnRequest.status = 'approved';
      order.items[index].returnRequest.processedAt = Date.now();
      order.items[index].returnRequest.adminNotes = adminNotes || '';

      // Restore stock
      if (item.variantId) {
        await Variant.findByIdAndUpdate(item.variantId, {
          $inc: { stock: item.quantity },
        });
      } else {
        const product = await Product.findById(item.productId);
        if (product.variants.length > 0) {
          throw new Error(`Product ${item.productId} has variants; stock should be managed via variants`);
        }
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // Update order refund tracking
    order.totalRefunded = (order.totalRefunded || 0) + refundAmount;
    order.refundBreakdown.subtotal = (order.refundBreakdown.subtotal || 0) + breakdown.subtotal;
    order.refundBreakdown.shipping = (order.refundBreakdown.shipping || 0) + breakdown.shipping;
    order.refundBreakdown.tax = (order.refundBreakdown.tax || 0) + breakdown.tax;
    order.refundBreakdown.discount = (order.refundBreakdown.discount || 0) + breakdown.discount;

    // Update wallet
    let wallet = await Wallet.findOne({ user: order.user._id });
    if (!wallet) {
      wallet = new Wallet({ user: order.user._id, balance: 0 });
    }

    const transactionId = nanoid(10);
    await adminWalletController.recordTransaction({
      type: 'debit',
      amount: refundAmount,
      description: `Partial refund for returned items in order: #${orderId}`,
      orderId,
      userId: order.user._id,
      transactionType: 'item-return',
    });

    wallet.balance += refundAmount;
    wallet.transactions.push({
      transactionId,
      type: 'credit',
      amount: refundAmount,
      description: `Partial refund: Return approved for items in Order #${orderId}`,
      orderId,
    });

    order.updatedAt = Date.now();
    await order.save();
    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Item return request(s) approved successfully',
      refundAmount,
      breakdown,
    });
  } catch (error) {
    console.error('Error processing item return:', error);
    res.status(500).json({
      message: 'Failed to process item return',
      error: error.message,
    });
  }
};

