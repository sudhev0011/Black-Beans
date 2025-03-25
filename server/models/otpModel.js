// const mongoose = require('mongoose')
// const sendVerificationEmail = require('../utils/nodemailer/sendVerificationEmail')

// const otpSchema = new mongoose.Schema({
//     email:{
//         type:String,
//         required:true
//     },
//     otp:{
//         type:String,
//         required:true
//     },
//     createdAt:{
//         type:Date,
//         default:Date.now,
//         expires:60*1 //document automatically delete after 1 minute
//     }
// })

// otpSchema.pre("save",async function (next) {
//     console.log("New document saved to database");
//     //only send email when a anew document is created
//     if(this.isNew){
//         await sendVerificationEmail(this.email,this.otp)
//     }
//     next();
    
// })
// module.exports = mongoose.model('OTP',otpSchema)













const mongoose = require('mongoose');
const sendVerificationEmail = require('../utils/nodemailer/sendVerificationEmail');
const sendResetPasswordMail = require('../utils/nodemailer/forgetPasswordMail');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: { // Add a type field to distinguish between signup and reset OTPs
    type: String,
    enum: ['signup', 'reset'],
    required: true,
  },
  tempPassword: { // New field for reset flow
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 1, // 1 minute expiry
  },
});

otpSchema.pre('save', async function (next) {
  console.log('New OTP document saved to database');
  if (this.isNew) {
    if (this.type === 'signup') {
      await sendVerificationEmail(this.email, this.otp);
    } else if (this.type === 'reset') {
      await sendResetPasswordMail(this.email, this.otp);
    }
  }
  next();
});

module.exports = mongoose.model('OTP', otpSchema);