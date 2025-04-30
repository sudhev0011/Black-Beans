const mongoose = require("mongoose");
const Product = require("../../models/productModel");
const Variant = require("../../models/varients");
const { cloudinaryImageUploadMethod } = require("../../utils/cloudinary/cloudinaryUpload");
const cloudinaryDeleteImages = require('../../utils/cloudinary/deleteImages');

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
    
    const existingProduct = await Product.findOne({ name: {$regex: new RegExp(`^${name.trim()}$`, 'i') }});

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
        if (actualPrice === undefined || typeof actualPrice !== "number" || actualPrice < 0 || actualPrice < salePrice) {
          return res.status(400).json({ success: false, message: "Each variant must have a numeric actualPrice >= 0 or sale price" });
        }
        if (stock === undefined || typeof stock !== "number" || stock < 0) {
          return res.status(400).json({ success: false, message: "Each variant must have a numeric stock >= 0" });
        }
        if (salePrice !== undefined && (typeof salePrice !== "number" || salePrice < 0)) {
          return res.status(400).json({ success: false, message: "salePrice must be a numeric value >= 0 if provided" });
        }
      }
    } else {
      if (actualPrice === undefined || isNaN(actualPrice) || actualPrice < 0 || actualPrice < salePrice) {
        return res.status(400).json({ success: false, message: "actualPrice is required and must be a numeric value >= 0 or sale price" });
      }
      if (stock === undefined || isNaN(stock) || stock < 0) {
        return res.status(400).json({ success: false, message: "stock is required and must be a numeric value >= 0 for products without variants" });
      }
      if (salePrice !== undefined && (isNaN(salePrice) || salePrice < 0)) {
        return res.status(400).json({ success: false, message: "salePrice must be a numeric value >= 0 if provided" });
      }
    }

    // --- Image Upload ---
    const imageUrls = await Promise.all(
      files.map((file) => cloudinaryImageUploadMethod(file.buffer))
    );

    // --- Create Variants (if any) ---
    let variantIds = [];
    if (parsedVariants.length > 0) {
      const variantDocs = parsedVariants.map((variant) => ({
        size: variant.size,
        unit: variant.unit,
        actualPrice: variant.actualPrice,
        salePrice: variant.salePrice,
        stock: variant.stock,
      }));
      const createdVariants = await Variant.insertMany(variantDocs);
      variantIds = createdVariants.map((v) => v._id);
    }

    // --- Create Product ---
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
    };

    const product = new Product(productData);
    const savedProduct = await product.save();

    // --- Update Variants with productId ---
    if (variantIds.length > 0) {
      await Variant.updateMany(
        { _id: { $in: variantIds } },
        { productId: savedProduct._id }
      );
    }

    // --- Fetch Populated Product ---
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

const editProduct = async (req, res) => {
  const { name, category, actualPrice, salePrice, stock, variants, deletedImages, isFeatured, description } = req.body;
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
      // Validate standalone fields when no variants are provided
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
      await Variant.deleteMany({ productId: _id });
      const variantDocs = parsedVariants.map((variant) => ({
        productId: _id,
        size: variant.size,
        unit: variant.unit,
        actualPrice: variant.actualPrice,
        salePrice: variant.salePrice || undefined,
        stock: variant.stock,
      }));
      const createdVariants = await Variant.insertMany(variantDocs);
      product.variants = createdVariants.map((v) => v._id);
      product.actualPrice = undefined;
      product.salePrice = undefined;
      product.totalStock = undefined; // Clear totalStock when using variants
    } else {
      // Update standalone fields when no variants are provided
      product.variants = []; // Clear variants in DB
      product.actualPrice = Number(actualPrice);
      product.salePrice = salePrice ? Number(salePrice) : undefined;
      console.log('product before updating',product);
      product.stock = Number(stock);
      console.log('product after updating',product);
    }
    
    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.isFeatured = isFeatured === "true" || isFeatured === true;
    product.images = finalImages.length > 0 ? finalImages : product.images;
    
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

module.exports = {
  addProduct,
  showProducts,
  listProduct,
  showProduct,
  editProduct,
};