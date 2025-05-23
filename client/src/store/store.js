import { configureStore } from "@reduxjs/toolkit";
import { adminBaseApiSlice } from "./api/adminBaseApiSlice";
import { userBaseApiSlice } from "./api/userBaseApiSlice";
import adminReducer from "./slices/adminSlice/adminSlice";
import userReducer from "./slices/userSlice/userSlice";
import cartReducer from './slices/userSlice/cartSlice'
export const store = configureStore({
  reducer: {
    [adminBaseApiSlice.reducerPath]: adminBaseApiSlice.reducer,
    [userBaseApiSlice.reducerPath]: userBaseApiSlice.reducer,
    admin: adminReducer,
    user: userReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(adminBaseApiSlice.middleware)
      .concat(userBaseApiSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
