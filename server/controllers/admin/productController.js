// const mongoose = require("mongoose");
// const Product = require("../../models/productModel");
// const Variant = require("../../models/varients");
// const { cloudinaryImageUploadMethod } = require("../../utils/cloudinary/cloudinaryUpload");
// const cloudinaryDeleteImages = require('../../utils/cloudinary/deleteImages');

// const addProduct = async (req, res) => {
//   const {
//     name,
//     description,
//     category,
//     actualPrice,
//     salePrice,
//     stock,
//     variants,
//     isFeatured,
//     isListed,
//   } = req.body;

//   const files = req.files;

//   try {
//     // --- Validation ---
//     if (!name || typeof name !== "string" || name.trim() === "") {
//       return res.status(400).json({ success: false, message: "Name is required and must be a non-empty string" });
//     }
//     if (!description || typeof description !== "string" || description.trim() === "") {
//       return res.status(400).json({ success: false, message: "Description is required and must be a non-empty string" });
//     }
//     if (!category || !mongoose.Types.ObjectId.isValid(category)) {
//       return res.status(400).json({ success: false, message: "Category is required and must be a valid ObjectId" });
//     }
//     if (!files || files.length === 0) {
//       return res.status(400).json({ success: false, message: "At least one image is required" });
//     }
    
//     const existingProduct = await Product.findOne({ name: {$regex: new RegExp(`^${name.trim()}$`, 'i') }});
//     if (existingProduct) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Product already exists. Try editing it instead." 
//       });
//     }

//     const parsedVariants = variants ? JSON.parse(variants) : [];
//     if (parsedVariants.length > 0) {
//       for (const variant of parsedVariants) {
//         const { size, unit, actualPrice, stock, salePrice } = variant;
//         if (size === undefined || typeof size !== "number" || size < 0) {
//           return res.status(400).json({ success: false, message: "Each variant must have a numeric size >= 0" });
//         }
//         if (!unit || !["kg", "g"].includes(unit)) {
//           return res.status(400).json({ success: false, message: "Each variant must have a unit of 'kg' or 'g'" });
//         }
//         if (actualPrice === undefined || typeof actualPrice !== "number" || actualPrice < 0 || actualPrice < salePrice) {
//           return res.status(400).json({ success: false, message: "Each variant must have a numeric actualPrice >= 0" });
//         }
//         if (stock === undefined || typeof stock !== "number" || stock < 0) {
//           return res.status(400).json({ success: false, message: "Each variant must have a numeric stock >= 0" });
//         }
//         if (salePrice !== undefined && (typeof salePrice !== "number" || salePrice < 0)) {
//           return res.status(400).json({ success: false, message: "salePrice must be a numeric value >= 0 if provided" });
//         }
//       }
//     } else {
//       if (actualPrice === undefined || isNaN(actualPrice) || actualPrice < 0) {
//         return res.status(400).json({ success: false, message: "actualPrice is required and must be a numeric value >= 0 for products without variants" });
//       }
//       if (stock === undefined || isNaN(stock) || stock < 0) {
//         return res.status(400).json({ success: false, message: "stock is required and must be a numeric value >= 0 for products without variants" });
//       }
//       if (salePrice !== undefined && (isNaN(salePrice) || salePrice < 0)) {
//         return res.status(400).json({ success: false, message: "salePrice must be a numeric value >= 0 if provided" });
//       }
//     }

//     const imageUrls = await Promise.all(
//       files.map((file) => cloudinaryImageUploadMethod(file.buffer))
//     );

//     let variantIds = [];
//     if (parsedVariants.length > 0) {
//       const variantDocs = parsedVariants.map((variant) => ({
//         size: variant.size,
//         unit: variant.unit,
//         actualPrice: variant.actualPrice,
//         salePrice: variant.salePrice,
//         stock: variant.stock,
//       }));
//       const createdVariants = await Variant.insertMany(variantDocs);
//       variantIds = createdVariants.map((v) => v._id);
//     }

//     const productData = {
//       name: name.trim(),
//       description: description.trim(),
//       category,
//       actualPrice: parsedVariants.length === 0 ? Number(actualPrice) : undefined,
//       salePrice: parsedVariants.length === 0 && salePrice ? Number(salePrice) : undefined,
//       stock: parsedVariants.length === 0 ? Number(stock) : undefined,
//       variants: variantIds,
//       images: imageUrls,
//       isFeatured: isFeatured === "true" || isFeatured === true,
//       isListed: isListed === "true" || isListed === true || isListed === undefined,
//     };

//     const product = new Product(productData);
//     const savedProduct = await product.save();

//     if (variantIds.length > 0) {
//       await Variant.updateMany(
//         { _id: { $in: variantIds } },
//         { productId: savedProduct._id }
//       );
//     }

//     const populatedProduct = await Product.findById(savedProduct._id)
//       .populate("variants")
//       .populate("category", "name")
//       .exec();

//     res.status(201).json({
//       success: true,
//       message: "Product added successfully",
//       product: populatedProduct,
//     });
//   } catch (error) {
//     console.error("Error adding product:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to add product",
//       error: error.message,
//     });
//   }
// };


// const showProducts = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       isListed,
//       category,
//       hasStock,
//       minPrice,
//       maxPrice,
//       sortBy = "date",
//       sortOrder = "desc",
//     } = req.query;

//     const pageNum = parseInt(page, 10);
//     const limitNum = parseInt(limit, 10);
//     const skip = (pageNum - 1) * limitNum;

//     // console.log("Received query:", req.query);

//     const query = {};
//     if (search) query.$text = { $search: search };
//     if (isListed === "true" || isListed === "false") {
//       query.isListed = isListed === "true";
//       // console.log("Applied isListed filter:", query.isListed);
//     }
//     if (category && mongoose.Types.ObjectId.isValid(category)) {
//       query.category = new mongoose.Types.ObjectId(category);
//       // console.log("Applied category filter:", query.category);
//     }

//     const pipeline = [
//       { $match: query },
//       { $lookup: { from: "variants", localField: "variants", foreignField: "_id", as: "variants" } },
//       { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
//       { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
//       {
//         $project: {
//           name: 1,
//           description: 1,
//           category: { $ifNull: ["$category", { _id: null, name: "Uncategorized" }] },
//           actualPrice: 1,
//           salePrice: 1,
//           stock: 1,
//           variants: 1,
//           images: 1,
//           isFeatured: 1,
//           isListed: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           totalStock: { $ifNull: ["$stock", { $sum: "$variants.stock" }] },
//           sortPrice: { $ifNull: ["$actualPrice", { $arrayElemAt: ["$variants.actualPrice", 0] }] },
//         },
//       },
//     ];

//     // console.log("After initial match:", await Product.aggregate([...pipeline]));

//     if (minPrice || maxPrice) {
//       const priceFilter = {};
//       if (minPrice) priceFilter.$gte = Number(minPrice);
//       if (maxPrice) priceFilter.$lte = Number(maxPrice);
//       pipeline.push({ $match: { sortPrice: priceFilter } });
//       // console.log("Applied price filter:", priceFilter);
//       // console.log("After price match:", await Product.aggregate([...pipeline]));
//     }

//     if (hasStock === "true" || hasStock === "false") {
//       const stockCondition = hasStock === "true" ? { $gt: 0 } : { $eq: 0 };
//       pipeline.push({ $match: { totalStock: stockCondition } });
//       // console.log("Applied stock filter:", stockCondition);
//     }

//     const sortOptions = {
//       "price-asc": { sortPrice: 1 },
//       "price-desc": { sortPrice: -1 },
//       "name-asc": { name: 1 },
//       "name-desc": { name: -1 },
//       "date-desc": { createdAt: -1 },
//       "date-asc": { createdAt: 1 },
//     };
//     const sortKey = `${sortBy}-${sortOrder}`;
//     const sortStage = sortOptions[sortKey] || { createdAt: -1 };
//     pipeline.push({ $sort: sortStage });
//     // console.log("Applied sort:", sortStage);

//     const countPipeline = [...pipeline, { $count: "total" }];
//     const countResult = await Product.aggregate(countPipeline);
//     const totalProducts = countResult.length > 0 ? countResult[0].total : 0;

//     pipeline.push({ $skip: skip }, { $limit: limitNum });
//     const products = await Product.aggregate(pipeline);

//     // console.log("Final products:", products);
//     // console.log("Total products count:", totalProducts);

//     const totalPages = Math.ceil(totalProducts / limitNum);

//     res.status(200).json({
//       success: true,
//       message: "Products fetched successfully",
//       products,
//       pagination: { currentPage: pageNum, totalPages, totalProducts, limit: limitNum },
//     });
//   } catch (error) {
//     console.error("Error fetching products:", error.stack);
//     res.status(500).json({ success: false, message: "Failed to fetch products", error: error.message });
//   }
// };



// const listProduct = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(400).json({ success: false, message: "Product not found" });
//     }
//     product.isListed = !product.isListed;
//     await product.save();

//     res.status(200).json({ success: true, message: "Product status changed" });
//   } catch (error) {
//     console.log("Error in updating status", error);
//     res.status(500).json({ message: "Something went wrong", error: error.message });
//   }
// };

// const showProduct = async (req, res) => {
//   const { _id } = req.params;
//   try {
//     const product = await Product.findById(_id)
//       .populate("variants")
//       .populate("category", "name isListed");
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }
//     res.status(200).json({ success: true, message: "Product details fetched", product });
//   } catch (error) {
//     console.log("Error in showing product:", error.message);
//     res.status(500).json({ message: "Fetching failed", error: error.message });
//   }
// };




// const editProduct = async (req, res) => {
//   const { name, category, actualPrice, salePrice, stock, variants, deletedImages, isFeatured, description } = req.body;
//   const files = req.files || [];
  
//   try {
//     const _id = req.body._id;
//     if (!_id) {
//       return res.status(400).json({ success: false, message: "Product ID is required" });
//     }

//     const product = await Product.findById(_id);
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }

//     const productWithSameName = await Product.findOne({ _id: { $ne: _id }, name });
//     if (productWithSameName) {
//       return res.status(400).json({ success: false, message: "Product with the same name already exists" });
//     }

//     const parsedVariants = variants ? JSON.parse(variants) : [];
//     if (parsedVariants.length > 0) {
//       for (const variant of parsedVariants) {
//         const { size, unit, actualPrice, stock, salePrice } = variant;
//         if (size === undefined || typeof size !== "number" || size < 0) {
//           return res.status(400).json({ success: false, message: "Each variant must have a numeric size >= 0" });
//         }
//         if (!unit || !["kg", "g"].includes(unit)) {
//           return res.status(400).json({ success: false, message: "Each variant must have a unit of 'kg' or 'g'" });
//         }
//         if (actualPrice === undefined || typeof actualPrice !== "number" || actualPrice < 0) {
//           return res.status(400).json({ success: false, message: "Each variant must have a numeric actualPrice >= 0" });
//         }
//         if (stock === undefined || typeof stock !== "number" || stock < 0) {
//           return res.status(400).json({ success: false, message: "Each variant must have a numeric stock >= 0" });
//         }
//         if (salePrice !== undefined && (typeof salePrice !== "number" || salePrice < 0)) {
//           return res.status(400).json({ success: false, message: "salePrice must be a numeric value >= 0 if provided" });
//         }
//       }
//     } else {
//       // Validate standalone fields when no variants are provided
//       if (actualPrice === undefined || isNaN(actualPrice) || actualPrice < 0) {
//         return res.status(400).json({ success: false, message: "actualPrice is required and must be a numeric value >= 0 for products without variants" });
//       }
//       if (stock === undefined || isNaN(stock) || stock < 0) {
//         return res.status(400).json({ success: false, message: "stock is required and must be a numeric value >= 0 for products without variants" });
//       }
//       if (salePrice !== undefined && (isNaN(salePrice) || salePrice < 0)) {
//         return res.status(400).json({ success: false, message: "salePrice must be a numeric value >= 0 if provided" });
//       }
//     }

//     // Handle image updates
//     let finalImages = product.images || [];
//     if (deletedImages) {
//       const parsedDeletedImages = Array.isArray(deletedImages) ? deletedImages : JSON.parse(deletedImages);
//       await cloudinaryDeleteImages(parsedDeletedImages);
//       finalImages = finalImages.filter((url) => !parsedDeletedImages.includes(url));
//     }
//     const newImageUrls = await Promise.all(
//       files.map((file) => cloudinaryImageUploadMethod(file.buffer))
//     );
//     finalImages = [...finalImages, ...newImageUrls];

//     // Update or replace variants
//     if (parsedVariants.length > 0) {
//       // Get existing variants
//       const existingVariants = await Variant.find({ productId: _id });
//       const existingVariantMap = new Map(
//         existingVariants.map(variant => [
//           `${variant.size}-${variant.unit}`, 
//           variant
//         ])
//       );
      
//       const variantIds = [];
      
//       // Update existing or create new variants
//       for (const variantData of parsedVariants) {
//         const variantKey = `${variantData.size}-${variantData.unit}`;
//         const existingVariant = existingVariantMap.get(variantKey);
        
//         if (existingVariant) {
//           // Update existing variant
//           existingVariant.actualPrice = variantData.actualPrice;
//           existingVariant.salePrice = variantData.salePrice || undefined;
//           existingVariant.stock = variantData.stock;
//           await existingVariant.save();
//           variantIds.push(existingVariant._id);
          
//           // Remove from map to track which ones were processed
//           existingVariantMap.delete(variantKey);
//         } else {
//           // Create new variant
//           const newVariant = await Variant.create({
//             productId: _id,
//             size: variantData.size,
//             unit: variantData.unit,
//             actualPrice: variantData.actualPrice,
//             salePrice: variantData.salePrice || undefined,
//             stock: variantData.stock,
//           });
//           variantIds.push(newVariant._id);
//         }
//       }
      
//       // Delete variants that weren't in the updated list
//       const variantsToDelete = Array.from(existingVariantMap.values()).map(v => v._id);
//       if (variantsToDelete.length > 0) {
//         await Variant.deleteMany({ _id: { $in: variantsToDelete } });
//       }
      
//       // Update product with variant references
//       product.variants = variantIds;
//       product.actualPrice = undefined;
//       product.salePrice = undefined;
//       product.totalStock = undefined; // Clear totalStock when using variants
//     } else {
//       // Update standalone fields when no variants are provided
//       product.variants = []; // Clear variants in DB
//       await Variant.deleteMany({ productId: _id }); // Remove all variants
//       product.actualPrice = Number(actualPrice);
//       product.salePrice = salePrice ? Number(salePrice) : undefined;
//       product.stock = Number(stock);
//     }
    
//     // Update product fields
//     product.name = name || product.name;
//     product.description = description || product.description;
//     product.category = category || product.category;
//     product.isFeatured = isFeatured === "true" || isFeatured === true;
//     product.images = finalImages.length > 0 ? finalImages : product.images;
    
//     const editedProduct = await product.save();

//     const populatedProduct = await Product.findById(editedProduct._id)
//       .populate("variants")
//       .populate("category", "name");

//     return res.status(200).json({
//       success: true,
//       message: "Product edited successfully",
//       product: populatedProduct,
//     });
//   } catch (error) {
//     console.error("Error editing product:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while editing the product",
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   addProduct,
//   showProducts,
//   listProduct,
//   showProduct,
//   editProduct,
// };







const mongoose = require("mongoose");
const Product = require("../../models/productModel");
const Variant = require("../../models/varients");
const Category = require("../../models/categoryModel");
const { cloudinaryImageUploadMethod } = require("../../utils/cloudinary/cloudinaryUpload");
const cloudinaryDeleteImages = require('../../utils/cloudinary/deleteImages');

// Helper function to calculate discounted price
const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  const discount = (originalPrice * discountPercentage) / 100;
  return Math.max(0, Number((originalPrice - discount).toFixed(2)));
};

// Helper function to apply the best offer
const applyBestOffer = async (productData, categoryId) => {
  let bestDiscount = 0;
  let bestOffer = null;

  // Check product offer
  if (
    productData.offer?.discountPercentage &&
    productData.offer.startDate &&
    productData.offer.endDate &&
    productData.offer.isActive &&
    new Date(productData.offer.endDate) >= new Date()
  ) {
    bestDiscount = productData.offer.discountPercentage;
    bestOffer = { ...productData.offer, type: "product" };
  }

  // Check category offer
  const category = await Category.findById(categoryId);
  if (
    category?.offer?.isActive &&
    category.offer.discountPercentage &&
    new Date(category.offer.endDate) >= new Date()
  ) {
    if (category.offer.discountPercentage > bestDiscount) {
      bestDiscount = category.offer.discountPercentage;
      bestOffer = { ...category.offer, type: "category" };
    }
  }

  // Apply the best offer
  if (bestDiscount > 0 && productData.actualPrice) {
    productData.salePrice = calculateDiscountedPrice(productData.actualPrice, bestDiscount);
    productData.offer = {
      discountPercentage: bestDiscount,
      startDate: bestOffer.startDate,
      endDate: bestOffer.endDate,
      isActive: true,
      type: bestOffer.type,
    };
  } else if (bestDiscount > 0 && productData.variants?.length > 0) {
    productData.offer = {
      discountPercentage: bestDiscount,
      startDate: bestOffer.startDate,
      endDate: bestOffer.endDate,
      isActive: true,
      type: bestOffer.type,
    };
  } else {
    productData.salePrice = productData.salePrice ?? productData.actualPrice;
    productData.offer = undefined;
  }

  return productData;
};

const addProduct = async (req, res) => {
  const {
    name,
    description,
    category,
    actualPrice,
    salePrice,
    stock,
    variants,
    isFeatured,
    isListed,
    hasOffer,
    discountPercentage,
    startDate,
    endDate,
  } = req.body;

  const files = req.files;

  try {
    // --- Validation ---
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Name is required and must be a non-empty string" });
    }
    if (!description || typeof description !== "string" || description.trim() === "") {
      return res.status(400).json({ success: false, message: "Description is required and must be a non-empty string" });
    }
    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ success: false, message: "Category is required and must be a valid ObjectId" });
    }
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one image is required" });
    }

    const existingProduct = await Product.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists. Try editing it instead."
      });
    }

    const parsedVariants = variants ? JSON.parse(variants) : [];
    if (parsedVariants.length > 0) {
      for (const variant of parsedVariants) {
        const { size, unit, actualPrice, stock, salePrice } = variant;
        if (size === undefined || typeof size !== "number" || size < 0) {
          return res.status(400).json({ success: false, message: "Each variant must have a numeric size >= 0" });
        }
        if (!unit || !["kg", "g"].includes(unit)) {
          return res.status(400).json({ success: false, message: "Each variant must have a unit of 'kg' or 'g'" });
        }
        if (actualPrice === undefined || typeof actualPrice !== "number" || actualPrice < 0) {
          return res.status(400).json({ success: false, message: "Each variant must have a numeric actualPrice >= 0" });
        }
        if (stock === undefined || typeof stock !== "number" || stock < 0) {
          return res.status(400).json({ success: false, message: "Each variant must have a numeric stock >= 0" });
        }
        if (salePrice !== undefined && (typeof salePrice !== "number" || salePrice < 0)) {
          return res.status(400).json({ success: false, message: "salePrice must be a numeric value >= 0 if provided" });
        }
      }
    } else {
      if (actualPrice === undefined || isNaN(actualPrice) || actualPrice < 0) {
        return res.status(400).json({ success: false, message: "actualPrice is required and must be a numeric value >= 0 for products without variants" });
      }
      if (stock === undefined || isNaN(stock) || stock < 0) {
        return res.status(400).json({ success: false, message: "stock is required and must be a numeric value >= 0 for products without variants" });
      }
      if (salePrice !== undefined && (isNaN(salePrice) || salePrice < 0)) {
        return res.status(400).json({ success: false, message: "salePrice must be a numeric value >= 0 if provided" });
      }
    }

    // Validate offer fields if hasOffer is true
    let offerData = {};
    if (hasOffer === "true" || hasOffer === true) {
      if (
        discountPercentage === undefined ||
        isNaN(discountPercentage) ||
        discountPercentage < 0 ||
        discountPercentage > 80
      ) {
        return res.status(400).json({ success: false, message: "discountPercentage is required and must be a number between 0 and 80" });
      }
      if (!startDate || isNaN(Date.parse(startDate))) {
        return res.status(400).json({ success: false, message: "startDate is required and must be a valid date" });
      }
      if (!endDate || isNaN(Date.parse(endDate))) {
        return res.status(400).json({ success: false, message: "endDate is required and must be a valid date" });
      }
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ success: false, message: "endDate must be after startDate" });
      }

      offerData = {
        discountPercentage: Number(discountPercentage),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      };
    }

    const imageUrls = await Promise.all(
      files.map((file) => cloudinaryImageUploadMethod(file.buffer))
    );

    let variantIds = [];
    if (parsedVariants.length > 0) {
      const variantDocs = await Promise.all(
        parsedVariants.map(async (variant) => {
          const variantData = {
            size: variant.size,
            unit: variant.unit,
            actualPrice: variant.actualPrice,
            stock: variant.stock,
          };

          // Apply best offer to variant salePrice
          if (hasOffer || (await Category.findById(category))?.offer?.isActive) {
            const tempProductData = {
              actualPrice: variant.actualPrice,
              offer: hasOffer ? offerData : undefined,
            };
            const updatedData = await applyBestOffer(tempProductData, category);
            variantData.salePrice = updatedData.salePrice;
          } else {
            variantData.salePrice = variant.salePrice;
          }

          return variantData;
        })
      );

      const createdVariants = await Variant.insertMany(variantDocs);
      variantIds = createdVariants.map((v) => v._id);
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      category,
      actualPrice: parsedVariants.length === 0 ? Number(actualPrice) : undefined,
      salePrice: parsedVariants.length === 0 && salePrice ? Number(salePrice) : undefined,
      stock: parsedVariants.length === 0 ? Number(stock) : undefined,
      variants: variantIds,
      images: imageUrls,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isListed: isListed === "true" || isListed === true || isListed === undefined,
      offer: hasOffer ? offerData : undefined,
    };

    // Apply best offer if applicable
    if (parsedVariants.length === 0) {
      const updatedProductData = await applyBestOffer(productData, category);
      productData.salePrice = updatedProductData.salePrice;
      productData.offer = updatedProductData.offer;
    }

    const product = new Product(productData);
    const savedProduct = await product.save();

    if (variantIds.length > 0) {
      await Variant.updateMany(
        { _id: { $in: variantIds } },
        { productId: savedProduct._id }
      );
    }

    const populatedProduct = await Product.findById(savedProduct._id)
      .populate("variants")
      .populate("category", "name")
      .exec();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add product",
      error: error.message,
    });
  }
};

const showProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      isListed,
      category,
      hasStock,
      minPrice,
      maxPrice,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (search) query.$text = { $search: search };
    if (isListed === "true" || isListed === "false") {
      query.isListed = isListed === "true";
    }
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = new mongoose.Types.ObjectId(category);
    }

    const pipeline = [
      { $match: query },
      { $lookup: { from: "variants", localField: "variants", foreignField: "_id", as: "variants" } },
      { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          description: 1,
          category: { $ifNull: ["$category", { _id: null, name: "Uncategorized" }] },
          actualPrice: 1,
          salePrice: 1,
          stock: 1,
          variants: 1,
          images: 1,
          isFeatured: 1,
          isListed: 1,
          createdAt: 1,
          updatedAt: 1,
          offer: 1,
          totalStock: { $ifNull: ["$stock", { $sum: "$variants.stock" }] },
          sortPrice: { $ifNull: ["$actualPrice", { $arrayElemAt: ["$variants.actualPrice", 0] }] },
        },
      },
    ];

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      pipeline.push({ $match: { sortPrice: priceFilter } });
    }

    if (hasStock === "true" || hasStock === "false") {
      const stockCondition = hasStock === "true" ? { $gt: 0 } : { $eq: 0 };
      pipeline.push({ $match: { totalStock: stockCondition } });
    }

    const sortOptions = {
      "price-asc": { sortPrice: 1 },
      "price-desc": { sortPrice: -1 },
      "name-asc": { name: 1 },
      "name-desc": { name: -1 },
      "date-desc": { createdAt: -1 },
      "date-asc": { createdAt: 1 },
    };
    const sortKey = `${sortBy}-${sortOrder}`;
    const sortStage = sortOptions[sortKey] || { createdAt: -1 };
    pipeline.push({ $sort: sortStage });

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Product.aggregate(countPipeline);
    const totalProducts = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push({ $skip: skip }, { $limit: limitNum });
    const products = await Product.aggregate(pipeline);

    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
      pagination: { currentPage: pageNum, totalPages, totalProducts, limit: limitNum },
    });
  } catch (error) {
    console.error("Error fetching products:", error.stack);
    res.status(500).json({ success: false, message: "Failed to fetch products", error: error.message });
  }
};

const listProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(400).json({ success: false, message: "Product not found" });
    }
    product.isListed = !product.isListed;
    await product.save();

    res.status(200).json({ success: true, message: "Product status changed" });
  } catch (error) {
    console.log("Error in updating status", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

const showProduct = async (req, res) => {
  const { _id } = req.params;
  try {
    const product = await Product.findById(_id)
      .populate("variants")
      .populate("category", "name isListed");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Product details fetched", product });
  } catch (error) {
    console.log("Error in showing product:", error.message);
    res.status(500).json({ message: "Fetching failed", error: error.message });
  }
};

const editProduct = async (req, res) => {
  const {
    name,
    category,
    actualPrice,
    salePrice,
    stock,
    variants,
    deletedImages,
    isFeatured,
    description,
    hasOffer,
    discountPercentage,
    startDate,
    endDate,
  } = req.body;
  const files = req.files || [];

  try {
    const _id = req.body._id;
    if (!_id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(_id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const productWithSameName = await Product.findOne({ _id: { $ne: _id }, name });
    if (productWithSameName) {
      return res.status(400).json({ success: false, message: "Product with the same name already exists" });
    }

    const parsedVariants = variants ? JSON.parse(variants) : [];
    if (parsedVariants.length > 0) {
      for (const variant of parsedVariants) {
        const { size, unit, actualPrice, stock, salePrice } = variant;
        if (size === undefined || typeof size !== "number" || size < 0) {
          return res.status(400).json({ success: false, message: "Each variant must have a numeric size >= 0" });
        }
        if (!unit || !["kg", "g"].includes(unit)) {
          return res.status(400).json({ success: false, message: "Each variant must have a unit of 'kg' or 'g'" });
        }
        if (actualPrice === undefined || typeof actualPrice !== "number" || actualPrice < 0) {
          return res.status(400).json({ success: false, message: "Each variant must have a numeric actualPrice >= 0" });
        }
        if (stock === undefined || typeof stock !== "number" || stock < 0) {
          return res.status(400).json({ success: false, message: "Each variant must have a numeric stock >= 0" });
        }
        if (salePrice !== undefined && (typeof salePrice !== "number" || salePrice < 0)) {
          return res.status(400).json({ success: false, message: "salePrice must be a numeric value >= 0 if provided" });
        }
      }
    } else {
      if (actualPrice === undefined || isNaN(actualPrice) || actualPrice < 0) {
        return res.status(400).json({ success: false, message: "actualPrice is required and must be a numeric value >= 0 for products without variants" });
      }
      if (stock === undefined || isNaN(stock) || stock < 0) {
        return res.status(400).json({ success: false, message: "stock is required and must be a numeric value >= 0 for products without variants" });
      }
      if (salePrice !== undefined && (isNaN(salePrice) || salePrice < 0)) {
        return res.status(400).json({ success: false, message: "salePrice must be a numeric value >= 0 if provided" });
      }
    }

    // Validate offer fields if hasOffer is true
    let offerData = product.offer || {};
    if (hasOffer === "true" || hasOffer === true) {
      if (
        discountPercentage === undefined ||
        isNaN(discountPercentage) ||
        discountPercentage < 0 ||
        discountPercentage > 100
      ) {
        return res.status(400).json({ success: false, message: "discountPercentage is required and must be a number between 0 and 100" });
      }
      if (!startDate || isNaN(Date.parse(startDate))) {
        return res.status(400).json({ success: false, message: "startDate is required and must be a valid date" });
      }
      if (!endDate || isNaN(Date.parse(endDate))) {
        return res.status(400).json({ success: false, message: "endDate is required and must be a valid date" });
      }
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ success: false, message: "endDate must be after startDate" });
      }

      offerData = {
        discountPercentage: Number(discountPercentage),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      };
    } else {
      offerData = undefined;
    }

    // Handle image updates
    let finalImages = product.images || [];
    if (deletedImages) {
      const parsedDeletedImages = Array.isArray(deletedImages) ? deletedImages : JSON.parse(deletedImages);
      await cloudinaryDeleteImages(parsedDeletedImages);
      finalImages = finalImages.filter((url) => !parsedDeletedImages.includes(url));
    }
    const newImageUrls = await Promise.all(
      files.map((file) => cloudinaryImageUploadMethod(file.buffer))
    );
    finalImages = [...finalImages, ...newImageUrls];

    // Update or replace variants
    if (parsedVariants.length > 0) {
      const existingVariants = await Variant.find({ productId: _id });
      const existingVariantMap = new Map(
        existingVariants.map(variant => [
          `${variant.size}-${variant.unit}`,
          variant
        ])
      );

      const variantIds = [];

      for (const variantData of parsedVariants) {
        const variantKey = `${variantData.size}-${variantData.unit}`;
        const existingVariant = existingVariantMap.get(variantKey);

        const variantUpdate = {
          size: variantData.size,
          unit: variantData.unit,
          actualPrice: variantData.actualPrice,
          stock: variantData.stock,
        };

        // Apply best offer to variant salePrice
        if (hasOffer || (await Category.findById(category || product.category))?.offer?.isActive) {
          const tempProductData = {
            actualPrice: variantData.actualPrice,
            offer: hasOffer ? offerData : undefined,
          };
          const updatedData = await applyBestOffer(tempProductData, category || product.category);
          variantUpdate.salePrice = updatedData.salePrice;
        } else {
          variantUpdate.salePrice = variantData.salePrice || undefined;
        }

        if (existingVariant) {
          existingVariant.actualPrice = variantUpdate.actualPrice;
          existingVariant.salePrice = variantUpdate.salePrice;
          existingVariant.stock = variantUpdate.stock;
          await existingVariant.save();
          variantIds.push(existingVariant._id);
          existingVariantMap.delete(variantKey);
        } else {
          const newVariant = await Variant.create({
            productId: _id,
            ...variantUpdate,
          });
          variantIds.push(newVariant._id);
        }
      }

      const variantsToDelete = Array.from(existingVariantMap.values()).map(v => v._id);
      if (variantsToDelete.length > 0) {
        await Variant.deleteMany({ _id: { $in: variantsToDelete } });
      }

      product.variants = variantIds;
      product.actualPrice = undefined;
      product.salePrice = undefined;
      product.stock = undefined;
    } else {
      product.variants = [];
      await Variant.deleteMany({ productId: _id });
      product.actualPrice = Number(actualPrice);
      product.stock = Number(stock);
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.isFeatured = isFeatured === "true" || isFeatured === true;
    product.images = finalImages.length > 0 ? finalImages : product.images;
    product.offer = offerData;

    // Apply best offer if no variants
    if (parsedVariants.length === 0) {
      const updatedProductData = await applyBestOffer(product, product.category);
      product.salePrice = updatedProductData.salePrice;
      product.offer = updatedProductData.offer;
    }

    const editedProduct = await product.save();

    const populatedProduct = await Product.findById(editedProduct._id)
      .populate("variants")
      .populate("category", "name");

    return res.status(200).json({
      success: true,
      message: "Product edited successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Error editing product:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while editing the product",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  showProducts,
  listProduct,
  showProduct,
  editProduct,
};