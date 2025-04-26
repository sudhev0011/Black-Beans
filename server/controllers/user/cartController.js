const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const Variant = require("../../models/varients");
const calculateCartTotals = require('../../utils/helperFunctions/calculateCart')
const mongoose = require("mongoose");
// Fetch user's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: "items.productId",
        select: "name images isListed variants salePrice actualPrice stock isListed category",
        populate: {
          path: 'category',
          select: 'name _id isListed'
        }
      })
      .populate({ 
        path: "items.variantId",
        select: "size unit stock salePrice actualPrice productId"
      });
    if (!cart || cart.items.length === 0) {
      return res.status(204).json({ success: true, items: [], total: 0 });
    }
    const calculatedCart = await calculateCartTotals(cart);
    // console.log('cart data form the backend',calculatedCart);
    res.json({ success: true, items: calculatedCart.items, subtotal: calculatedCart.subtotal, total: calculatedCart?.total, tax: calculatedCart.tax, shipping: calculatedCart.shipping });
  } catch (error) {
    console.error("Get cart error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
    const { productId, variantId, quantity = 1 } = req.body
    const MAX_QUANTITY = 5;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID' });
      }
      if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) {
        return res.status(400).json({ success: false, message: 'Invalid variant ID' });
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Invalid quantity' });
      }
    try {
      let stock;
      const product = await Product.findById(productId)
      if (!product || !product.isListed) {
        return res.status(404).json({ success: false, message: 'Product not found or unavailable' })
      }
  
      if (variantId) {
        const variant = await Variant.findById(variantId)
        if (!variant || variant.productId.toString() !== productId) {
          return res.status(404).json({ success: false, message: 'Variant not found or invalid' })
        }
        stock = variant.stock
      } else if (product.variants.length === 0) {
        stock = product.stock
      } else {
        return res.status(400).json({ success: false, message: 'Variant required for this product' })
      }
  
      if (stock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' })
      }
  
      let cart = await Cart.findOne({ user: req.user.id })
      if (!cart) {
        cart = new Cart({ user: req.user.id, items: [] })
      }
  
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId && (item.variantId?.toString() === variantId || (!item.variantId && !variantId))
      )
      if (itemIndex > -1) {
        const newQuantity = cart.items[itemIndex].quantity + quantity
        if (newQuantity > MAX_QUANTITY) {
          return res.status(400).json({ success: false, message: `Maximum quantity for this item is ${MAX_QUANTITY}` })
        }
        if (stock < newQuantity) {
          return res.status(400).json({ success: false, message: 'Insufficient stock' })
        }
        cart.items[itemIndex].quantity = newQuantity
      } else {
        if (quantity > MAX_QUANTITY) {
          return res.status(400).json({ success: false, message: `Maximum quantity for this item is ${MAX_QUANTITY}` })
        }
        cart.items.push({ productId, variantId, quantity })
      }
  
      await cart.save();
      const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.productId');
  
      res.status(201).json({ success: true, message: 'Item added to cart', cart: calculateCartTotals(updatedCart) })
    } catch (error) {
      console.error('Add to cart error:', error)
      res.status(500).json({ success: false, message: 'Something went wrong', error })
    }
  }
  
  // Update cart item quantity
  const updateCartItem = async (req, res) => {
    const { productId, variantId, quantity } = req.body
    const MAX_QUANTITY = 5
  
    try {
      const cart = await Cart.findOne({ user: req.user.id })
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' })
      }
  
      const itemIndex = cart.items.findIndex(
        (item) => item.productId._id.toString() === productId && (item.variantId?._id.toString() === variantId || (!item.variantId && !variantId))
      )
      if (itemIndex === -1) {
        return res.status(404).json({ success: false, message: 'Item not found in cart' })
      }
  
      const item = cart.items[itemIndex]
      const product = await Product.findById(productId)
      const stock = variantId
        ? (await Variant.findById(variantId)).stock
        : product.variants.length === 0 ? product.stock : null
  
      if (stock === null) {
        return res.status(400).json({ success: false, message: 'Variant required for this product' })
      }
      if (quantity > MAX_QUANTITY) {
        return res.status(400).json({ success: false, message: `Maximum quantity for this item is ${MAX_QUANTITY}` })
      }
      if (quantity > stock) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' })
      }
  
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1)
      } else {
        cart.items[itemIndex].quantity = quantity
      }
  
      // cart.total = cart.items.reduce((sum, item) => sum + (item?.variantId?.salePrice || item?.productId?.salePrice) * item.quantity, 0)
      await cart.save();
      const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.productId');
  
      res.json({ success: true, message: 'Cart updated', cart: calculateCartTotals(updatedCart) })
    } catch (error) {
      console.error('Update cart error:', error)
      res.status(500).json({ success: false, message: 'Something went wrong', error })
    }
  }

// Remove item from cart
const removeFromCart = async (req, res) => {
  const { productId, variantId } = req.body;
    console.log('productId and variantId for remove product',productId,variantId);
    
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          (item.variantId?.toString() === variantId ||
            (!item.variantId && !variantId))
        )
    );
    
    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.productId');


    res.json({ success: true, message: "Item removed from cart", cart: calculateCartTotals(updatedCart) });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.json({ success: true, message: "Cart already empty" });
    }

    cart.items = [];
    await cart.save();

    res.json({ success: true, message: "Cart cleared", cart });
  } catch (error) {
    console.error("Clear cart error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
