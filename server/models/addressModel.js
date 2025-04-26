const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    trim:true
  },
  fullname: {
    type: String,
    required: true,
    trim:true
  },
  phone: {
    type: String,
    required: true,
    trim:true,
    match: /^[0-9]{10}$/
  },
  email: {
    type: String,
    required: true,
    trim:true,
    match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  addressLine: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },  
  country: {
    type: String,
    trim: true
},
  pincode:{
    type:String,
    required:true,
    match:/^[0-9]{6}$/,
    trim:true
  },
  addressType:{
    type:String,
    enum:['Home','Work'],
    required:true
  },
  isListed:{
    type:Boolean,
    default:true
  },
  isDefault:{
    type:Boolean,
    default:false
  }
},
{
    timestamps:true
});

module.exports =mongoose.model('Address',addressSchema)