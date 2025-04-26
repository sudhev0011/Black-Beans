const Wishlist = require("../../models/wishlistModel");
const Product = require("../../models/productModel");

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: "items.product",
        select: "name actualPrice salePrice images stock variants category",
      })
      .populate({
        path: "items.variant",
        select: "stock size unit salePrice actualPrice",
      })
      .lean();

    if (!wishlist) {
      return res.status(200).json({ items: [] });
    }

    // Process items to determine stock status and format data
    wishlist.items = wishlist.items.map((item) => {
      let inStock;
      let effectivePrice;
      let sizeInfo = '';
      
      if (item.variant) {
        // Variant product
        inStock = item.variant.stock > 0;
        effectivePrice = item.variant.salePrice || item.variant.actualPrice;
        sizeInfo = `${item.variant.size} ${item.variant.unit}`;
      } else {
        // Non-variant product or variant not selected
        if (item.product.variants && item.product.variants.length > 0) {
          inStock = item.product.variants.some(v => v.stock > 0);
          effectivePrice = Math.min(
            ...item.product.variants.map(v => v.salePrice || v.actualPrice)
          );
        } else {
          inStock = item.product.stock > 0;
          effectivePrice = item.product.salePrice || item.product.actualPrice;
        }
      }

      return {
        ...item,
        inStock,
        effectivePrice,
        sizeInfo,
        product: {
          ...item.product,
          variants: undefined // Remove variants array to reduce payload
        }
      };
    });

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error: error.message });
  }
};

const addToWishlist = async (req, res) => {
  const { productId, variantId } = req.body;

  try {
    const product = await Product.findById(productId).populate(
      "variants",
      "stock size unit salePrice actualPrice"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate variant if provided
    let variant = null;
    if (variantId) {
      variant = product.variants.find(v => v._id.toString() === variantId);
      if (!variant) {
        return res.status(400).json({ message: "Invalid variant for this product" });
      }
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      const inStock = variant ? variant.stock > 0 : 
                      product.variants.length > 0
                        ? product.variants.some(v => v.stock > 0)
                        : product.stock > 0;
      
      wishlist = new Wishlist({
        user: req.user.id,
        items: [{
          product: productId,
          variant: variantId || null,
          inStock,
          lastStockCheck: new Date()
        }]
      });
    } else {
      // Check if this exact product+variant combination already exists
      const exists = wishlist.items.some(item => 
        item.product.toString() === productId && 
        ((!variantId && !item.variant) || (item.variant && item.variant.toString() === variantId))
      );
      
      if (exists) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }

      const inStock = variant ? variant.stock > 0 : 
                      product.variants.length > 0
                        ? product.variants.some(v => v.stock > 0)
                        : product.stock > 0;
      
      wishlist.items.push({
        product: productId,
        variant: variantId || null,
        inStock,
        lastStockCheck: new Date()
      });
    }

    await wishlist.save();
    res.status(200).json({ message: "Added to wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error adding to wishlist", error: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  const { productId, variantId } = req.body; // Take both IDs from body like addToWishlist

  try {
    // Validate input
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    // Filter items based on productId and variantId (if provided)
    wishlist.items = wishlist.items.filter((item) => {
      const matchesProduct = item.product.toString() === productId;
      // If variantId is provided, check if it matches; if not, include non-variant items
      const matchesVariant = variantId
        ? item.variant && item.variant.toString() === variantId
        : !item.variant; // If no variantId provided, only match items without variant
      return !(matchesProduct && matchesVariant);
    });

    await wishlist.save();
    res.status(200).json({ message: "Removed from wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error removing from wishlist", error: error.message });
  }
};
module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};