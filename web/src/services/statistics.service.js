import { apiClient } from './apiClient';

export const statisticsService = {
  async getRevenueStatistics(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/statistics/revenue${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getContractStatistics(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/statistics/contracts${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getRoomStatistics(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/statistics/rooms${query ? `?${query}` : ''}`);
    return response.data;
  },
};
