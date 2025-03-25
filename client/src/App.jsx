import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ShoppingHome from './pages/shop/Home/ShoppingHome';
import Products from './pages/shop/Listing/Products';
import Product from './pages/shop/product/prdct/product';
import SearchProduct from './pages/shop/Listing/SearchProduct';
import ShopLayout from './components/layouts/Layout';
import AuthLayout from './components/layouts/AuthLayout';
import AdminPanel from './pages/admin/admin-panel';
import Dashboard from './components/admin/vo/dashboard';
import ProductManagement from './components/admin/vo/product-management';
import CategoryManagement from './components/admin/vo/category-management';
import UserManagement from './components/admin/vo/user-management';
import OrderManagement from './components/admin/vo/order-management';
import SalesReport from './components/admin/vo/sales-report';
import CouponManagement from './components/admin/vo/coupon-management';
import AdminLogin from './pages/admin/adminLogin';
import AuthLogin from './pages/user/Auth/login';
import AuthRegister from './pages/user/Auth/register';
import VerifyOtp from './pages/user/Auth/verify-otp';
import ForgetPassword from './pages/user/Auth/forgot-password';
import ResetPassword from './pages/user/Auth/resetPassword';
import NotFound from './pages/NotFound';
import { ProtectedUserRoute, ProtectedAdminRoute, AuthRoute } from './store/protect/ProtectedRoutes';

function App() {
  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        {/* Public User Routes */}
        <Route path="/" element={<ShopLayout />}>
          <Route index element={<ShoppingHome />} />
          <Route path="shop" element={<Products />} />
          <Route path="shop/product/:id" element={<Product />} />
          <Route path="search" element={<SearchProduct />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* User Authentication Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<AuthRoute><AuthLogin /></AuthRoute>} />
          <Route path="login" element={<AuthRoute><AuthLogin /></AuthRoute>} />
          <Route path="register" element={<AuthRoute><AuthRegister /></AuthRoute>} />
          <Route path="verify-email" element={<AuthRoute><VerifyOtp /></AuthRoute>} />
          <Route path="login/forgot-password" element={<AuthRoute><ForgetPassword /></AuthRoute>} />
          <Route path="reset-password" element={<AuthRoute><ResetPassword /></AuthRoute>} />
          <Route
            path="admin-login"
            element={<AuthRoute isAdminRoute={true}><AdminLogin /></AuthRoute>}
          />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPanel />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="reports" element={<SalesReport />} />
          <Route path="coupons" element={<CouponManagement />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Catch-all Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;