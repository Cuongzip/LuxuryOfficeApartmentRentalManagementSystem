import { apiClient } from './apiClient';

export const roomService = {
  async getRooms(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/rooms${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getRoomById(id) {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data;
  },

  async createRoom(roomData) {
    const response = await apiClient.post('/rooms', roomData);
    return response.data;
  },

  async updateRoom(id, roomData) {
    const response = await apiClient.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  async updateRoomStatus(id, status) {
    const response = await apiClient.patch(`/rooms/${id}/status`, { status });
    return response.data;
  },

  async deleteRoom(id) {
    const response = await apiClient.delete(`/rooms/${id}`);
    return response;
  },
};
