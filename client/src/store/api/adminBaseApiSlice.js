import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logoutAdmin, setAdminCredentials } from "../slices/adminSlice/adminSlice";

const baseUrl = "http://localhost:8080/api/admin";

const adminBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    return headers;
  },
});

const adminBaseQueryWithReauth = async (args, api, extraOptions) => {
  // Handle FormData
  if (args.body instanceof FormData) {
    if (args.headers) {
      delete args.headers["Content-Type"];
    }
  }

  let result = await adminBaseQuery(args, api, extraOptions);
  console.log("Initial request:", {
    url: args.url,
    method: args.method,
    status: result?.error?.status,
  });

  if (result?.error?.status === 401) {
    // Don't retry if the failed request was itself a refresh token request
    if (args.url === "/refresh-token") {
      console.log("Refresh token request failed");
      api.dispatch(logoutAdmin());
      // window.location.href = '/login';
      return result;
    }

    const { hasLoggedOut } = api.getState().admin;
    if (hasLoggedOut) {
      console.log("Admin has logged out, skipping refresh");
      return result;
    }

    console.log("Access token expired, attempting refresh...");

    try {
      const refreshResult = await adminBaseQuery(
        { 
          url: '/refresh-token', 
          method: 'POST',
          credentials: 'include'
        },
        api,
        extraOptions
      );

      console.log('Refresh result:', refreshResult);
      if (refreshResult.data?.success) {
        console.log("Token refresh successful");

        // Update admin data in localStorage if provided
        if (refreshResult.data.admin) {
          api.dispatch(setAdminCredentials(refreshResult.data.admin))
        }

        // Retry the original request
        console.log("Retrying original request...");
        result = await adminBaseQuery(args, api, extraOptions);
        if (result.data.success) {
          console.log("original request got successful");
        }
      } else {
        console.log("Token refresh failed");
        api.dispatch(logoutAdmin());
        // window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error during refresh:", error);
      api.dispatch(logoutAdmin());
      window.location.href = "/login";
    }
  }

  return result;
};

export const adminBaseApiSlice = createApi({
  reducerPath: "adminApi",
  baseQuery: adminBaseQueryWithReauth,
  tagTypes: ["Admin", "Customer", "Category", "Product"],
  endpoints: () => ({}),
});
