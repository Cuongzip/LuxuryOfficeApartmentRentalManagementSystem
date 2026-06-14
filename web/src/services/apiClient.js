const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const getHeaders = (body, customHeaders = {}) => {
  const headers = {};

  if (!(typeof window !== 'undefined' && body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  Object.assign(headers, customHeaders);

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

let unauthorizedListener = null;

export const registerUnauthorizedListener = (listener) => {
  unauthorizedListener = listener;
};

const handleResponse = async (response) => {
  if (response.status === 401 && unauthorizedListener) {
    unauthorizedListener();
  }

  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    let errors = null;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errors = errorData.errors || null;
    } catch (e) {
      // response might not be JSON
    }
    const error = new Error(errorMessage);
    if (errors) {
      error.errors = errors;
    }
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const apiClient = {
  async get(endpoint, customHeaders = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(null, customHeaders),
    });
    return handleResponse(response);
  },

  async post(endpoint, body, customHeaders = {}) {
    const isFormData = typeof window !== 'undefined' && body instanceof FormData;
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(body, customHeaders),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async put(endpoint, body, customHeaders = {}) {
    const isFormData = typeof window !== 'undefined' && body instanceof FormData;
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(body, customHeaders),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async patch(endpoint, body, customHeaders = {}) {
    const isFormData = typeof window !== 'undefined' && body instanceof FormData;
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(body, customHeaders),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async delete(endpoint, customHeaders = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(null, customHeaders),
    });
    return handleResponse(response);
  },
};
