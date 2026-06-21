import { apiClient } from './apiClient';

const cleanParams = (params) => {
  const cleaned = {};
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && String(val) !== 'undefined' && String(val) !== 'null') {
      cleaned[key] = val;
    }
  });
  return cleaned;
};

export const residentService = {
  async getResidents(params = {}) {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const response = await apiClient.get(`/residents${query ? `?${query}` : ''}`);
    return response;
  },

  async getResidentById(id) {
    const response = await apiClient.get(`/residents/${id}`);
    return response.data;
  },

  async createResident(formData) {
    const response = await apiClient.post('/residents', formData);
    return response.data;
  },

  async updateResident(id, formData) {
    const response = await apiClient.put(`/residents/${id}`, formData);
    return response.data;
  },

  async deleteResident(id) {
    const response = await apiClient.delete(`/residents/${id}`);
    return response;
  },
};
