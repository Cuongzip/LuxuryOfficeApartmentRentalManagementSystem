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

export const buildingService = {
  async getBuildings(params = {}) {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const response = await apiClient.get(`/buildings${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getBuildingsWithPagination(params = {}) {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const response = await apiClient.get(`/buildings${query ? `?${query}` : ''}`);
    return response;
  },

  async getBuildingById(id) {
    const response = await apiClient.get(`/buildings/${id}`);
    return response.data;
  },

  async createBuilding(buildingData) {
    const response = await apiClient.post('/buildings', buildingData);
    return response.data;
  },

  async updateBuilding(id, buildingData) {
    const response = await apiClient.put(`/buildings/${id}`, buildingData);
    return response.data;
  },

  async deleteBuilding(id) {
    const response = await apiClient.delete(`/buildings/${id}`);
    return response;
  },
};
