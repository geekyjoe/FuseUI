// apiClient.js - Core API client with token management
import { BASE_URL } from './url.js';

class ApiClient {
  constructor() {
    this.baseURL = BASE_URL;
    this.token = this.getTokenFromStorage();
  }

  // Token management
  getTokenFromStorage() {
    return localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Get default headers
  getHeaders(includeAuth = true, contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.getHeaders(options.includeAuth !== false, options.contentType),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Handle specific HTTP errors
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (!error.status) {
        error.message = 'Network error. Please check your connection.';
      }
      throw error;
    }
  }

  // HTTP method helpers
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const contentType = data instanceof FormData ? undefined : 'application/json';
    
    return this.request(endpoint, {
      method: 'POST',
      body,
      contentType,
      ...options
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();