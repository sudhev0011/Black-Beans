import { adminBaseApiSlice } from "./adminBaseApiSlice";

export const adminApiSlice = adminBaseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Admin Auth endpoints
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

    // Admin Customer Management
    getCustomers: builder.query({
      query: ({ page = 1, limit = 10, term = "",status }) => ({
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

    // Admin Category Management
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

    // Admin Product Management
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
        url: `/products/${formData.get('_id')}`, // Use _id from FormData
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
} = adminApiSlice;