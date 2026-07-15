import apiClient from './apiClient';

export const customerApi = {
  getNearbyStores: async (lat, lng) => {
    const response = await apiClient.get('/customer/stores/nearby', {
      params: { lat, lng },
    });
    return response.data;
  },
  getStoreInventory: async (storeId) => {
    const response = await apiClient.get(`/customer/stores/${storeId}/inventory`);
    return response.data;
  },
  placeOrder: async (orderRequest) => {
    // orderRequest: { deliveryAddress, customerLat, customerLng, items: [{ productId, qty }] }
    const response = await apiClient.post('/customer/orders', orderRequest);
    return response.data;
  },
  getOrderHistory: async () => {
    const response = await apiClient.get('/customer/orders');
    return response.data;
  },
  getOrderDetails: async (orderId) => {
    const response = await apiClient.get(`/customer/orders/${orderId}`);
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get('/customer/profile');
    return response.data;
  },
};
