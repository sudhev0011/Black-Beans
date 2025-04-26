const mongoose = require('mongoose');
const sendVerificationEmail = require('../utils/nodemailer/sendVerificationEmail');
const sendResetPasswordMail = require('../utils/nodemailer/forgetPasswordMail');
const sendEmailResetMail = require('../utils/nodemailer/emailResetMail')
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
    enum: ['signup', 'reset', 'email_change'],
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
    } else if (this.type === 'email_change') {
      await sendEmailResetMail(this.email, this.otp); 
    }
  }
  next();
});

module.exports = mongoose.model('OTP', otpSchema);