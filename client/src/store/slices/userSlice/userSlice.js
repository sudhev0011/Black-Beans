import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null, 
    isAuthenticated: false,
    hasLoggedOut: false,
    isFirstUser: null, 
  },
  reducers: {
    setUserCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.hasLoggedOut = false;
      state.isFirstUser = action.payload.isFirstUser
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.hasLoggedOut = true;
    },
  },
});

export const { setUserCredentials, logoutUser } = userSlice.actions;
export default userSlice.reducer;
