const mongoose = require('mongoose');
const { string } = require('yup');

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
  password: {
    type: String,
  },
  googleId: { type: String, unique: true, sparse: true },

  image_url:{type:String},

  role: {
    type: String,
    default: 'user',
  },
  isBlocked: {
    type: Boolean,
    default: false, 
  },
  isVerified:{type:Boolean, default:false},
  created_at: {
    type: Date,
    default: Date.now,
  },
  updatedAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model('User', userSchema);