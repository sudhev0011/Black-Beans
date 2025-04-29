const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status:{
      type: String,
      enum:['cancelled', 'returned', 'none'],
      default: 'none'
    },
    returnRequest: {
      reason: String,
      requestedAt: Date,
      processedAt: Date,
      status: {
        type: String,
        enum: ['none', 'requested', 'approved', 'rejected', 'completed'],
        default: 'none'
      },
      adminNotes: String
    }

  }],
  shippingAddress: {
    fullname: { type: String, required: true },
    email: { type: String },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    enum: ["credit-card", "wallet", "bank-transfer", "cash-on-delivery", "razorpay"],
    required: true,
  },
  paymentStatus:{
    type: String,
    enum:['success','failed','pending'],
    required: true,
  },
  orderNotes: {
    type: String,
    default: "",
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax:{
    type: Number,
  },
  shipping: {
    type: Number,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  appliedCoupons: [{ code: String, discount: Number }],
  totalRefunded: {
    type: Number,
    default: 0,
    min: 0,
  },
  refundBreakdown: {
    subtotal: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled","returned","failed"],
    default: "pending",
  },
  razorpayOrderId: { type: String, default: null },
  returnRequest: {
    status: {
      type: String,
      enum: ["none", "requested", "approved", "rejected", "completed"],
      default: "none",
    },
    reason: {
      type: String,
      default: "",
    },
    requestedAt: {
      type: Date,
    },
    processedAt: {
      type: Date,
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.plugin(mongoosePaginate);

orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Order", orderSchema);