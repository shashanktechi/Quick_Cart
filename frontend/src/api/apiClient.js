import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quickcart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('quickcart_token');
      localStorage.removeItem('quickcart_role');
      localStorage.removeItem('quickcart_userId');
      localStorage.removeItem('quickcart_storeId');
      const role = localStorage.getItem('quickcart_role');
      let redirectTo = '/login/customer'; // default
      if (role === 'STORE_ADMIN') {
        redirectTo = '/login/seller';
      } else if (role === 'DELIVERY_PARTNER') {
        redirectTo = '/login/delivery';
      } else if (role === 'SYSTEM_ADMIN') {
        redirectTo = '/login/admin';
      }
      window.location.href = redirectTo;
    }
    return Promise.reject(error);
  }
);

export default apiClient;
