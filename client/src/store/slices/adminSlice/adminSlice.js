import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    admin: JSON.parse(localStorage.getItem('adminData')) || null,
    isAuthenticated: localStorage.getItem('adminData') ? true : false,
  },
  reducers: {
    setAdminCredentials: (state, action) => {
      state.admin = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('adminData', JSON.stringify(action.payload));
    },
    logoutAdmin: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
      localStorage.removeItem('adminData');
    },
  },
});

export const { setAdminCredentials, logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;