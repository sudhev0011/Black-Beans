import { adminBaseApiSlice } from "./adminBaseApiSlice";

export const adminApiSlice = adminBaseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Admin"],
    }),
    adminLogout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["Admin"],
    }),
    adminRefreshToken: builder.mutation({
      query: () => ({
        url: "/refresh-token",
        method: "POST",
      }),
    }),

    //Users
    getCustomers: builder.query({
      query: ({ page = 1, limit = 10, term = "", status }) => ({
        url: "/customers",
        method: "GET",
        params: { page, limit, term, status },
      }),
      providesTags: ["User"],
    }),
    toggleUserStatus: builder.mutation({
      query: (userId) => ({
        url: `/customers/${userId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),

    //Category
    getCategories: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/categories",
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["Category"],
    }),
    addCategory: builder.mutation({
      query: (categoryData) => ({
        url: "/categories",
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    toggleCategoryListing: builder.mutation({
      query: (id) => ({
        url: `/categories/list/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Category"],
    }),

    //Product
    addProduct: builder.mutation({
      query: (productData) => ({
        url: "/products",
        method: "POST",
        body: productData,
        formData: true,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: (formData) => ({
        url: `/products/${formData.get('_id')}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),
    toggleProductListing: builder.mutation({
      query: (_id) => ({
        url: `/products/list/${_id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product"],
    }),
    getAdminProducts: builder.query({
      query: ({
        page,
        limit,
        search,
        category,
        isListed,
        hasStock,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
      }) => ({
        url: "/products",
        method: "GET",
        params: {
          page,
          limit,
          search,
          category,
          isListed,
          hasStock,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder,
        },
      }),
      providesTags: ["Product"],
    }),
    getAdminProduct: builder.query({
      query: (_id) => ({
        url: `/product/${_id}`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),

    //Orders
    getAdminOrders: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "" }) => ({
        url: "/orders",
        method: "GET",
        params: { page, limit, search, status },
      }),
      providesTags: ["Order"],
    }),
    getAdminOrderDetails: builder.query({
      query: (orderId) => ({
        url: `/order/${orderId}`,
        method: "GET",
      }),
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/order/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
    processReturn: builder.mutation({
      query: ({ orderId, action, adminNotes }) => ({
        url: "/return/process",
        method: "POST",
        body: { orderId, action, adminNotes },
      }),
      invalidatesTags: ["Order"],
    }),
    processItemReturn: builder.mutation({
      query: (data) => ({
        url: `/order/item-returns`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AdminOrders"],
    }),

    //Coupons
    getCoupons: builder.query({
      query: ({ search = "", status = "", page = 1, limit = 10 }) => ({
        url: "/coupons",
        method: "GET",
        params: { search, status, page, limit },
      }),
      providesTags: ["Coupon"],
    }),
    createCoupon: builder.mutation({
      query: (couponData) => ({
        url: "/coupons",
        method: "POST",
        body: couponData,
      }),
      invalidatesTags: ["Coupon"],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, couponData }) => ({
        url: `/coupons/${id}`,
        method: "PUT",
        body: couponData,
      }),
      invalidatesTags: ["Coupon"],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupon"],
    }),

    //Offer
    createCategoryOffer: builder.mutation({
      query: (offerData) => ({
        url: "/categories/offer",
        method: "POST",
        body: offerData,
      }),
      invalidatesTags: ["Category", "Product"],
    }),
    updateCategoryOffer: builder.mutation({
      query: ({ categoryId, ...offerData }) => ({
        url: `/categories/offer/${categoryId}`,
        method: "PUT",
        body: offerData,
      }),
      invalidatesTags: ["Category", "Product"],
    }),
    deleteCategoryOffer: builder.mutation({
      query: (categoryId) => ({
        url: `/categories/offer/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category", "Product"],
    }),

    // Sales Report Endpoints
    getSalesReport: builder.query({
      query: ({ period, startDate, endDate, page, limit, search, downloadAll }) => ({
        url: "/sales-report",
        method: "GET",
        params: { period, startDate, endDate, page, limit, search, downloadAll },
      }),
      providesTags: ["SalesReport"],
    }),
    exportSalesReportPDF: builder.query({
      query: ({ period, startDate, endDate }) => ({
        url: "/sales-report/export/pdf",
        method: "GET",
        params: { period, startDate, endDate },
        responseHandler: async (response) => {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        },
      }),
    }),
    exportSalesReportExcel: builder.query({
      query: ({ period, startDate, endDate }) => ({
        url: "/sales-report/export/excel",
        method: "GET",
        params: { period, startDate, endDate },
        responseHandler: async (response) => {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        },
      }),
    }),

    //Dashboard
    getStatistics: builder.query({
      query: (timeFilter = 'monthly') => ({
        url: '/statistics',
        params: { timeFilter },
      }),
    }),
    getRevenueData: builder.query({
      query: (timeFilter = 'monthly') => ({
        url: '/revenue',
        params: { timeFilter },
      }),
    }),
    getCategorySales: builder.query({
      query: (timeFilter = 'monthly') => ({
        url: '/categories/sales',
        params: { timeFilter },
      }),
    }),
    getBestSellingProducts: builder.query({
      query: ({ timeFilter = 'monthly', limit = 5 }) => ({
        url: '/products/bestselling',
        params: { timeFilter, limit },
      }),
    }),
    getBestSellingCategory: builder.query({
      query: (timeFilter = 'monthly') => ({
        url: '/categories/bestselling',
        params: { timeFilter },
      }),
    }),
    getRecentOrders: builder.query({
      query: (limit = 5) => ({
        url: '/orders/recent',
        params: { limit },
      }),
    }),

    //wallet
    getAdminWallet: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', type, search } = params;
        
        const queryParams = { page, limit, sortBy, sortOrder };
        
        if (type) {
          queryParams.type = type;
        }
        
        if (search) {
          queryParams.search = search;
        }
        
        return {
          url: '/wallet',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: ['AdminWallet'],
    }),

    getTransactionById: builder.query({
      query: (transactionId) => ({
        url: `/wallet/${transactionId}`,
        method: 'GET',
      }),
      providesTags: (result, error, transactionId) => [{ type: 'Transaction', id: transactionId }],
    }),

    addOffer: builder.mutation({
      query: (offerData) => ({
        url: '/offers',
        method: 'POST',
        body: offerData,
      }),
      invalidatesTags: ['Products', 'Offers'],
    }),

    removeOffer: builder.mutation({
      query: ( productId ) => ({
        url: `/offers/remove`,
        method: 'DELETE',
        body: { productId },
      }),
      invalidatesTags: ['Products', 'Offers'],
    }),

    addCategoryOffer: builder.mutation({
      query: (offerData) => ({
        url: '/category-offers',
        method: 'POST',
        body: offerData,
      }),
      invalidatesTags: ['Categories', 'Offers'],
    }),
    removeCategoryOffer: builder.mutation({
      query: ({ categoryId }) => ({
        url: `/category-offers/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories', 'Offers'],
    }),


    
  }),
});

export const {
  useAdminLoginMutation,
  useAdminLogoutMutation,
  useAdminRefreshTokenMutation,
  useGetCustomersQuery,
  useToggleUserStatusMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useToggleCategoryListingMutation,
  useAddProductMutation,
  useUpdateProductMutation,
  useToggleProductListingMutation,
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderDetailsQuery,
  useUpdateOrderStatusMutation,
  useProcessReturnMutation,
  useProcessItemReturnMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useCreateCategoryOfferMutation,
  useUpdateCategoryOfferMutation,
  useDeleteCategoryOfferMutation,
  useGetSalesReportQuery,
  useExportSalesReportPDFQuery,
  useExportSalesReportExcelQuery,
  //Dashboard
  useGetStatisticsQuery,
  useGetRevenueDataQuery,
  useGetCategorySalesQuery,
  useGetBestSellingProductsQuery,
  useGetBestSellingCategoryQuery,
  useGetRecentOrdersQuery,
  //wallet
  useGetAdminWalletQuery,
  useGetTransactionByIdQuery,
  //offer
  useAddOfferMutation,
  useRemoveOfferMutation,
  useAddCategoryOfferMutation,
  useRemoveCategoryOfferMutation

} = adminApiSlice;