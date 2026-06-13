import { apiClient } from './apiClient';

export const roomService = {
  /**
   * Get all rooms
   */
  async getRooms() {
    const response = await apiClient.get('/rooms');
    return response.data; // Backend sends { success: true, data: [...] }
  },

  /**
   * Get room by ID
   */
  async getRoomById(id) {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data;
  },

  /**
   * Create a new room
   * Supports FormData or JSON
   */
  async createRoom(roomData) {
    const response = await apiClient.post('/rooms', roomData);
    return response.data;
  },

  /**
   * Update room details
   */
  async updateRoom(id, roomData) {
    const response = await apiClient.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  /**
   * Update room status only
   */
  async updateRoomStatus(id, status) {
    const response = await apiClient.patch(`/rooms/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete room by ID
   */
  async deleteRoom(id) {
    const response = await apiClient.delete(`/rooms/${id}`);
    return response;
  },
};
