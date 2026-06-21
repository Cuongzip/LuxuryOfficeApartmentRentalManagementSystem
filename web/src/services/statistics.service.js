import { apiClient } from './apiClient';

const cleanParams = (params) => {
  const cleaned = {};
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      cleaned[key] = val;
    }
  });
  return cleaned;
};

export const statisticsService = {
  async getRevenueStatistics(params = {}) {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const response = await apiClient.get(`/statistics/revenue${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getContractStatistics(params = {}) {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const response = await apiClient.get(`/statistics/contracts${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getRoomStatistics(params = {}) {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const response = await apiClient.get(`/statistics/rooms${query ? `?${query}` : ''}`);
    return response.data;
  },
};
