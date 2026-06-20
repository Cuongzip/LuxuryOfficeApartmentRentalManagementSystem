import { apiClient } from './apiClient';

export const invoiceService = {
  async getInvoices(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    const response = await apiClient.get(`/invoices${query ? `?${query}` : ''}`);
    return response;
  },

  async getInvoiceById(id) {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  async createInvoice(invoiceData) {
    const response = await apiClient.post('/invoices', invoiceData);
    return response.data;
  },

  async recordPayment(id, paymentData) {
    const response = await apiClient.post(`/invoices/${id}/payments`, paymentData);
    return response.data;
  },

  async submitPaymentRequest(id, formData) {
    const response = await apiClient.post(`/invoices/${id}/payment-request`, formData);
    return response.data;
  },
};
