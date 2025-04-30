import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ShoppingHome from "./pages/shop/Home/ShoppingHome";
import Products from "./pages/shop/Listing/Products";
import Product from "./pages/shop/product/prdct/product";
import SearchProduct from "./pages/shop/Listing/SearchProduct";
import ShopLayout from "./components/layouts/Layout";
import AuthLayout from "./components/layouts/AuthLayout";
import AdminPanel from "./pages/admin/admin-panel";
import UserPanel from "./pages/user/userPanel";
import Dashboard from "./components/admin/vo/dashboard";
import ProductManagement from "./components/admin/vo/product-management";
import CategoryManagement from "./components/admin/vo/category-management";
import AdminWalletComponent from "./components/admin/vo/AdminWallet";
import UserManagement from "./components/admin/vo/user-management";
import OrderManagement from "./components/admin/vo/order-management";
import SalesReport from "./components/admin/vo/sales-report";
import CouponManagement from "./components/admin/vo/coupon-management";
import AdminLogin from "./pages/admin/adminLogin";
import AuthLogin from "./pages/user/Auth/login";
import AuthRegister from "./pages/user/Auth/register";
import VerifyOtp from "./pages/user/Auth/verify-otp";
import ForgetPassword from "./pages/user/Auth/forgot-password";
import ResetPassword from "./pages/user/Auth/resetPassword";
import NotFound from "./components/404/NotFound";
import AboutPage from "./pages/aboutUs/AboutPage";
import {
  ProtectedUserRoute,
  ProtectedAdminRoute,
  AuthRoute,
} from "./store/protect/ProtectedRoutes";
import { toast } from "sonner";
import { useCheckAuthQuery } from "./store/api/userApiSlice";
import { useGetCartQuery } from "./store/api/userApiSlice";
import {
  setUserCredentials,
  logoutUser,
} from "./store/slices/userSlice/userSlice";
import { useEffect, useState } from "react";
import OrganicLoading from "./components/ui/loading/OrganicLoading";
import { useLogoutMutation } from "@/store/api/userApiSlice";
import { setAdminCredentials } from "./store/slices/adminSlice/adminSlice";
// User Components
import UserProfile from "./components/user/UserProfile";
import EditProfile from "./components/user/EditProfile";
import Address from "./components/user/Address";
import AddressForm from "./components/user/AddressForm";
import Orders from "./components/user/Orders";
import OrderDetails from "./components/user/OrderDetails";
import Coupons from "./components/user/Coupons";
import Wallet from "./components/user/Wallet";
import Wishlist from "./components/user/Wishlist";
import ReferAndEarn from "./components/user/ReferAndEarn";
import CartComponent from "./pages/shop/cart/CartComponent";
import { setCart } from "./store/slices/userSlice/cartSlice";
import CheckoutComponent from "./components/checkoutVo/CheckoutComponent";
import OrderConfirmationComponent from "./components/checkoutVo/OrderConfirmationComponent";
import OrderFailureComponent from "./components/checkoutVo/OrderFailureComponent";
import { ReferralCodePopup } from "./components/user/ReferralCouponApply";

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, hasLoggedOut, isFirstUser } = useSelector(
    (state) => state.user
  );
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  const { data: authData, isLoading, isError, error } = useCheckAuthQuery();
  console.log("checkauth data formthe backend", isFirstUser);

  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery(
    undefined,
    {
      skip: !user,
    }
  );
  const [showReferralPopup, setShowReferralPopup] = useState(false);

  useEffect(() => {
    if (authData?.success) {
      if (authData.user) {
        dispatch(setUserCredentials(authData.user));
        if (isFirstUser) {
          setShowReferralPopup(true);
        }
      }
      if (authData.admin) {
        dispatch(setAdminCredentials(authData.admin));
      }
    } else if (isError && error?.status === 403) {
      const handleLogout = async () => {
        try {
          const response = await logout().unwrap();
          if (response.success) {
            dispatch(logoutUser());
            toast.info("You were logged out due to an admin block");
          }
        } catch (err) {
          console.error("Forced logout failed:", err);
          toast.error("Failed to log out, please try again");
          dispatch(logoutUser());
        }
      };
      handleLogout();
    }
  }, [authData, isError, error, hasLoggedOut, dispatch, logout]);

  useEffect(() => {
    if (cartData) {
      dispatch(setCart({ items: cartData.items, total: cartData.total }));
    }
  }, [cartData, dispatch]);

  useEffect(() => {
    if (isFirstUser) {
      setTimeout(() => {
        setShowReferralPopup(true);
      }, 8000);
    }
  }, [isFirstUser]);
  const handlePopupClose = () => {
    setShowReferralPopup(false);
  };
  if (isLoading) {
    return <OrganicLoading />;
  }

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      {showReferralPopup && <ReferralCodePopup onClose={handlePopupClose} />}
      <Routes>
        {/* Public User Routes */}
        <Route path="/" element={<ShopLayout />}>
          <Route index element={<ShoppingHome />} />
          <Route path="shop" element={<Products />} />
          <Route path="shop/product/:id" element={<Product />} />
          <Route path="search" element={<SearchProduct />} />
          <Route path="cart" element={<CartComponent />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* User Authentication Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route
            index
            element={
              <AuthRoute>
                <AuthLogin />
              </AuthRoute>
            }
          />
          <Route
            path="login"
            element={
              <AuthRoute>
                <AuthLogin />
              </AuthRoute>
            }
          />
          <Route
            path="register"
            element={
              <AuthRoute>
                <AuthRegister />
              </AuthRoute>
            }
          />
          <Route
            path="verify-email"
            element={
              <AuthRoute>
                <VerifyOtp />
              </AuthRoute>
            }
          />
          <Route
            path="login/forgot-password"
            element={
              <AuthRoute>
                <ForgetPassword />
              </AuthRoute>
            }
          />
          <Route
            path="reset-password"
            element={
              <AuthRoute>
                <ResetPassword />
              </AuthRoute>
            }
          />
          <Route
            path="admin-login"
            element={
              <AuthRoute isAdminRoute={true}>
                <AdminLogin />
              </AuthRoute>
            }
          />
        </Route>

        {/* Protected User Routes */}
        <Route
          path="/user"
          element={
            <ProtectedUserRoute>
              <ShopLayout />
            </ProtectedUserRoute>
          }
        >
          <Route index element={<UserPanel />} />
          <Route path="profile" element={<UserPanel />}>
            <Route index element={<UserProfile />} />
            <Route path="edit" element={<EditProfile />} />
          </Route>
          <Route path="addresses" element={<UserPanel />}>
            <Route index element={<Address />} />
            <Route path="add" element={<AddressForm />} />
            <Route path="edit/:addressId" element={<AddressForm />} />
          </Route>
          <Route path="orders" element={<UserPanel />}>
            <Route index element={<Orders />} />
            <Route path=":orderId" element={<OrderDetails />} />
          </Route>
          <Route path="coupons" element={<UserPanel />}>
            <Route index element={<Coupons />} />
          </Route>
          <Route path="wallet" element={<UserPanel />}>
            <Route index element={<Wallet />} />
          </Route>
          <Route path="wishlist" element={<UserPanel />}>
            <Route index element={<Wishlist />} />
          </Route>
          <Route path="refer" element={<UserPanel />}>
            <Route index element={<ReferAndEarn />} />
          </Route>
          <Route path="cart" element={<CartComponent />} />
          <Route path="checkout" element={<CheckoutComponent />} />
          <Route
            path="checkout/order-confirmation/:orderId"
            element={<OrderConfirmationComponent />}
          />
          <Route
            path="checkout/order-failure/:orderId"
            element={<OrderFailureComponent />}
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
          <Route path="wallet" element={<AdminWalletComponent />} />
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
