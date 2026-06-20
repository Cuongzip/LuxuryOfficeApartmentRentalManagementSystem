import { apiClient } from './apiClient';

export const requestService = {
  async createRequest(requestData) {
    const response = await apiClient.post('/requests', requestData);
    return response;
  },

  async getRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/requests${query ? `?${query}` : ''}`);
    return response.data;
  },

  async updateRequestStatus(id, status) {
    const response = await apiClient.patch(`/requests/${id}/status`, { status });
    return response.data;
  },
};
