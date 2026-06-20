import { apiClient } from './apiClient';

export const locationService = {
  async getProvinces() {
    const response = await apiClient.get('/provinces');
    return response.data;
  },

  async getWards(provinceId) {
    const endpoint = `/wards${provinceId ? `?provinceId=${provinceId}` : ''}`;
    const response = await apiClient.get(endpoint);
    return response.data;
  },
};
