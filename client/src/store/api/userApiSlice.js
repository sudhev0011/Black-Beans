import { userBaseApiSlice } from './userBaseApiSlice';

export const userApiSlice = userBaseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (credentials) => ({
        url: '/signup',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    googleLogin: builder.mutation({
      query: (token) => ({
        url: '/auth/google',
        method: 'POST',
        body: { token },
        credentials: 'include',
      }),
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    refreshToken: builder.mutation({
      query: () => ({
        url: '/refresh-token',
        method: 'POST',
      }),
    }),

    verifyOTP: builder.mutation({
      query: ({ email, otp }) => ({
        url: '/verify-otp',
        method: 'POST',
        body: { email, otp },
      }),
      invalidatesTags: ['User'],
    }),

    resendOTP: builder.mutation({
      query: ({ email }) => ({
        url: '/resend-otp',
        method: 'POST',
        body: { email },
      }),
    }),

    forgetPassword: builder.mutation({
      query: ({ email }) => ({
        url: '/forget-password',
        method: 'POST',
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ email, password }) => ({
        url: '/reset-password',
        method: 'POST',
        body: { email, password },
      }),
      invalidatesTags: ['User'],
    }),

    checkAuth: builder.query({
      query: () => ({
        url: '/check-auth', // Add this endpoint in backend if not present
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    verifyResetOTP: builder.mutation({
      query: ({ email, otp }) => ({
        url: '/verify-reset-otp',
        method: 'POST',
        body: { email, otp },
      }),
      invalidatesTags: ['User'],
    }),

    getProfile: builder.query({
      query: () => '/profile',
      providesTags: ['User'],
    }),

    getProducts: builder.query({
      query: (filters) => ({
        url: '/products',
        params: filters,
      }),
      providesTags: ['Product'],
    }),

    getProduct: builder.query({
      query: (id) => `/product/${id}`,
      providesTags: ['Product'],
    }),

    getFeaturedProducts: builder.query({
      query: () => '/featured-products',
      providesTags: ['featuredProduct'],
    }),

    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
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
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetFeaturedProductsQuery,
} = userApiSlice;