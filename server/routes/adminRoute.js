const express = require('express')
const upload =require('../config/multerConfig')
const {login, logout, adminRefreshToken, registerAdmin} = require('../controllers/admin/adminController')
const {getCustomerDetails, editCustomerStatus} = require('../controllers/admin/userController');
const {addCategory,getAllCategories,updateCategory,listCategory} = require('../controllers/admin/categoryController');
const authenticateAdminToken = require('../middlewares/admin/adminAuthMiddleware')
const {authenticateToken} = require('../middlewares/user/authMiddleware')
const {addProduct,showProducts,listProduct,showProduct,editProduct} = require('../controllers/admin/productController')

const adminRoute = express()

//customers
adminRoute.post('/login',login);
adminRoute.post('/register',registerAdmin);
adminRoute.post("/refresh-token", adminRefreshToken);
adminRoute.get('/customers',authenticateAdminToken,getCustomerDetails);
adminRoute.patch('/customers/:userId',authenticateAdminToken,editCustomerStatus);
adminRoute.post('/logout',logout);

//category
adminRoute.post('/categories',authenticateAdminToken, addCategory);
adminRoute.get('/categories', authenticateAdminToken, getAllCategories);
adminRoute.put('/categories/:id', authenticateAdminToken, updateCategory);
adminRoute.patch('/categories/list/:id', authenticateAdminToken, listCategory);

//products
adminRoute.post('/products',authenticateAdminToken,upload.array('images',4),addProduct);
adminRoute.get('/products',authenticateAdminToken,showProducts);
adminRoute.patch('/products/list/:id',authenticateAdminToken,listProduct);
adminRoute.get('/product/:_id',authenticateAdminToken,showProduct);
adminRoute.put('/products/:_id',authenticateAdminToken,upload.array('images',4),editProduct);

//dashboard 

module.exports = adminRoute