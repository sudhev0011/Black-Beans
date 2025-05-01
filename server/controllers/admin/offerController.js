const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const Variant = require("../../models/varients");

function calculateBestDiscount(product, category) {
  const now = new Date();
  let productDiscount = 0;
  let categoryDiscount = 0;

  if (
    product.offer &&
    product.offer.isActive &&
    product.offer.startDate <= now &&
    product.offer.endDate >= now
  ) {
    productDiscount = product.offer.discountPercentage;
  }

  if (
    category &&
    category.offer &&
    category.offer.isActive &&
    category.offer.startDate <= now &&
    category.offer.endDate >= now
  ) {
    categoryDiscount = category.offer.discountPercentage;
  }

  const bestDiscount = Math.max(productDiscount, categoryDiscount);

  return {
    bestDiscount,
    source: productDiscount > categoryDiscount ? "product" : "category",
  };
}


const addOffer = async (req, res) => {
  try {
    const { productId, discountPercentage, startDate, endDate } = req.body;

    if (!productId || discountPercentage == null || !startDate || !endDate) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (discountPercentage < 0 || discountPercentage > 80) {
      return res.status(400).json({ message: "Discount must be between 0 and 80" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: "startDate must be before endDate" });
    }

    const product = await Product.findById(productId).populate("variants category");
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.offer = {
      discountPercentage,
      startDate: start,
      endDate: end,
      isActive: true,
    };

    const { bestDiscount } = calculateBestDiscount(product, product.category);

    if (product.variants.length === 0) {
      product.salePrice = product.actualPrice * (1 - bestDiscount / 100);
    } else {
      for (const variant of product.variants) {
        const updatedPrice = variant.actualPrice * (1 - bestDiscount / 100);
        variant.salePrice = updatedPrice;
        await Variant.findByIdAndUpdate(variant._id, {
          salePrice: updatedPrice,
          updatedAt: new Date(),
        });
      }
    }

    await product.save();
    res.status(200).json({ message: "Offer added", product });
  } catch (error) {
    console.log("Error adding offer:", error);
    res.status(500).json({ message: error.message });
  }
};

const removeOffer = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId is required" });

    const product = await Product.findById(productId).populate("variants category");
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.offer = undefined;

    const { bestDiscount } = calculateBestDiscount(product, product.category);

    if (product.variants.length === 0) {
      product.salePrice = product.actualPrice * (1 - bestDiscount / 100);
    } else {
      for (const variant of product.variants) {
        const updatedPrice = variant.actualPrice * (1 - bestDiscount / 100);
        variant.salePrice = updatedPrice;
        await Variant.findByIdAndUpdate(variant._id, {
          salePrice: updatedPrice,
          updatedAt: new Date(),
        });
      }
    }

    await product.save();
    res.status(200).json({ message: "Offer removed", product });
  } catch (error) {
    console.log("Error removing offer:", error);
    res.status(500).json({ message: error.message });
  }
};

const addCategoryOffer = async (req, res) => {
  const { categoryId, discountPercentage, startDate, endDate } = req.body;
  try {
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.offer = {
      discountPercentage,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true,
    };
    await category.save();

    const products = await Product.find({ category: categoryId }).populate("variants");

    for (const product of products) {
      const { bestDiscount } = await calculateBestDiscount(product, category);

      if (product.variants.length === 0) {
        product.salePrice = product.actualPrice * (1 - bestDiscount / 100);
      } else {
        for (const variant of product.variants) {
          const updatedPrice = variant.actualPrice * (1 - bestDiscount / 100);
          variant.salePrice = updatedPrice;
          await Variant.findByIdAndUpdate(variant._id, {
            salePrice: updatedPrice,
            updatedAt: new Date(),
          });
        }
      }

      await product.save();
    }

    res.status(200).json({ message: "Category offer applied", category });
  } catch (error) {
    console.log("Error adding category offer:", error);
    res.status(400).json({ message: error.message });
  }
};

const removeCategoryOffer = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.offer = undefined;
    await category.save();

    const products = await Product.find({ category: categoryId }).populate("variants category");

    for (const product of products) {
      const { bestDiscount } = calculateBestDiscount(product, category);

      if (product.variants.length === 0) {
        product.salePrice = product.actualPrice * (1 - bestDiscount / 100);
      } else {
        for (const variant of product.variants) {
          const updatedPrice = variant.actualPrice * (1 - bestDiscount / 100);
          variant.salePrice = updatedPrice;
          await Variant.findByIdAndUpdate(variant._id, {
            salePrice: updatedPrice,
            updatedAt: new Date(),
          });
        }
      }

      await product.save();
    }

    res.status(200).json({ message: "Category offer removed", category });
  } catch (error) {
    console.log("Error removing category offer:", error); 
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addOffer,
  removeOffer,
  removeCategoryOffer,
  addCategoryOffer
};