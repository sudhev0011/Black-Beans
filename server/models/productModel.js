
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  actualPrice: { type: Number, min: 0 },
  salePrice: { type: Number, min: 0 },
  stock: { type: Number, min: 0 },
  variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
  images: [{ type: String, required: true, match: /^(https?:\/\/[^\s]+)$/ }],
  isFeatured: { type: Boolean, default: false },
  isListed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  offer: {
    discountPercentage: {
      type: Number,
      min: [0, "Discount percentage cannot be negative"],
      max: [100, "Discount percentage cannot exceed 100"],
    },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
});

// Middleware to enforce pricing/stock rules based on variants
productSchema.pre("save", function (next) {
  if (this.variants.length === 0) {
    if (this.actualPrice == null || this.stock == null) {
      throw new Error(
        "Products without variants must have actualPrice and stock defined"
      );
    }
    this.salePrice = this.salePrice ?? this.actualPrice;
  } else {
    this.actualPrice = undefined;
    this.salePrice = undefined;
    this.stock = undefined;
  }

  // Validate offer fields if offer exists
  if (this.offer && this.offer.discountPercentage != null) {
    if (!this.offer.startDate || !this.offer.endDate) {
      throw new Error("Offer must have startDate and endDate");
    }
    if (this.offer.startDate >= this.offer.endDate) {
      throw new Error("Offer startDate must be before endDate");
    }
  } else {
    // Clear offer if discountPercentage is not provided
    this.offer = undefined;
  }

  // Update updatedAt timestamp
  this.updatedAt = new Date();

  next();
});

// Virtual field for total stock
productSchema.virtual("totalStock").get(function () {
  if (this.variants.length > 0 && this.populated("variants")) {
    return this.variants.reduce((sum, v) => sum + v.stock, 0);
  }
  return this.stock;
});

// Enable virtuals in toJSON and toObject
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ category: 1, isListed: 1, name: 1 });
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
