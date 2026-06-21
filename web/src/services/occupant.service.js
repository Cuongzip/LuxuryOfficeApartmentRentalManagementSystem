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

export const occupantService = {
  async getOccupants(params = {}) {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const response = await apiClient.get(`/occupants${query ? `?${query}` : ''}`);
    return response;
  },

  async getOccupantById(id) {
    const response = await apiClient.get(`/occupants/${id}`);
    return response.data;
  },

  async createOccupant(formData) {
    const response = await apiClient.post('/occupants', formData);
    return response.data;
  },

  async updateOccupant(id, formData) {
    const response = await apiClient.put(`/occupants/${id}`, formData);
    return response.data;
  },

  async deleteOccupant(id) {
    const response = await apiClient.delete(`/occupants/${id}`);
    return response;
  },
};
