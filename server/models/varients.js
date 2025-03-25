const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  size: { type: Number, required: true, min: 0 }, // Numeric size (e.g., 0.5, 1, 2)
  unit: { type: String, enum: ["kg", "g"], required: true }, // Unit of measurement
  actualPrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0, default: function () { return this.actualPrice; } },
  stock: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

variantSchema.pre('save', function (next) {
  if (this.unit === "kg" && this.size > 10) {
    throw new Error("Size in kg seems unusually large");
  }
  if (this.unit === "g" && this.size > 1000) {
    throw new Error("Size in grams exceeds typical range—consider kg");
  }
  next();
});


variantSchema.index({ productId: 1 });

module.exports = mongoose.model("Variant", variantSchema);