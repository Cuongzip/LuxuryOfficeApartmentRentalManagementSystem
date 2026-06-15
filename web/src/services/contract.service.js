import { apiClient } from './apiClient';

export const contractService = {
  async getContracts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/contracts${query ? `?${query}` : ''}`);
    return response;
  },

  async getContractById(id) {
    const response = await apiClient.get(`/contracts/${id}`);
    return response.data;
  },

  async createContract(contractData) {
    const response = await apiClient.post('/contracts', contractData);
    return response.data;
  },

  async extendContract(id, extendData) {
    const response = await apiClient.patch(`/contracts/${id}/extend`, extendData);
    return response.data;
  },

  async cancelContract(id, cancelData) {
    const response = await apiClient.patch(`/contracts/${id}/cancel`, cancelData);
    return response.data;
  },
};
