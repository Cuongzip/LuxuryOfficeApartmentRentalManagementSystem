import { apiClient } from './apiClient';

export const buildingService = {
  /**
   * Get all buildings
   */
  async getBuildings() {
    const response = await apiClient.get('/buildings');
    return response.data; // Backend sends { success: true, data: [...] }
  },

  /**
   * Get building by ID
   */
  async getBuildingById(id) {
    const response = await apiClient.get(`/buildings/${id}`);
    return response.data;
  },

  /**
   * Create a new building
   * Supports FormData (for images) or JSON
   */
  async createBuilding(buildingData) {
    const response = await apiClient.post('/buildings', buildingData);
    return response.data;
  },

  /**
   * Update building by ID
   */
  async updateBuilding(id, buildingData) {
    const response = await apiClient.put(`/buildings/${id}`, buildingData);
    return response.data;
  },

  /**
   * Delete building by ID
   */
  async deleteBuilding(id) {
    const response = await apiClient.delete(`/buildings/${id}`);
    return response;
  },
};
