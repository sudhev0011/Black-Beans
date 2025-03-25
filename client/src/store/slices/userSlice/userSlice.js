import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: JSON.parse(localStorage.getItem('userData')) || null, // parse stored data
    isAuthenticated: localStorage.getItem('userData') ? true : false, // checks if 'userData' exists
  },
  reducers: {
    setUserCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('userData', JSON.stringify(action.payload)); // store as string
    },
    logoutUser: (state) => {
      state.user = null;  
      state.isAuthenticated = false;
      localStorage.removeItem('userData');
    },
  },
});

export const { setUserCredentials, logoutUser } = userSlice.actions;
export default userSlice.reducer;
