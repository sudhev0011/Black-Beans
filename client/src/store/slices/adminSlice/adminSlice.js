import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    admin: null,
    isAuthenticated: false,
    hasLoggedOut: false,
  },
  reducers: {
    setAdminCredentials: (state, action) => {
      state.admin = action.payload;
      state.isAuthenticated = true;
      state.hasLoggedOut = false;
    },
    logoutAdmin: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
      state.hasLoggedOut = true;
    },
  },
});

export const { setAdminCredentials, logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;





// import { createSlice } from '@reduxjs/toolkit';

// const adminSlice = createSlice({
//   name: 'admin',
//   initialState: {
//     admin: sessionStorage.getItem('adminData') ? sessionStorage.getItem('adminData') : null, 
//     isAuthenticated: sessionStorage.getItem('adminData') ? true : false,
//   },
//   reducers: {
//     setAdminCredentials: (state, action) => {
//       state.admin = action.payload;
//       state.isAuthenticated = true;
//       sessionStorage.setItem('adminData', JSON.stringify(action.payload)); // Use sessionStorage
//     },
//     logoutAdmin: (state) => {
//       state.admin = null;
//       state.isAuthenticated = false;
//       sessionStorage.removeItem('adminData');
//     },
//   },
// });

// export const { setAdminCredentials, logoutAdmin } = adminSlice.actions;
// export default adminSlice.reducer;