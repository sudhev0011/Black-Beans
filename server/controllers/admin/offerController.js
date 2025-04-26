// const Category = require("../../models/categoryModel");
// const Product = require("../../models/productModel");
// const Variant = require("../../models/varients");

// // Helper function to update product prices based on category offer
// const updateProductPrices = async (categoryId, discountPercentage) => {
//     try {
//         // Find all listed products in the category
//         const products = await Product.find({ category: categoryId, isListed: true }).populate("variants");

//         for (const product of products) {
//             if (product.variants.length > 0) {
//                 // Product has variants: update each variant's salePrice
//                 for (const variantId of product.variants) {
//                     const variant = await Variant.findById(variantId);
//                     if (variant) {
//                         const discount = (variant.salePrice * discountPercentage) / 100;
//                         variant.salePrice = variant.salePrice - discount;
//                         await variant.save();   
//                     }
//                 }
//             } else {
//                 // Non-variant product: update product's salePrice
//                 const discount = (product.salePrice * discountPercentage) / 100;
//                 product.salePrice = product.salePrice - discount;
//                 await product.save();
//             }
//         }
//     } catch (error) {
//         throw new Error(`Failed to update product prices: ${error.message}`);
//     }
// };

// // Create or update an offer for a category 
// const createCategoryOffer = async (req, res) => {
//     try {
//         const { categoryId, discountPercentage, startDate, endDate } = req.body;

//         if (!categoryId || discountPercentage == null || !startDate || !endDate) {
//             return res.status(400).json({ message: "Category ID, discount percentage, start date, and end date are required" });
//         }

//         const category = await Category.findById(categoryId);
//         if (!category) {
//             return res.status(404).json({ message: "Category not found" });
//         }

//         category.offer = {
//             discountPercentage,
//             startDate: new Date(startDate),
//             endDate: new Date(endDate),
//             isActive: true
//         };

//         await category.save();

//         // Update prices of all products in the category
//         await updateProductPrices(categoryId, discountPercentage);

//         res.status(200).json({ message: "Offer applied to category and product prices updated successfully", category });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Update an existing category offer
// const updateCategoryOffer = async (req, res) => {
//     try {
//         const { categoryId } = req.params;
//         const { discountPercentage, startDate, endDate, isActive } = req.body;

//         const category = await Category.findById(categoryId);
//         if (!category) {
//             return res.status(404).json({ message: "Category not found" });
//         }

//         category.offer = {
//             discountPercentage: discountPercentage ?? category.offer.discountPercentage,
//             startDate: startDate ? new Date(startDate) : category.offer.startDate,
//             endDate: endDate ? new Date(endDate) : category.offer.endDate,
//             isActive: isActive ?? category.offer.isActive
//         };

//         await category.save();

//         // Update product prices if discountPercentage or isActive changed
//         if (discountPercentage !== undefined || isActive !== undefined) {
//             const effectiveDiscount = category.offer.isActive ? category.offer.discountPercentage : 0;
//             await updateProductPrices(categoryId, effectiveDiscount);
//         }

//         res.status(200).json({ message: "Category offer updated and product prices adjusted successfully", category });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Delete (deactivate) a category offer
// const deleteCategoryOffer = async (req, res) => {
//     try {
//         const { categoryId } = req.params;

//         const category = await Category.findById(categoryId);
//         if (!category) {
//             return res.status(404).json({ message: "Category not found" });
//         }

//         category.offer = {
//             discountPercentage: 0,
//             startDate: undefined,
//             endDate: undefined,
//             isActive: false
//         };

//         await category.save();

//         // Reset product prices (remove discount)
//         await updateProductPrices(categoryId, 0);

//         res.status(200).json({ message: "Category offer removed and product prices reset successfully" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// module.exports = {
//     createCategoryOffer,
//     updateCategoryOffer,
//     deleteCategoryOffer
// };












// const mongoose = require("mongoose");
// const Product = require("../../models/productModel");
// const Category = require("../../models/categoryModel");
// const Variant = require("../../models/varients");

// // Helper function to update product salePrice based on best offer
// const updateProductSalePrice = async (productId) => {
//   const product = await Product.findById(productId)
//     .populate("category")
//     .populate("variants");
//   if (!product) throw new Error("Product not found");

//   let bestDiscount = 0;
//   let bestOffer = null;

//   // Check product offer
//   if (product.offer?.isActive && new Date(product.offer.endDate) >= new Date()) {
//     bestDiscount = product.offer.discountPercentage;
//     bestOffer = { ...product.offer, type: "product" };
//   }

//   // Check category offer
//   if (
//     product.category?.offer?.isActive &&
//     new Date(product.category.offer.endDate) >= new Date()
//   ) {
//     if (product.category.offer.discountPercentage > bestDiscount) {
//       bestDiscount = product.category.offer.discountPercentage;
//       bestOffer = { ...product.category.offer, type: "category" };
//     }
//   }

//   // Update salePrice based on best offer
//   if (bestDiscount > 0) {
//     if (product.variants.length > 0) {
//       const updatedVariants = product.variants.map((variant) => {
//         // Use current salePrice to calculate new salePrice
//         const currentSalePrice = variant.salePrice || variant.actualPrice;
//         const originalPrice = currentSalePrice / (1 - (bestDiscount / 100));
//         const newSalePrice = originalPrice * (1 - bestDiscount / 100);
//         return {
//           ...variant.toObject(),
//           salePrice: Number(Math.max(0, newSalePrice).toFixed(2)),
//         };
//       });
//       await Variant.updateMany(
//         { _id: { $in: product.variants.map((v) => v._id) } },
//         { $set: { salePrice: updatedVariants.map((v) => v.salePrice) } }
//       );
//     } else {
//       // Use current salePrice to calculate new salePrice
//       const currentSalePrice = product.salePrice || product.actualPrice;
//       const originalPrice = currentSalePrice / (1 - (bestDiscount / 100));
//       const newSalePrice = originalPrice * (1 - bestDiscount / 100);
//       product.salePrice = Number(Math.max(0, newSalePrice).toFixed(2));
//     }
//     product.offer = {
//       discountPercentage: bestDiscount,
//       startDate: bestOffer.startDate,
//       endDate: bestOffer.endDate,
//       isActive: true,
//       type: bestOffer.type,
//     };
//   } else {
//     // No active offer: preserve existing salePrice
//     product.offer = undefined;
//   }

//   await product.save();
//   return product;
// };

// // Create a product offer
// const createProductOffer = async (req, res) => {
//   const { productId, discountPercentage, startDate, endDate } = req.body;

//   try {
//     // Validation
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid product ID" });
//     }
//     if (
//       !discountPercentage ||
//       isNaN(discountPercentage) ||
//       discountPercentage < 0 ||
//       discountPercentage > 100
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid discount percentage" });
//     }
//     if (!startDate || isNaN(Date.parse(startDate))) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid start date" });
//     }
//     if (!endDate || isNaN(Date.parse(endDate))) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid end date" });
//     }
//     if (new Date(startDate) >= new Date(endDate)) {
//       return res.status(400).json({
//         success: false,
//         message: "End date must be after start date",
//       });
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });
//     }

//     // Check for existing offer
//     if (
//       product.offer?.isActive &&
//       new Date(product.offer.endDate) >= new Date()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "An active offer already exists for this product",
//       });
//     }

//     // Set product offer
//     product.offer = {
//       discountPercentage: Number(discountPercentage),
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       isActive: true,
//     };

//     // Update salePrice based on best offer
//     const updatedProduct = await updateProductSalePrice(productId);

//     res.status(201).json({
//       success: true,
//       message: "Product offer created successfully",
//       product: updatedProduct,
//     });
//   } catch (error) {
//     console.error("Error creating product offer:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create product offer",
//       error: error.message,
//     });
//   }
// };

// // Update a product offer
// const updateProductOffer = async (req, res) => {
//   const { productId, discountPercentage, startDate, endDate, isActive } =
//     req.body;

//   try {
//     // Validation
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid product ID" });
//     }
//     if (
//       discountPercentage !== undefined &&
//       (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100)
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid discount percentage" });
//     }
//     if (startDate && isNaN(Date.parse(startDate))) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid start date" });
//     }
//     if (endDate && isNaN(Date.parse(endDate))) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid end date" });
//     }
//     if (
//       startDate &&
//       endDate &&
//       new Date(startDate) >= new Date(endDate)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "End date must be after start date",
//       });
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });
//     }

//     if (!product.offer) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No existing offer to update" });
//     }

//     // Update offer fields
//     product.offer.discountPercentage =
//       discountPercentage !== undefined
//         ? Number(discountPercentage)
//         : product.offer.discountPercentage;
//     product.offer.startDate = startDate
//       ? new Date(startDate)
//       : product.offer.startDate;
//     product.offer.endDate = endDate
//       ? new Date(endDate)
//       : product.offer.endDate;
//     product.offer.isActive =
//       isActive !== undefined ? isActive : product.offer.isActive;

//     // Update salePrice based on best offer
//     const updatedProduct = await updateProductSalePrice(productId);

//     res.status(200).json({
//       success: true,
//       message: "Product offer updated successfully",
//       product: updatedProduct,
//     });
//   } catch (error) {
//     console.error("Error updating product offer:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update product offer",
//       error: error.message,
//     });
//   }
// };

// // Delete a product offer
// const deleteProductOffer = async (req, res) => {
//   const { productId } = req.params;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid product ID" });
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });
//     }

//     if (product.offer?.discountPercentage) {
//       // Reverse the discount to restore salePrice
//       if (product.variants.length > 0) {
//         const updatedVariants = product.variants.map((variant) => {
//           const currentSalePrice = variant.salePrice || variant.actualPrice;
//           const discount = product.offer.discountPercentage;
//           const originalPrice = currentSalePrice / (1 - discount / 100);
//           return {
//             ...variant.toObject(),
//             salePrice: Number(Math.max(0, originalPrice).toFixed(2)),
//           };
//         });
//         await Variant.updateMany(
//           { _id: { $in: product.variants.map((v) => v._id) } },
//           { $set: { salePrice: updatedVariants.map((v) => v.salePrice) } }
//         );
//       } else {
//         const currentSalePrice = product.salePrice || product.actualPrice;
//         const discount = product.offer.discountPercentage;
//         const originalPrice = currentSalePrice / (1 - discount / 100);
//         product.salePrice = Number(Math.max(0, originalPrice).toFixed(2));
//       }
//     }

//     // Clear product offer
//     product.offer = undefined;

//     // Update salePrice based on remaining offers (e.g., category offer)
//     const updatedProduct = await updateProductSalePrice(productId);

//     res.status(200).json({
//       success: true,
//       message: "Product offer deleted successfully",
//       product: updatedProduct,
//     });
//   } catch (error) {
//     console.error("Error deleting product offer:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete product offer",
//       error: error.message,
//     });
//   }
// };

// // Create a category offer
// const createCategoryOffer = async (req, res) => {
//   const { categoryId, discountPercentage, startDate, endDate } = req.body;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid category ID" });
//     }
//     if (
//       !discountPercentage ||
//       isNaN(discountPercentage) ||
//       discountPercentage < 0 ||
//       discountPercentage > 100
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid discount percentage" });
//     }
//     if (!startDate || isNaN(Date.parse(startDate))) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid start date" });
//     }
//     if (!endDate || isNaN(Date.parse(endDate))) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid end date" });
//     }
//     if (new Date(startDate) >= new Date(endDate)) {
//       return res.status(400).json({
//         success: false,
//         message: "End date must be after start date",
//       });
//     }

//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Category not found" });
//     }

//     // Check for existing offer
//     if (
//       category.offer?.isActive &&
//       new Date(category.offer.endDate) >= new Date()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "An active offer already exists for this category",
//       });
//     }

//     category.offer = {
//       discountPercentage: Number(discountPercentage),
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       isActive: true,
//     };

//     await category.save();

//     // Update all products in the category
//     const products = await Product.find({ category: categoryId });
//     const updatedProducts = await Promise.all(
//       products.map((product) => updateProductSalePrice(product._id))
//     );

//     res.status(201).json({
//       success: true,
//       message: "Category offer created successfully",
//       category,
//       updatedProducts,
//     });
//   } catch (error) {
//     console.error("Error creating category offer:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create category offer",
//       error: error.message,
//     });
//   }
// };

// // Update a category offer
// const updateCategoryOffer = async (req, res) => {
//   const {  discountPercentage, startDate, endDate, isActive } =
//     req.body;
//     const {categoryId} = req.params
//   try {
//     if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid category ID" });
//     }
//     if (
//       discountPercentage !== undefined &&
//       (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100)
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid discount percentage" });
//     }
//     if (startDate && isNaN(Date.parse(startDate))) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid start date" });
//     }
//     if (endDate && isNaN(Date.parse(endDate))) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid end date" });
//     }
//     if (
//       startDate &&
//       endDate &&
//       new Date(startDate) >= new Date(endDate)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "End date must be after start date",
//       });
//     }

//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Category not found" });
//     }

//     if (!category.offer) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No existing offer to update" });
//     }

//     // Update offer fields
//     category.offer.discountPercentage =
//       discountPercentage !== undefined
//         ? Number(discountPercentage)
//         : category.offer.discountPercentage;
//     category.offer.startDate = startDate
//       ? new Date(startDate)
//       : category.offer.startDate;
//     category.offer.endDate = endDate
//       ? new Date(endDate)
//       : category.offer.endDate;
//     category.offer.isActive =
//       isActive !== undefined ? isActive : category.offer.isActive;

//     await category.save();

//     // Update all products in the category
//     const products = await Product.find({ category: categoryId });
//     const updatedProducts = await Promise.all(
//       products.map((product) => updateProductSalePrice(product._id))
//     );

//     res.status(200).json({
//       success: true,
//       message: "Category offer updated successfully",
//       category,
//       updatedProducts,
//     });
//   } catch (error) {
//     console.error("Error updating category offer:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update category offer",
//       error: error.message,
//     });
//   }
// };

// // Delete a category offer
// const deleteCategoryOffer = async (req, res) => {
//   const { categoryId } = req.params;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid category ID" });
//     }

//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Category not found" });
//     }

//     if (category.offer?.discountPercentage) {
//       // Reverse the discount for all products in the category
//       const products = await Product.find({ category: categoryId }).populate("variants");
//       await Promise.all(
//         products.map(async (product) => {
//           if (product.variants.length > 0) {
//             const updatedVariants = product.variants.map((variant) => {
//               const currentSalePrice = variant.salePrice || variant.actualPrice;
//               const discount = category.offer.discountPercentage;
//               const originalPrice = currentSalePrice / (1 - discount / 100);
//               return {
//                 ...variant.toObject(),
//                 salePrice: Number(Math.max(0, originalPrice).toFixed(2)),
//               };
//             });
//             await Variant.updateMany(
//               { _id: { $in: product.variants.map((v) => v._id) } },
//               { $set: { salePrice: updatedVariants.map((v) => v.salePrice) } }
//             );
//           } else {
//             const currentSalePrice = product.salePrice || product.actualPrice;
//             const discount = category.offer.discountPercentage;
//             const originalPrice = currentSalePrice / (1 - discount / 100);
//             product.salePrice = Number(Math.max(0, originalPrice).toFixed(2));
//           }
//           await product.save();
//         })
//       );
//     }

//     category.offer = undefined;
//     await category.save();

//     // Update all products in the category
//     const products = await Product.find({ category: categoryId });
//     const updatedProducts = await Promise.all(
//       products.map((product) => updateProductSalePrice(product._id))
//     );

//     res.status(200).json({
//       success: true,
//       message: "Category offer deleted successfully",
//       category,
//       updatedProducts,
//     });
//   } catch (error) {
//     console.error("Error deleting category offer:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete category offer",
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   createProductOffer,
//   updateProductOffer,
//   deleteProductOffer,
//   createCategoryOffer,
//   updateCategoryOffer,
//   deleteCategoryOffer,
// };






const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const Variant = require("../../models/varients");

// Track original prices to restore them when offers are removed
const priceCache = new Map();

// Helper function to calculate discounted price
const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  const discount = (originalPrice * discountPercentage) / 100;
  return originalPrice - discount;
};

// Helper function to update product prices based on category offer
const updateProductPrices = async (categoryId, discountPercentage) => {
  try {
    // Find all listed products in the category
    const products = await Product.find({ category: categoryId, isListed: true });

    for (const product of products) {
      const productCacheKey = `product_${product._id}`;
      
      if (product.variants && product.variants.length > 0) {
        // Product has variants: update each variant's salePrice
        for (const variantId of product.variants) {
          const variant = await Variant.findById(variantId);
          if (!variant) continue;
          
          const variantCacheKey = `variant_${variant._id}`;
          
          // If adding/updating an offer
          if (discountPercentage > 0) {
            // Cache the original price if not already cached
            if (!priceCache.has(variantCacheKey)) {
              priceCache.set(variantCacheKey, variant.salePrice);
            }
            
            // Calculate and set the new sale price
            variant.salePrice = calculateDiscountedPrice(
              priceCache.get(variantCacheKey), 
              discountPercentage
            );
          } 
          // If removing an offer
          else {
            // Restore the original price if cached
            if (priceCache.has(variantCacheKey)) {
              variant.salePrice = priceCache.get(variantCacheKey);
              priceCache.delete(variantCacheKey);
            }
          }
          
          await variant.save();
        }
      } else {
        // Non-variant product: update product's salePrice
        // If adding/updating an offer
        if (discountPercentage > 0) {
          // Cache the original price if not already cached
          if (!priceCache.has(productCacheKey)) {
            priceCache.set(productCacheKey, product.salePrice);
          }
          
          // Calculate and set the new sale price
          product.salePrice = calculateDiscountedPrice(
            priceCache.get(productCacheKey), 
            discountPercentage
          );
        } 
        // If removing an offer
        else {
          // Restore the original price if cached
          if (priceCache.has(productCacheKey)) {
            product.salePrice = priceCache.get(productCacheKey);
            priceCache.delete(productCacheKey);
          }
        }
        
        await product.save();
      }
    }
  } catch (error) {
    throw new Error(`Failed to update product prices: ${error.message}`);
  }
};

// Create a new offer for a category
const createCategoryOffer = async (req, res) => {
  try {
    const { categoryId, discountPercentage, startDate, endDate } = req.body;

    if (!categoryId || discountPercentage == null || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Category ID, discount percentage, start date, and end date are required" 
      });
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount percentage must be between 0 and 100"
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    // Check if dates are valid
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const now = new Date();

    if (startDateObj > endDateObj) {
      return res.status(400).json({ 
        success: false, 
        message: "Start date cannot be after end date" 
      });
    }

    category.offer = {
      discountPercentage,
      startDate: startDateObj,
      endDate: endDateObj,
      isActive: true
    };

    await category.save();

    // Update prices of all products in the category
    await updateProductPrices(categoryId, discountPercentage);

    res.status(201).json({ 
      success: true, 
      message: "Offer applied to category and product prices updated successfully", 
      category 
    });
  } catch (error) {
    console.error("Error creating category offer:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "An error occurred while creating the offer" 
    });
  }
};

// Update an existing category offer
const updateCategoryOffer = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { discountPercentage, startDate, endDate, isActive } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    // Store previous offer state to determine if price update is needed
    const previousDiscount = category.offer?.discountPercentage || 0;
    const previousActive = category.offer?.isActive || false;

    // Update offer details
    category.offer = {
      discountPercentage: discountPercentage ?? category.offer?.discountPercentage ?? 0,
      startDate: startDate ? new Date(startDate) : category.offer?.startDate,
      endDate: endDate ? new Date(endDate) : category.offer?.endDate,
      isActive: isActive !== undefined ? isActive : category.offer?.isActive ?? false
    };

    await category.save();

    // Determine if product prices need updating
    const shouldUpdatePrices = (
      previousDiscount !== category.offer.discountPercentage || 
      previousActive !== category.offer.isActive
    );

    if (shouldUpdatePrices) {
      const effectiveDiscount = category.offer.isActive ? category.offer.discountPercentage : 0;
      await updateProductPrices(categoryId, effectiveDiscount);
    }

    res.status(200).json({ 
      success: true, 
      message: "Category offer updated successfully", 
      category 
    });
  } catch (error) {
    console.error("Error updating category offer:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "An error occurred while updating the offer" 
    });
  }
};

// Delete (deactivate) a category offer
const deleteCategoryOffer = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    // Store the category had an active offer before deletion
    const hadActiveOffer = category.offer?.isActive || false;

    // Reset the offer
    category.offer = {
      discountPercentage: 0,
      startDate: null,
      endDate: null,
      isActive: false
    };

    await category.save();

    // Only update product prices if the offer was active
    if (hadActiveOffer) {
      await updateProductPrices(categoryId, 0);
    }

    res.status(200).json({ 
      success: true, 
      message: "Category offer removed and product prices reset successfully" 
    });
  } catch (error) {
    console.error("Error deleting category offer:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "An error occurred while removing the offer" 
    });
  }
};

// Get all category offers (useful for admin dashboard)
const getAllCategoryOffers = async (req, res) => {
  try {
    const categories = await Category.find({ 'offer.isActive': true })
      .select('name offer');
    
    res.status(200).json({
      success: true,
      offers: categories
    });
  } catch (error) {
    console.error("Error fetching category offers:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching offers"
    });
  }
};

module.exports = {
  createCategoryOffer,
  updateCategoryOffer,
  deleteCategoryOffer,
  getAllCategoryOffers
};