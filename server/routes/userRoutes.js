const express = require("express");
const upload = require("../config/multerConfig");
const authenticateWithRole = require("../middlewares/authenticateWithRole");
const {
  signup,
  login,
  logout,
  refreshToken,
  verifyOTP,
  resendOTP,
  forgetPassword,
  resetPassword,
  verifyResetOTP,
  googleAuth,
} = require("../controllers/user/authController");
const { checkAuth } = require("../controllers/checkAuth");
const {
  getUserDetails,
  editProfile,
  changePassword,
  sendEmailChangeOTP,
  verifyEmailChangeOTP,
} = require("../controllers/user/userController");
const {
  showProducts,
  showProduct,
  showFeaturedProducts,
} = require("../controllers/user/productController");
const { showCategories } = require("../controllers/user/categoryController");

const {
  showAddresses,
  addAddress,
  editAddress,
  deleteAddress,
} = require("../controllers/user/addressController");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/user/cartController");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/user/wishlistController");

const {
  placeOrder,
  getOrders,
  getOrderDetails,
  getInvoice,
  requestReturn,
  cancelOrder,
  cancelOrderItem,
  verifyPayment,
  retryPayment,
  requestItemReturn,
} = require("../controllers/user/orderController");

const { getWallet, addFunds } = require("../controllers/user/walletController");

const {
  applyCoupon,
  getAvailableCoupons,
  getUsedCoupons,
  getAllAvailableCoupons
} = require("../controllers/common/couponController");

const {
  addReview,
  getProductReviews,
  canReview,
} = require("../controllers/user/reviewController");

const { applyReferralCode,getReferrals } = require("../controllers/user/referralController");

const userRoute = express();

// Authentication
userRoute.post("/signup", signup);
userRoute.post("/login", login);
userRoute.post("/refresh-token", refreshToken);
userRoute.post("/logout", logout);
userRoute.post("/verify-otp", verifyOTP);
userRoute.post("/resend-otp", resendOTP);
userRoute.post("/forget-password", forgetPassword);
userRoute.post("/reset-password", resetPassword);
userRoute.post("/verify-reset-otp", verifyResetOTP);
userRoute.get(
  "/check-auth",
  authenticateWithRole(["user", "admin"]),
  checkAuth
);
userRoute.post("/auth/google", googleAuth);
//products
userRoute.get("/products", showProducts);
userRoute.get("/featured-products", showFeaturedProducts);
userRoute.get("/product/:id", showProduct);

//category
userRoute.get("/categories", showCategories);

//profile
userRoute.get(
  "/profile/:userId",
  authenticateWithRole(["user"]),
  getUserDetails
);
userRoute.put(
  "/profile/:userId",
  authenticateWithRole(["user"]),
  upload.single("avatar"),
  editProfile
);

//change password
userRoute.patch(
  "/change-password",
  authenticateWithRole(["user"]),
  changePassword
);

//change email
userRoute.post(
  "/send-email-change-otp",
  authenticateWithRole(["user"]),
  sendEmailChangeOTP
);
userRoute.post(
  "/verify-email-change-otp",
  authenticateWithRole(["user"]),
  verifyEmailChangeOTP
);

//address
userRoute.post("/address", authenticateWithRole(["user"]), addAddress);
userRoute.get(
  "/addresses/:userId",
  authenticateWithRole(["user"]),
  showAddresses
);
userRoute.put(
  "/address/:addressId",
  authenticateWithRole(["user"]),
  editAddress
);
userRoute.delete(
  "/address/:addressId",
  authenticateWithRole(["user"]),
  deleteAddress
);

// Cart Management
userRoute.get("/cart", authenticateWithRole(["user"]), getCart);
userRoute.post("/cart/add", authenticateWithRole(["user"]), addToCart);
userRoute.put("/cart/update", authenticateWithRole(["user"]), updateCartItem);
userRoute.delete(
  "/cart/remove",
  authenticateWithRole(["user"]),
  removeFromCart
);
userRoute.delete("/cart/clear", authenticateWithRole(["user"]), clearCart);

// Wishlist routes
userRoute.get("/wishlist", authenticateWithRole(["user"]), getWishlist);
userRoute.post("/wishlist/add", authenticateWithRole(["user"]), addToWishlist);
userRoute.delete(
  "/wishlist",
  authenticateWithRole(["user"]),
  removeFromWishlist
);

// Order Management
userRoute.post("/order", authenticateWithRole(["user"]), placeOrder);
userRoute.post(
  "/order/verify-payment",
  authenticateWithRole(["user"]),
  verifyPayment
);
userRoute.post("/order/retry", authenticateWithRole(["user"]), retryPayment);
userRoute.get("/orders", authenticateWithRole(["user"]), getOrders);
userRoute.get(
  "/order/:orderId",
  authenticateWithRole(["user"]),
  getOrderDetails
);
userRoute.get(
  "/order/invoice/:orderId",
  authenticateWithRole(["user"]),
  getInvoice
);
userRoute.post("/order/return", authenticateWithRole(["user"]), requestReturn);
userRoute.post(
  "/order/returnItemRequest",
  authenticateWithRole(["user"]),
  requestItemReturn
);
userRoute.post(
  "/order/cancel/:orderId",
  authenticateWithRole(["user"]),
  cancelOrder
);
userRoute.post(
  "/order/cancel-item/:orderId/:itemId",
  authenticateWithRole(["user"]),
  cancelOrderItem
);

//wallet
userRoute.get("/wallet", authenticateWithRole(["user"]), getWallet);
userRoute.post("/wallet/add", authenticateWithRole(["user"]), addFunds);

//coupons
userRoute.post("/coupons/apply", authenticateWithRole(["user"]), applyCoupon);
userRoute.get(
  "/coupons/available",
  authenticateWithRole(["user"]),
  getAvailableCoupons
);
userRoute.get('/coupons/usedCoupons',authenticateWithRole(["user"]),getUsedCoupons)
userRoute.get('/coupons/all-available',authenticateWithRole(["user"]),getAllAvailableCoupons)


//referral
userRoute.post("/referral/apply", authenticateWithRole(["user"]), applyReferralCode);
userRoute.get("/referrals", authenticateWithRole(["user"]), getReferrals);

//review
userRoute.post(
  "/addReview",
  authenticateWithRole(["user"]), // Assuming users can submit reviews
  upload.array("images", 3), // Up to 3 images, matching your multer setup
  addReview
);

userRoute.get("/reviews/:productId", getProductReviews);

userRoute.get(
  "/reviews/can-review/:productId",
  authenticateWithRole(["user"]),
  canReview
);

module.exports = userRoute;
