import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logoutUser } from '../slices/userSlice/userSlice';

const baseUrl = 'http://localhost:8080/api/users';

const userBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    return headers;
  },
});

const userBaseQueryWithReauth = async (args, api, extraOptions) => {
  // Handle FormData
  if (args.body instanceof FormData) {
    if (args.headers) {
      delete args.headers['Content-Type'];
    }
  }

  let result = await userBaseQuery(args, api, extraOptions);
  console.log('Initial request:', { url: args.url, method: args.method, status: result?.error?.status });

  if (result?.error?.status === 401) {
    // Don't retry if the failed request was itself a refresh token request
    if (args.url === '/refresh-token') {
      console.log('Refresh token request failed');
      api.dispatch(logoutUser());
      window.location.href = '/login';
      return result;
    }

    console.log('Access token expired, attempting refresh...');
    
    try {
      const refreshResult = await userBaseQuery(
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
        console.log('Token refresh successful, retrying original request');
        
        // Update user data in localStorage if provided
        if (refreshResult.data.user) {
          localStorage.setItem('userData', JSON.stringify(refreshResult.data.user));
        }
        
        // Retry the original request
        result = await userBaseQuery(args, api, extraOptions);
        console.log('Retried request result:', result);
      } else {
        console.log('Token refresh failed:', refreshResult.error);
        api.dispatch(logoutUser());
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error during refresh:', error);
      api.dispatch(logoutUser());
      window.location.href = '/login';
    }
  }

  return result;
};

export const userBaseApiSlice = createApi({
  reducerPath: 'userApi',
  baseQuery: userBaseQueryWithReauth,
  tagTypes: ['User', 'Product', 'Category', 'featuredProduct'],
  endpoints: () => ({}),
});