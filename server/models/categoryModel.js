const mongoose = require('mongoose')
const categorySchema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type: String,
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
    offer: {
        discountPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: false
        }
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt: { type: Date, default: Date.now }
})

categorySchema.pre('save', function (next) {
    if (this.offer && this.offer.isActive) {
        const now = new Date();
        if (!this.offer.startDate || !this.offer.endDate) {
            throw new Error('Offer start and end dates are required when offer is active');
        }
        if (this.offer.startDate > this.offer.endDate) {
            throw new Error('Offer start date cannot be after end date');
        }
        if (this.offer.endDate < now) {
            this.offer.isActive = false; // Deactivate expired offers
        }
    }
    this.updatedAt = Date.now();
    next();
});
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;