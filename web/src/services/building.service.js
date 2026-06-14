import { apiClient } from './apiClient';

export const buildingService = {
  async getBuildings(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/buildings${query ? `?${query}` : ''}`);
    return response.data;
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
