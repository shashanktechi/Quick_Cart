import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Array of { product: {...}, qty: number }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, qty } = action.payload;
      const existingItem = state.items.find((item) => item.product.id === product.id);
      if (existingItem) {
        existingItem.qty += qty;
      } else {
        state.items.push({ product, qty });
      }
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.product.id !== productId);
    },
    updateQuantity: (state, action) => {
      const { productId, qty } = action.payload;
      const existingItem = state.items.find((item) => item.product.id === productId);
      if (existingItem) {
        existingItem.qty = qty;
        if (existingItem.qty <= 0) {
          state.items = state.items.filter((item) => item.product.id !== productId);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
