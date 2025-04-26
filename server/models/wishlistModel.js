const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  variant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Variant" 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  },
  inStock: {
    type: Boolean,
    // required: true
  },
  lastStockCheck: Date
});

const wishlistSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    unique: true 
  },
  items: [wishlistItemSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

wishlistSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

wishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  next();
});


// Indexes
wishlistSchema.index({ "items.product": 1 });
wishlistSchema.index({ "items.inStock": 1 });

// Static method to check if product is in user's wishlist
wishlistSchema.statics.isInWishlist = async function(userId, productId) {
  return this.exists({ 
    user: userId, 
    "items.product": productId 
  });
};

module.exports = mongoose.model("Wishlist", wishlistSchema);