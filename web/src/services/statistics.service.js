import { apiClient } from './apiClient';

const cleanParams = (params) => {
  const cleaned = {};
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      cleaned[key] = val;
    }
  });
  return cleaned;
};

export const statisticsService = {
  async getRevenueStatistics(params = {}) {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const response = await apiClient.get(`/statistics/revenue${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getContractStatistics(params = {}) {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const response = await apiClient.get(`/statistics/contracts${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getRoomStatistics(params = {}) {
    const query = new URLSearchParams(cleanParams(params)).toString();
    const response = await apiClient.get(`/statistics/rooms${query ? `?${query}` : ''}`);
    return response.data;
  },

  async downloadReport(endpoint, filename) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}${endpoint}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      let errorMessage = 'Lỗi khi tải file báo cáo';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Not JSON
      }
      throw new Error(errorMessage);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },


  async exportSummary(params = {}, format = 'xlsx') {
    const query = new URLSearchParams(cleanParams({ ...params, format })).toString();
    const filename = `bao-cao-tong-hop-${Date.now()}.${format}`;
    await this.downloadReport(`/statistics/summary/export?${query}`, filename);
  },
};
