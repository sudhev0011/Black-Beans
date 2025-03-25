const express = require("express");
const {authenticateToken} = require("../middlewares/user/authMiddleware");
const { signup, login, logout, refreshToken, verifyOTP, resendOTP, forgetPassword, resetPassword,verifyResetOTP, googleAuth,checkAuth } = require('../controllers/user/authController');
const {showProducts,showProduct,showFeaturedProducts} = require('../controllers/user/productController')
const {showCategories} = require('../controllers/user/categoryController');


const userRoute = express();


// Authentication
userRoute.post('/signup', signup);
userRoute.post('/login', login);
userRoute.post('/refresh-token', refreshToken);
userRoute.post('/logout', logout);
userRoute.post('/verify-otp', verifyOTP);
userRoute.post('/resend-otp', resendOTP);
userRoute.post('/forget-password', forgetPassword);
userRoute.post('/reset-password', resetPassword);
userRoute.post('/verify-reset-otp', verifyResetOTP);
userRoute.get('/check-auth', authenticateToken, checkAuth);
userRoute.post('/auth/google', googleAuth);
//products
userRoute.get("/products",showProducts)
userRoute.get("/featured-products",showFeaturedProducts)
userRoute.get("/product/:id",showProduct)

//category
userRoute.get('/categories',showCategories);

module.exports = userRoute;
