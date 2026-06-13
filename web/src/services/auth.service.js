import { apiClient } from './apiClient';

export const authService = {
  /**
   * Log in user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{token: string, account: object}>}
   */
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

  /**
   * Register user
   * @param {object} registerData 
   * @returns {Promise<object>}
   */
  async register(registerData) {
    const { fullName, email, phone, password, nationalId } = registerData;
    const response = await apiClient.post('/auth/register', {
      fullName,
      email,
      phone,
      password,
      nationalId,
    });
    return response;
  },

  /**
   * Log out current user
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get currently logged-in user profile from localStorage
   * @returns {object|null}
   */
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
