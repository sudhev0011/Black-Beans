const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Coupon code is required"],
    unique: true,
    trim: true,
    uppercase: true,
  },
  discountType: {
    type: String,
    required: [true, "Discount type is required"],
    enum: ["percentage", "fixed", "shipping","referral"],
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
  startDate: {
    type: Date,
    required: function () {
      return this.discountType !== 'referral';
    },
  },
  endDate: {
    type: Date,
    required: function () {
      return this.discountType !== 'referral';
    },
    validate: {
      validator: function (value) {
        if (this.discountType === 'referral') return true;
        return value > this.startDate;
      },
      message: "End date must be after start date",
    },
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
    enum: ["Active", "Scheduled", "Expired"],
    default: function () {
      const now = new Date();
      if (now < this.startDate) return "Scheduled";
      if (now > this.endDate) return "Expired";
      return "Active";
    },
  },
  restrictions: {
    newCustomersOnly: {
      type: Boolean,
      default: false,
    },
    onePerCustomer: {
      type: Boolean,
      default: false,
    },
  },
  description: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

couponSchema.pre("save", function (next) {
  const now = new Date();
  if (now < this.startDate) {
    this.status = "Scheduled";
  } else if (now > this.endDate) {
    this.status = "Expired";
  } else {
    this.status = "Active";
  }
  next();
});

module.exports = mongoose.model("Coupon", couponSchema);