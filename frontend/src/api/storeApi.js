import apiClient from './apiClient';

export const storeApi = {
  getIncomingOrders: async () => {
    const response = await apiClient.get('/store/orders/incoming');
    return response.data;
  },
  updateOrderStatus: async (orderId, status) => {
    // status should be the name of the OrderStatus enum: e.g. CONFIRMED, PREPARING, READY, CANCELLED, etc.
    const response = await apiClient.put(`/store/orders/${orderId}/status`, { status });
    return response.data;
  },
  addProduct: async (productData) => {
    // productData: { product: { name, description, category, unitPrice, typicalShelfLifeHours }, quantity, batchCode, expiryTime }
    const response = await apiClient.post('/store/products', productData);
    return response.data;
  },
  updateInventoryQuantity: async (inventoryId, quantity) => {
    const response = await apiClient.put(`/store/inventory/${inventoryId}`, { quantity });
    return response.data;
  },
  getInventory: async () => {
    const response = await apiClient.get('/store/inventory');
    return response.data;
  },
  getStoreProfile: async () => {
    const response = await apiClient.get('/store/profile');
    return response.data;
  },
  analyzeShelfPhoto: async (objectKey) => {
    const response = await apiClient.post('/store/inventory/analyze-shelf', { objectKey });
    return response.data;
  },
  getWeatherForecast: async () => {
    const response = await apiClient.get('/store/weather-forecast');
    return response.data;
  },
  getDemandAdjustment: async (productId) => {
    const response = await apiClient.get(`/store/products/${productId}/demand-adjustment`);
    return response.data;
  },
  updateProduct: async (productId, productData) => {
    const response = await apiClient.put(`/store/products/${productId}`, productData);
    return response.data;
  },
};
