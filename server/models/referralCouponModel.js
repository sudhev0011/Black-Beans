const mongoose = require("mongoose");

const referralCouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Coupon code is required"],
    unique: true,
    trim: true,
    uppercase: true,
  },
  discountType: {
    type: String,
    default: "referral",
    enum: ["referral"],
  },
  discountValue: {
    type: Number,
    required: [true, "Discount value is required"],
    min: [0, "Discount value cannot be negative"],
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: [0, "Minimum purchase cannot be negative"],
  },
  usageLimit: {
    type: Number,
    required: [true, "Usage limit is required"],
    min: [1, "Usage limit must be at least 1"],
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, "Usage count cannot be negative"],
  },
  status: {
    type: String,
    enum: ["Active", "Expired"],
    default: "Active",
  },
  restrictions: {
    newCustomersOnly: {
      type: Boolean,
      default: true,
    },
    onePerCustomer: {
      type: Boolean,
      default: true,
    },
  },
  description: {
    type: String,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required for referral coupons"],
  },
}, { timestamps: true });

referralCouponSchema.pre("save", function (next) {
  if (this.usageCount >= this.usageLimit) {
    this.status = "Expired";
  } else {
    this.status = "Active";
  }
  next();
});

module.exports = mongoose.model("ReferralCoupon", referralCouponSchema);