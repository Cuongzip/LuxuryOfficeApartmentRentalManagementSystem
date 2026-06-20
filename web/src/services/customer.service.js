import { apiClient } from './apiClient';

export const customerService = {
  async getCustomers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/customers${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getCustomerById(id) {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },
};
