// models/adminWalletModel.js
const mongoose = require("mongoose");

const adminWalletTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  transactionType: {
    type: String,
    enum: ["order", "refund", "return", "item-return", "other"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed",
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

const adminWalletSchema = new mongoose.Schema({
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  transactions: [adminWalletTransactionSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

adminWalletSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

adminWalletTransactionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("AdminWallet", adminWalletSchema);