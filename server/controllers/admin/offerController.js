const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const Variant = require("../../models/varients");



// const addOffer = async (req, res) => {
//   try {
//     const { productId, discountPercentage, startDate, endDate } = req.body;

//     // Validate input
//     if (!productId || discountPercentage == null || !startDate || !endDate) {
//       return res.status(400).json({ message: "productId, discountPercentage, startDate, and endDate are required" });
//     }

//     if (discountPercentage < 0 || discountPercentage > 80) {
//       return res.status(400).json({ message: "Discount percentage must be between 0 and 80" });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     if (start >= end) {
//       return res.status(400).json({ message: "startDate must be before endDate" });
//     }

//     // Find the product
//     const product = await Product.findById(productId).populate("variants");
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Update offer details
//     product.offer = {
//       discountPercentage,
//       startDate: start,
//       endDate: end,
//       isActive: true,
//     };

//     // Calculate and update salePrice based on whether the product has variants
//     if (product.variants.length === 0) {
//       // Non-variant product
//       if (!product.actualPrice) {
//         throw new Error("Non-variant product must have an actualPrice");
//       }
//       product.salePrice = product.actualPrice * (1 - discountPercentage / 100);
//     } else {
//       // Variant product: Update salePrice for each variant
//       for (const variant of product.variants) {
//         variant.salePrice = variant.actualPrice * (1 - discountPercentage / 100);
//         await Variant.findByIdAndUpdate(variant._id, {
//           salePrice: variant.salePrice,
//           updatedAt: new Date(),
//         });
//       }
//     }

//     // Save product changes
//     await product.save();

//     return res.status(200).json({ message: "Offer added successfully", product });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// const removeOffer = async (req, res) => {
//   try {
    
//     const { productId } = req.body;

//     // Validate input
//     if (!productId) {
//       return res.status(400).json({ message: "productId is required" });
//     }

//     // Find the product
//     const product = await Product.findById(productId).populate("variants");
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Check if an offer exists
//     if (!product.offer || !product.offer.isActive) {
//       return res.status(400).json({ message: "No active offer found for this product" });
//     }

//     // Remove offer
//     product.offer = undefined;

//     // Roll back salePrice to actualPrice
//     if (product.variants.length === 0) {
//       // Non-variant product
//       product.salePrice = product.actualPrice;
//     } else {
//       // Variant product: Roll back salePrice for each variant
//       for (const variant of product.variants) {
//         variant.salePrice = variant.actualPrice;
//         await Variant.findByIdAndUpdate(variant._id, {
//           salePrice: variant.actualPrice,
//           updatedAt: new Date(),
//         });
//       }
//     }

//     // Save product changes
//     await product.save();

//     return res.status(200).json({ message: "Offer removed successfully", product });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// const addCategoryOffer = async (req, res) => {
//   const { categoryId, discountPercentage, startDate, endDate } = req.body;
//   try {
//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res.status(404).json({ message: 'Category not found' });
//     }
//     category.offer = {
//       discountPercentage,
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       isActive: true,
//     };
//     await category.save();
//     res.status(200).json({ category });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// const removeCategoryOffer = async (req, res) => {
//   const { categoryId } = req.params;
//   try {
//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res.status(404).json({ message: 'Category not found' });
//     }
//     category.offer = { discountPercentage: 0, isActive: false };
//     await category.save();
//     res.status(200).json({ category });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };



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