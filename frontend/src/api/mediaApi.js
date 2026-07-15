import apiClient from './apiClient';
import axios from 'axios';

export const mediaApi = {
  getUploadUrl: async (type, options = {}) => {
    // type: 'profile-photo' | 'store-logo' | 'store-banner' | 'product-photo' | 'vehicle-doc' | 'proof-of-delivery'
    // options: { storeId, productId, orderId, contentType }
    let url = '';
    const body = { contentType: options.contentType };

    switch (type) {
      case 'profile-photo':
        url = '/media/profile-photo/upload-url';
        break;
      case 'store-logo':
        url = `/media/store/${options.storeId}/logo/upload-url`;
        break;
      case 'store-banner':
        url = `/media/store/${options.storeId}/banner/upload-url`;
        break;
      case 'product-photo':
        url = `/media/store/${options.storeId}/products/${options.productId}/upload-url`;
        break;
      case 'vehicle-doc':
        url = '/media/delivery/vehicle-doc/upload-url';
        break;
      case 'proof-of-delivery':
        url = `/media/orders/${options.orderId}/proof-of-delivery/upload-url`;
        break;
      default:
        throw new Error('Invalid media type');
    }

    const response = await apiClient.post(url, body);
    return response.data; // { uploadUrl, objectKey, publicUrl }
  },

  confirmUpload: async (type, options = {}, objectKey) => {
    let url = '';
    const body = { objectKey };

    switch (type) {
      case 'profile-photo':
        url = '/media/profile-photo';
        break;
      case 'store-logo':
        url = `/media/store/${options.storeId}/logo`;
        break;
      case 'store-banner':
        url = `/media/store/${options.storeId}/banner`;
        break;
      case 'product-photo':
        url = `/media/store/${options.storeId}/products/${options.productId}`;
        break;
      case 'vehicle-doc':
        url = '/media/delivery/vehicle-doc';
        break;
      case 'proof-of-delivery':
        url = `/media/orders/${options.orderId}/proof-of-delivery`;
        break;
      default:
        throw new Error('Invalid media type');
    }

    const response = await apiClient.patch(url, body);
    return response.data; // { success, url }
  },

  uploadFileDirectToS3: async (uploadUrl, file, contentType) => {
    // Client-side content type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    const response = await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': contentType,
      },
    });
    return response.status === 200;
  },
};
