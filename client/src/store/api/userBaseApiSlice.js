import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logoutUser, setUserCredentials } from "../slices/userSlice/userSlice";
import { toast } from "sonner";
const baseUrl = "http://localhost:8080/api/users";
5
const userBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    return headers;
  },
});

const userBaseQueryWithReauth = async (args, api, extraOptions) => {
  // Handle FormData
  if (args.body instanceof FormData) {
    if (args.headers) {
      delete args.headers["Content-Type"];
    }
  }
  let result = await userBaseQuery(args, api, extraOptions);
  console.log("Initial request:", {
    url: args.url,
    method: args.method,
    status: result?.error?.status,
  });
  console.log("initial request result", result);

  if (result?.error?.status === 403) {
    console.log("Control hit the 304 case, trying to logout user");

    try {
      const logoutResult = await userBaseQuery(
        {
          url: "/logout",
          method: "POST",
          credentials: "include",
        },
        api,
        extraOptions
      );

      if (logoutResult.data?.success) {
        console.log("Logout user successful", logoutResult.data);
        api.dispatch(logoutUser());
        toast.info("You were logged out due to an admin block");
        api.dispatch(userBaseApiSlice.util.resetApiState());
      } else {
        console.log("Logout failed with response:", logoutResult);
        api.dispatch(logoutUser());
      }
    } catch (err) {
      console.error("Forced logout failed:", err);
      toast.error("Failed to log out, please try again");
      api.dispatch(logoutUser());
    }

    return result;
  }

  if (result?.error?.status === 401) {
    // Don't retry if the failed request was itself a refresh token request
    if (args.url === "/refresh-token") {
      console.log("Refresh token request failed");
      api.dispatch(logoutUser());
      return result;
    }

    const { hasLoggedOut } = api.getState().user;
    if (hasLoggedOut) {
      console.log("User has logged out, skipping refresh");
      return result;
    }

    console.log("Access token expired, attempting refresh...");

    try {
      const refreshResult = await userBaseQuery(
        {
          url: "/refresh-token",
          method: "POST",
          credentials: "include",
        },
        api,
        extraOptions
      );

      console.log("Refresh result:", refreshResult);

      if (refreshResult.data?.success) {
        console.log("Token refresh successful, retrying original request");
        console.log(refreshResult.data);
        
        if (refreshResult.data.user) {
          api.dispatch(setUserCredentials(refreshResult.data.user));
        }

        // Retry the original request
        result = await userBaseQuery(args, api, extraOptions);
        console.log("Retried request result:", result);
      } else {
        console.log("Token refresh failed:", refreshResult.error);
        api.dispatch(logoutUser());
        // window.location.href = '/login';
      }
    } catch (error) {
      console.error("Error during refresh:", error);
      api.dispatch(logoutUser());
      window.location.href = "/login";
    }
  }

  return result;
};

export const userBaseApiSlice = createApi({
  reducerPath: "userApi",
  baseQuery: userBaseQueryWithReauth,
  tagTypes: ["User", "Product", "Category", "featuredProduct", "Cart","usedCoupons","allAvailableCoupons"],
  endpoints: () => ({}),
});
