const mongoose = require('mongoose')
const categorySchema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    hasVarient:{
        type:Boolean,
        required:true,
        default:false
    },
    isListed:{
        type: Boolean, 
        default: true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt: { type: Date, default: Date.now }
})
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;