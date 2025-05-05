
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, lazy, Suspense } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from "sonner";
import { useCheckAuthQuery, useGetCartQuery, useLogoutMutation } from "./store/api/userApiSlice";
import { setUserCredentials, logoutUser } from "./store/slices/userSlice/userSlice";
import { setAdminCredentials } from "./store/slices/adminSlice/adminSlice";
import { setCart } from "./store/slices/userSlice/cartSlice";
import { ProtectedUserRoute, ProtectedAdminRoute, AuthRoute } from "./store/protect/ProtectedRoutes";
import OrganicLoading from "./components/ui/loading/OrganicLoading";
import ShopLayout from "./components/layouts/Layout";
import AuthLayout from "./components/layouts/AuthLayout";
import  ReferralCodePopup  from "./components/user/ReferralCouponApply";

// Lazily load components
const ShoppingHome = lazy(() => import("./pages/shop/Home/ShoppingHome"));
const Products = lazy(() => import("./pages/shop/Listing/Products"));
const Product = lazy(() => import("./pages/shop/product/prdct/product"));
const SearchProduct = lazy(() => import("./pages/shop/Listing/SearchProduct"));
const AdminPanel = lazy(() => import("./pages/admin/admin-panel"));
const UserPanel = lazy(() => import("./pages/user/userPanel"));
const Dashboard = lazy(() => import("./components/admin/vo/dashboard"));
const ProductManagement = lazy(() => import("./components/admin/vo/product-management"));
const CategoryManagement = lazy(() => import("./components/admin/vo/category-management"));
const AdminWalletComponent = lazy(() => import("./components/admin/vo/AdminWallet"));
const UserManagement = lazy(() => import("./components/admin/vo/user-management"));
const OrderManagement = lazy(() => import("./components/admin/vo/order-management"));
const SalesReport = lazy(() => import("./components/admin/vo/sales-report"));
const CouponManagement = lazy(() => import("./components/admin/vo/coupon-management"));
const AdminLogin = lazy(() => import("./pages/admin/adminLogin"));
const AuthLogin = lazy(() => import("./pages/user/Auth/login"));
const AuthRegister = lazy(() => import("./pages/user/Auth/register"));
const VerifyOtp = lazy(() => import("./pages/user/Auth/verify-otp"));
const ForgetPassword = lazy(() => import("./pages/user/Auth/forgot-password"));
const ResetPassword = lazy(() => import("./pages/user/Auth/resetPassword"));
const NotFound = lazy(() => import("./components/404/NotFound"));
const AboutPage = lazy(() => import("./pages/aboutUs/AboutPage"));
const UserProfile = lazy(() => import("./components/user/UserProfile"));
const EditProfile = lazy(() => import("./components/user/EditProfile"));
const Address = lazy(() => import("./components/user/Address"));
const AddressForm = lazy(() => import("./components/user/AddressForm"));
const Orders = lazy(() => import("./components/user/Orders"));
const OrderDetails = lazy(() => import("./components/user/OrderDetails"));
const Coupons = lazy(() => import("./components/user/Coupons"));
const Wallet = lazy(() => import("./components/user/Wallet"));
const Wishlist = lazy(() => import("./components/user/Wishlist"));
const ReferAndEarn = lazy(() => import("./components/user/ReferAndEarn"));
const CartComponent = lazy(() => import("./pages/shop/cart/CartComponent"));
const CheckoutComponent = lazy(() => import("./components/checkoutVo/CheckoutComponent"));
const OrderConfirmationComponent = lazy(() => import("./components/checkoutVo/OrderConfirmationComponent"));
const OrderFailureComponent = lazy(() => import("./components/checkoutVo/OrderFailureComponent"));

// Create a wrapper component for Suspense
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<OrganicLoading />}>
    {children}
  </Suspense>
);

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, hasLoggedOut, isFirstUser } = useSelector(
    (state) => state.user
  );
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  const { data: authData, isLoading, isError, error } = useCheckAuthQuery();
  
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
    <DndProvider backend={HTML5Backend}>
    <div className="flex flex-col overflow-hidden bg-white">
      {showReferralPopup && <ReferralCodePopup onClose={handlePopupClose} />}
      <Suspense fallback={<OrganicLoading />}>
        <Routes>
          {/* Public User Routes */}
          <Route path="/" element={
            <ShopLayout />}>
            <Route index element={<SuspenseWrapper><ShoppingHome /></SuspenseWrapper>} />
            <Route path="shop" element={<SuspenseWrapper><Products /></SuspenseWrapper>} />
            <Route path="shop/product/:id" element={<SuspenseWrapper><Product /></SuspenseWrapper>} />
            <Route path="search" element={<SuspenseWrapper><SearchProduct /></SuspenseWrapper>} />
            <Route path="cart" element={<SuspenseWrapper><CartComponent /></SuspenseWrapper>} />
            <Route path="about" element={<SuspenseWrapper><AboutPage /></SuspenseWrapper>} />
            <Route path="*" element={<SuspenseWrapper><NotFound /></SuspenseWrapper>} />
          </Route>

          {/* User Authentication Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<AuthRoute><SuspenseWrapper><AuthLogin /></SuspenseWrapper></AuthRoute>} />
            <Route path="login" element={<AuthRoute><SuspenseWrapper><AuthLogin /></SuspenseWrapper></AuthRoute>} />
            <Route path="register" element={<AuthRoute><SuspenseWrapper><AuthRegister /></SuspenseWrapper></AuthRoute>} />
            <Route path="verify-email" element={<AuthRoute><SuspenseWrapper><VerifyOtp /></SuspenseWrapper></AuthRoute>} />
            <Route path="login/forgot-password" element={<AuthRoute><SuspenseWrapper><ForgetPassword /></SuspenseWrapper></AuthRoute>} />
            <Route path="reset-password" element={<AuthRoute><SuspenseWrapper><ResetPassword /></SuspenseWrapper></AuthRoute>} />
            <Route path="admin-login" element={<AuthRoute isAdminRoute={true}><SuspenseWrapper><AdminLogin /></SuspenseWrapper></AuthRoute>} />
          </Route>

          {/* Protected User Routes */}
          <Route path="/user" element={<ProtectedUserRoute><ShopLayout /></ProtectedUserRoute>}>
            <Route index element={<SuspenseWrapper><UserPanel /></SuspenseWrapper>} />
            <Route path="profile" element={<SuspenseWrapper><UserPanel /></SuspenseWrapper>}>
              <Route index element={<SuspenseWrapper><UserProfile /></SuspenseWrapper>} />
              <Route path="edit" element={<SuspenseWrapper><EditProfile /></SuspenseWrapper>} />
            </Route>
            <Route path="addresses" element={<SuspenseWrapper><UserPanel /></SuspenseWrapper>}>
              <Route index element={<SuspenseWrapper><Address /></SuspenseWrapper>} />
              <Route path="add" element={<SuspenseWrapper><AddressForm /></SuspenseWrapper>} />
              <Route path="edit/:addressId" element={<SuspenseWrapper><AddressForm /></SuspenseWrapper>} />
            </Route>
            <Route path="orders" element={<SuspenseWrapper><UserPanel /></SuspenseWrapper>}>
              <Route index element={<SuspenseWrapper><Orders /></SuspenseWrapper>} />
              <Route path=":orderId" element={<SuspenseWrapper><OrderDetails /></SuspenseWrapper>} />
            </Route>
            <Route path="coupons" element={<SuspenseWrapper><UserPanel /></SuspenseWrapper>}>
              <Route index element={<SuspenseWrapper><Coupons /></SuspenseWrapper>} />
            </Route>
            <Route path="wallet" element={<SuspenseWrapper><UserPanel /></SuspenseWrapper>}>
              <Route index element={<SuspenseWrapper><Wallet /></SuspenseWrapper>} />
            </Route>
            <Route path="wishlist" element={<SuspenseWrapper><UserPanel /></SuspenseWrapper>}>
              <Route index element={<SuspenseWrapper><Wishlist /></SuspenseWrapper>} />
            </Route>
            <Route path="refer" element={<SuspenseWrapper><UserPanel /></SuspenseWrapper>}>
              <Route index element={<SuspenseWrapper><ReferAndEarn /></SuspenseWrapper>} />
            </Route>
            <Route path="cart" element={<SuspenseWrapper><CartComponent /></SuspenseWrapper>} />
            <Route path="checkout" element={<SuspenseWrapper><CheckoutComponent /></SuspenseWrapper>} />
            <Route path="checkout/order-confirmation/:orderId" element={<SuspenseWrapper><OrderConfirmationComponent /></SuspenseWrapper>} />
            <Route path="checkout/order-failure/:orderId" element={<SuspenseWrapper><OrderFailureComponent /></SuspenseWrapper>} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute><SuspenseWrapper><AdminPanel /></SuspenseWrapper></ProtectedAdminRoute>}>
            <Route index element={<SuspenseWrapper><Dashboard /></SuspenseWrapper>} />
            <Route path="dashboard" element={<SuspenseWrapper><Dashboard /></SuspenseWrapper>} />
            <Route path="products" element={<SuspenseWrapper><ProductManagement /></SuspenseWrapper>} />
            <Route path="categories" element={<SuspenseWrapper><CategoryManagement /></SuspenseWrapper>} />
            <Route path="users" element={<SuspenseWrapper><UserManagement /></SuspenseWrapper>} />
            <Route path="wallet" element={<SuspenseWrapper><AdminWalletComponent /></SuspenseWrapper>} />
            <Route path="orders" element={<SuspenseWrapper><OrderManagement /></SuspenseWrapper>} />
            <Route path="reports" element={<SuspenseWrapper><SalesReport /></SuspenseWrapper>} />
            <Route path="coupons" element={<SuspenseWrapper><CouponManagement /></SuspenseWrapper>} />
            <Route path="*" element={<SuspenseWrapper><NotFound /></SuspenseWrapper>} />
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<SuspenseWrapper><NotFound /></SuspenseWrapper>} />
        </Routes>
      </Suspense>
    </div>
    </DndProvider>
  );
}

export default App;