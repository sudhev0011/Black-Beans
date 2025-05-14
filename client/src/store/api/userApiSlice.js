import { userBaseApiSlice } from "./userBaseApiSlice";

export const userApiSlice = userBaseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (credentials) => ({
        url: "/signup",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    googleLogin: builder.mutation({
      query: (token) => ({
        url: "/auth/google",
        method: "POST",
        body: { token },
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["User", "Cart"],
    }),

    refreshToken: builder.mutation({
      query: () => ({
        url: "/refresh-token",
        method: "POST",
      }),
    }),

    verifyOTP: builder.mutation({
      query: ({ email, otp }) => ({
        url: "/verify-otp",
        method: "POST",
        body: { email, otp },
      }),
      invalidatesTags: ["User"],
    }),

    resendOTP: builder.mutation({
      query: ({ email }) => ({
        url: "/resend-otp",
        method: "POST",
        body: { email },
      }),
    }),

    forgetPassword: builder.mutation({
      query: ({ email }) => ({
        url: "/forget-password",
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ email, password }) => ({
        url: "/reset-password",
        method: "POST",
        body: { email, password },
      }),
      invalidatesTags: ["User"],
    }),

    checkAuth: builder.query({
      query: () => ({
        url: "/check-auth",
        method: "GET",
      }),
      // keepUnusedDataFor: 5,
      providesTags: ["User"],
    }),

    verifyResetOTP: builder.mutation({
      query: ({ email, otp }) => ({
        url: "/verify-reset-otp",
        method: "POST",
        body: { email, otp },
      }),
      invalidatesTags: ["User"],
    }),

    getProfile: builder.query({
      query: (userId) => `/profile/${userId}`,
      providesTags: ["User"],
    }),

    editProfile: builder.mutation({
      query: ({ userId, formData }) => ({
        url: `/profile/${userId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
      query: (formData) => ({
        url: "/change-password",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    sendEmailChangeOTP: builder.mutation({
      query: ({ email }) => ({
        url: "/send-email-change-otp",
        method: "POST",
        body: { email },
      }),
    }),
    verifyEmailChangeOTP: builder.mutation({
      query: ({ email, otp }) => ({
        url: "/verify-email-change-otp",
        method: "POST",
        body: { email, otp },
      }),
      invalidatesTags: ["User"],
    }),

    // Address Management Endpoints
    getAddresses: builder.query({
      query: (userId) => `/addresses/${userId}`,
      providesTags: ["Address"],
    }),
    addAddress: builder.mutation({
      query: (addressData) => ({
        url: "/address",
        method: "POST",
        body: addressData,
      }),
      invalidatesTags: ["Address"],
    }),
    editAddress: builder.mutation({
      query: ({ addressId, addressData }) => ({
        url: `/address/${addressId}`,
        method: "PUT",
        body: addressData,
      }),
      invalidatesTags: ["Address"],
    }),
    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `/address/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Address"],
    }),

    // product operations
    getProducts: builder.query({
      query: (filters) => ({
        url: "/products",
        params: filters,
      }),
      providesTags: ["Products"],
    }),
    getProduct: builder.query({
      query: (id) => `/product/${id}`,
      providesTags: ["Product"],
    }),
    getFeaturedProducts: builder.query({
      query: () => "/featured-products",
      providesTags: ["featuredProduct"],
    }),
    getCategories: builder.query({
      query: () => "/categories",
      providesTags: ["Category"],
    }),

    //cart operations
    getCart: builder.query({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),
    addToCart: builder.mutation({
      query: ({ productId, variantId, quantity }) => ({
        url: "/cart/add",
        method: "POST",
        body: { productId, variantId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation({
      query: ({ productId, variantId, quantity }) => ({
        url: "/cart/update",
        method: "PUT",
        body: { productId, variantId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    removeFromCart: builder.mutation({
      query: ({ productId, variantId }) => ({
        url: `/cart/remove`,
        method: "DELETE",
        body: { productId, variantId },
      }),
      invalidatesTags: ["Cart"],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: "/cart/clear",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    //wishlist
    getWishlist: builder.query({
      query: () => "/wishlist",
      providesTags: ["Wishlist"],
    }),
    addToWishlist: builder.mutation({
      query: ({ productId, variantId }) => ({
        url: "/wishlist/add",
        method: "POST",
        body: { productId, variantId },
      }),
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation({
      query: ({productId,variantId}) => ({
        url: '/wishlist',
        method: "DELETE",
        body: { productId, variantId }
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // Order Management Endpoints
    retryPayment: builder.mutation({
      query: (orderId) => ({
        url: '/order/retry',
        method: 'POST',
        body: orderId
      })
    }),
    placeOrder: builder.mutation({
      query: (orderData) => ({
        url: "/order",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Cart", "Order"],
    }),
    verifyPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/order/verify-payment",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Order"], // Optional, if you use tags for caching
    }),

    getOrders: builder.query({
      query: ({ page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '' }) => ({
        url: "/orders",
        method: "GET",
        params: { page, limit, sortBy, sortOrder, search },
      }),
      providesTags: ["Order"],
    }),
    getOrderDetails: builder.query({
      query: (orderId) => `/order/${orderId}`,
      providesTags: ["Order"],
    }),
    downloadInvoice: builder.mutation({
      query: (orderId) => ({
        url: `/order/invoice/${orderId}`,
        method: 'GET',
        responseHandler: async (response) => {
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to download invoice');
          }
          const blob = await response.blob();
          const fileURL = URL.createObjectURL(blob);
          return fileURL;
        },
      }),
    }),
    requestReturn: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: "/order/return",
        method: "POST",
        body: { orderId, reason },
      }),
      invalidatesTags: ["Order"],
    }),
    requestItemReturn: builder.mutation({
      query: ({orderId, itemId, reason})=>({
        url: '/order/returnItemRequest',
        method: 'POST',
        body: {orderId,itemId,reason}
      }),
      invalidatesTags: ['Order']
    }),
    cancelOrder: builder.mutation({
      query: (orderId) => ({
        url: `/order/cancel/${orderId}`,
        method: "POST",
      }),
      invalidatesTags: ["Order"],
    }),
    cancelOrderItem: builder.mutation({
      query: ({ orderId, itemId }) => ({
        url: `/order/cancel-item/${orderId}/${itemId}`,
        method: "POST",
      }),
      invalidatesTags: ["Order"],
    }),

    //wallet
    getWallet: builder.query({
      query: ({ page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', type = null } = {}) => ({
        url: "/wallet",
        method: "GET",
        params: { page, limit, sortBy, sortOrder, type }
      }),
      providesTags: ["Wallet"],
    }),
    addFunds: builder.mutation({
      query: (amount) => ({
        url: "/wallet/add",
        method: "POST",
        body:  amount ,
      }),
      invalidatesTags: ["Wallet"],
    }),

    //coupons
    applyCoupon: builder.mutation({
      query: ({ code, subtotal, shipping, userId }) => ({
        url: "/coupons/apply",
        method: "POST",
        body: { code, subtotal, shipping, userId },
      }),
      invalidatesTags: ["Coupon", "Cart"],
    }),
    getAvailableCoupons: builder.query({
      query: ({subtotal,userId}) => ({
        url: "/coupons/available",
        method: "GET",
        params:  {subtotal,userId} ,
      }),
      providesTags: ["Coupon"],
    }),
    getUsedCoupons: builder.query({
      query: ({ page = 1, limit = 10, search = '' }) => ({
        url: '/coupons/usedCoupons',
        method: 'GET',
        params: { page, limit, search },
      }),
      providesTags: ['usedCoupons'],
    }),
    getAllAvailableCoupons: builder.query({
      query: ({ page = 1, limit = 10, search = '' }) => ({
        url: '/coupons/all-available',
        method: 'GET',
        params: { page, limit, search },
      }),
      providesTags: ['allAvailableCoupons'],
    }),
    //referral
    getReferrals: builder.query({
      query: () => ({
        url: "/referrals",
        method: "GET",
      }),
      providesTags: ["Referral"],
    }),
    applyReferralCode: builder.mutation({
      query: (referralCode) => ({
        url: "/referral/apply",
        method: "POST",
        body: { referralCode },
      }),
      invalidatesTags: ["Referral", "Coupon"],
    }),
    // Review Endpoints
    addReview: builder.mutation({
      query: (formData) => ({
        url: "/addReview",
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["Review"],
    }),

    getProductReviews: builder.query({
      query: (productId) => `/reviews/${productId}`,
      providesTags: ["Review"],
    }),

    canReview: builder.query({
      query: (productId) => `/reviews/can-review/${productId}`,
      providesTags: ["Review"],
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useVerifyResetOTPMutation,
  useCheckAuthQuery,
  useGetProfileQuery,
  useEditProfileMutation,
  useChangePasswordMutation,
  useSendEmailChangeOTPMutation,
  useVerifyEmailChangeOTPMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useEditAddressMutation,
  useDeleteAddressMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetFeaturedProductsQuery,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  usePlaceOrderMutation,
  useRetryPaymentMutation,
  useVerifyPaymentMutation,
  useGetOrdersQuery,
  useGetOrderDetailsQuery,
  useDownloadInvoiceMutation,
  useRequestReturnMutation,
  useRequestItemReturnMutation,
  useCancelOrderMutation,
  useCancelOrderItemMutation,
  useGetWalletQuery,
  useAddFundsMutation,
  useApplyCouponMutation,
  useGetAvailableCouponsQuery,
  useGetUsedCouponsQuery,
  useGetAllAvailableCouponsQuery,
  useGetReferralsQuery,
  useApplyReferralCodeMutation,
  useGetProductReviewsQuery,
  useCanReviewQuery,
  useAddReviewMutation
} = userApiSlice;
