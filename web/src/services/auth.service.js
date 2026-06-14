import { apiClient } from './apiClient';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.account));
      }
      return response.data;
    }
    throw new Error(response.message || 'Đăng nhập thất bại');
  },

  async register(registerData) {
    const { fullName, email, phone, password, confirmPassword, nationalId } = registerData;
    const response = await apiClient.post('/auth/register', {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      nationalId,
    });
    return response;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Lỗi khi đăng xuất từ API:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  },
};
