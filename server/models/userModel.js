const mongoose = require("mongoose");
const { string } = require("yup");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: false,
  },
  address:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Address"
  },
  password: {
    type: String,
  },
  googleId: { type: String, unique: true, sparse: true },

  image_url: { type: String },

  role: {
    type: String,
    default: "user",
  },
  isFirstUser: {
    type: Boolean,
    default: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isVerified: { type: Boolean, default: false },
  referralCode: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: String,
    default: null,
  },
  referralBonusApplied: {
    type: Boolean,
    default: false,
  },
  referredUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
