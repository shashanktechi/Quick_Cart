import apiClient from './apiClient';

export const deliveryApi = {
  getTasks: async () => {
    const response = await apiClient.get('/delivery/tasks');
    return response.data;
  },
  claimBatch: async (lat, lng) => {
    const response = await apiClient.post('/delivery/batch', { lat, lng });
    return response.data;
  },
  updateOrderStatus: async (orderId, status) => {
    // status should be enum value name: e.g. PICKED_UP, DELIVERED, etc.
    const response = await apiClient.patch('/delivery/status', { orderId, status });
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get('/delivery/profile');
    return response.data;
  },
};
