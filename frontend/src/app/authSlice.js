import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('quickcart_token') || null,
  role: localStorage.getItem('quickcart_role') || null,
  userId: localStorage.getItem('quickcart_userId') || null,
  storeId: localStorage.getItem('quickcart_storeId') || null,
  isAuthenticated: !!localStorage.getItem('quickcart_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const { token, role, userId, storeId } = action.payload;
      state.token = token;
      state.role = role;
      state.userId = userId;
      state.storeId = storeId || null;
      state.isAuthenticated = true;

      localStorage.setItem('quickcart_token', token);
      localStorage.setItem('quickcart_role', role);
      localStorage.setItem('quickcart_userId', userId);
      if (storeId) {
        localStorage.setItem('quickcart_storeId', storeId);
      } else {
        localStorage.removeItem('quickcart_storeId');
      }
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.userId = null;
      state.storeId = null;
      state.isAuthenticated = false;

      localStorage.removeItem('quickcart_token');
      localStorage.removeItem('quickcart_role');
      localStorage.removeItem('quickcart_userId');
      localStorage.removeItem('quickcart_storeId');
    },
    updateStoreId: (state, action) => {
      state.storeId = action.payload;
      localStorage.setItem('quickcart_storeId', action.payload);
    }
  },
});

export const { setAuth, logout, updateStoreId } = authSlice.actions;
export default authSlice.reducer;
