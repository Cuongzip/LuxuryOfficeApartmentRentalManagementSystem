import { apiClient } from './apiClient';

export const requestService = {
  async createRequest(requestData) {
    const response = await apiClient.post('/requests', requestData);
    return response;
  },
};
