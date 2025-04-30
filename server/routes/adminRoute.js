const express = require("express");
const upload = require("../config/multerConfig");
const {
  login,
  logout,
  adminRefreshToken,
  registerAdmin,
} = require("../controllers/admin/adminController");
const {
  getCustomerDetails,
  editCustomerStatus,
} = require("../controllers/admin/userController");
const {
  addCategory,
  getAllCategories,
  updateCategory,
  listCategory,
} = require("../controllers/admin/categoryController");

const {
  addOffer,
  removeOffer,
  addCategoryOffer,
  removeCategoryOffer
} = require("../controllers/admin/offerController");
const authenticateWithRole = require("../middlewares/authenticateWithRole");
const {
  addProduct,
  showProducts,
  listProduct,
  showProduct,
  editProduct,
} = require("../controllers/admin/productController");
const {
  processRequestItemReturn,
  processReturn,
  getAdminOrders,
  getAdminOrderDetails,
  updateOrderStatus,
} = require("../controllers/admin/orderController");

const {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/common/couponController");

const {
  generateSalesReport,
  exportSalesReportPDF,
  exportSalesReportExcel,
} = require("../controllers/admin/salesController");

 
  const dashboardController = require('../controllers/admin/dashboardController');

  const{recordTransaction,getAdminWallet,getTransactionDetails,generateSummaryData} = require('../controllers/admin/adminWalletController')

const adminRoute = express();

//customers
adminRoute.post("/login", login);
adminRoute.post("/register", registerAdmin);
adminRoute.post("/refresh-token", adminRefreshToken);
adminRoute.get(
  "/customers",
  authenticateWithRole(["admin"]),
  getCustomerDetails
);
adminRoute.patch(
  "/customers/:userId",
  authenticateWithRole(["admin"]),
  editCustomerStatus
);
adminRoute.post("/logout", logout);

//category
adminRoute.post("/categories", authenticateWithRole(["admin"]), addCategory);
adminRoute.get(
  "/categories",
  authenticateWithRole(["admin"]),
  getAllCategories
);
adminRoute.put(
  "/categories/:id",
  authenticateWithRole(["admin"]),
  updateCategory
);
adminRoute.patch(
  "/categories/list/:id",
  authenticateWithRole(["admin"]),
  listCategory
);





//products
adminRoute.post(
  "/products",
  authenticateWithRole(["admin"]),
  upload.array("images", 4),
  addProduct
);
adminRoute.get("/products", authenticateWithRole(["admin"]), showProducts);
adminRoute.patch(
  "/products/list/:id",
  authenticateWithRole(["admin"]),
  listProduct
);
adminRoute.get("/product/:_id", authenticateWithRole(["admin"]), showProduct);
adminRoute.put(
  "/products/:_id",
  authenticateWithRole(["admin"]),
  upload.array("images", 4),
  editProduct
);

//offers
adminRoute.post('/offers', authenticateWithRole(["admin"]),addOffer)
adminRoute.delete('/offers/remove', authenticateWithRole(["admin"]),removeOffer);
adminRoute.post('/category-offers', addCategoryOffer);
adminRoute.delete('/category-offers/:categoryId', removeCategoryOffer);

//order
adminRoute.put(
  "/order/item-returns",
  authenticateWithRole(["admin"]),
  processRequestItemReturn
);
adminRoute.post(
  "/return/process",
  authenticateWithRole(["admin"]),
  processReturn
);
adminRoute.get("/orders", authenticateWithRole(["admin"]), getAdminOrders);
adminRoute.get(
  "/order/:orderId",
  authenticateWithRole(["admin"]),
  getAdminOrderDetails
);
adminRoute.patch(
  "/order/:orderId/status",
  authenticateWithRole(["admin"]),
  updateOrderStatus
);

adminRoute.get("/coupons", authenticateWithRole(["admin"]), getCoupons);
adminRoute.post("/coupons", authenticateWithRole(["admin"]), createCoupon);
adminRoute.put("/coupons/:id", authenticateWithRole(["admin"]), updateCoupon);
adminRoute.delete(
  "/coupons/:id",
  authenticateWithRole(["admin"]),
  deleteCoupon
);


// Sales Report
adminRoute.get(
  "/sales-report",
  authenticateWithRole(["admin"]),
  generateSalesReport
);
adminRoute.get(
  "/sales-report/export/pdf",
  authenticateWithRole(["admin"]),
  exportSalesReportPDF
);
adminRoute.get(
  "/sales-report/export/excel",
  authenticateWithRole(["admin"]),
  exportSalesReportExcel
);

adminRoute.get('/statistics', authenticateWithRole(["admin"]), dashboardController.getStatistics);
adminRoute.get('/revenue', authenticateWithRole(["admin"]), dashboardController.getRevenueData);
adminRoute.get('/categories/sales', authenticateWithRole(["admin"]), dashboardController.getCategorySales);
adminRoute.get('/products/bestselling', authenticateWithRole(["admin"]), dashboardController.getBestSellingProducts);
adminRoute.get('/categories/bestselling', authenticateWithRole(["admin"]), dashboardController.getBestSellingCategory);
adminRoute.get('/orders/recent', authenticateWithRole(["admin"]), dashboardController.getRecentOrders);
adminRoute.get('/wallet',authenticateWithRole(["admin"]),getAdminWallet)
adminRoute.get('/wallet/:transactionId',authenticateWithRole(["admin"]),getTransactionDetails)
module.exports = adminRoute;
