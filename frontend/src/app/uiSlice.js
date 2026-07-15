import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  darkMode: localStorage.getItem('quickcart_dark_mode') === 'true',
  sidebarOpen: false,
  language: localStorage.getItem('quickcart_lang') || 'en',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('quickcart_dark_mode', state.darkMode);
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('quickcart_lang', action.payload);
    },
  },
});

export const { toggleDarkMode, setSidebarOpen, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;
