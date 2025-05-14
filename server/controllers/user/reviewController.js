const Review = require("../../models/reviewModel");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");
const { cloudinaryImageUploadMethod } = require("../../utils/cloudinary/cloudinaryUpload"); 

exports.addReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;
  const files = req.files;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const order = await Order.findOne({
      user: userId,
      "items.productId": productId,
      status: "delivered",
    });
    if (!order) {
      return res.status(403).json({
        message: "You can only review products from delivered orders",
      });
    }

    const item = order.items.find(
      (item) => item.productId.toString() === productId && item.status === "none"
    );
    if (!item) {
      return res.status(403).json({
        message: "You cannot review cancelled or returned items",
      });
    }

    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    let imageUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await cloudinaryImageUploadMethod(file.buffer);
        imageUrls.push(url);
      }
    }

    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment,
      images: imageUrls,
    });
    await review.save();

    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "username image_url")
      .sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    res.json({ reviews, averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.canReview = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const order = await Order.findOne({
      user: userId,
      "items.productId": productId,
      status: "delivered",
    });

    let canReview = false;
    if (order) {
      const item = order.items.find(
        (item) => item.productId.toString() === productId && item.status === "none"
      );
      if (item) {
        const existingReview = await Review.findOne({ user: userId, product: productId });
        canReview = !existingReview;
      }
    }

    res.json({ canReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};