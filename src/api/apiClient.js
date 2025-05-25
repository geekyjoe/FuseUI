// apiClient.js - Core API client with token management
import { BASE_URL } from './url.js';

class ApiClient {
  constructor() {
    this.baseURL = BASE_URL;
    this.token = this.getTokenFromStorage();
    this.refreshPromise = null; // For handling concurrent refresh requests
    this.requestQueue = []; // Queue for requests during token refresh
    this.isRefreshing = false;
  }

  // Token management
  getTokenFromStorage() {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
      return null;
    }
  }

  setToken(token) {
    this.token = token;
    try {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.warn('Failed to save token to localStorage:', error);
    }
  }

  clearToken() {
    this.token = null;
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken'); // Also clear refresh token if exists
      localStorage.removeItem('user'); // Clear user data
    } catch (error) {
      console.warn('Failed to clear tokens from localStorage:', error);
    }
  }

  // Check if token exists and is not expired (basic check)
  hasValidToken() {
    if (!this.token) return false;
    
    try {
      // Basic JWT token validation (check if it's not expired)
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      // If token parsing fails, consider it invalid
      return false;
    }
  }

  // Get default headers
  getHeaders(includeAuth = true, contentType = 'application/json') {
    const headers = {};

    // Only set Content-Type if it's not FormData (let browser set it for FormData)
    if (contentType && contentType !== 'multipart/form-data') {
      headers['Content-Type'] = contentType;
    }

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Handle token refresh logic
  async refreshToken() {
    if (this.isRefreshing) {
      // If already refreshing, wait for the existing refresh to complete
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      
      // Process queued requests
      this.processRequestQueue();
      
      return result;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      this.clearToken(); // Clear invalid tokens
      throw error;
    }
  }

  async performTokenRefresh() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setToken(data.token);
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  // Process queued requests after token refresh
  processRequestQueue() {
    while (this.requestQueue.length > 0) {
      const { resolve, reject, requestFn } = this.requestQueue.shift();
      requestFn().then(resolve).catch(reject);
    }
  }

  // Queue request during token refresh
  queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, requestFn });
    });
  }

  // Generic request method with retry logic
  async request(endpoint, options = {}) {
    const makeRequest = async (isRetry = false) => {
      const url = `${this.baseURL}${endpoint}`;
      
      const config = {
        headers: this.getHeaders(options.includeAuth !== false, options.contentType),
        ...options
      };

      // Remove contentType from options to avoid duplication
      delete config.contentType;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
        
        config.signal = controller.signal;

        const response = await fetch(url, config);
        clearTimeout(timeoutId);
        
        // Handle different response types
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else if (response.status === 204) {
          // No content response
          data = null;
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401 && !isRetry && options.includeAuth !== false) {
            try {
              await this.refreshToken();
              // Retry the request with new token
              return makeRequest(true);
            } catch (refreshError) {
              // If refresh fails, redirect to login or handle accordingly
              this.handleAuthFailure();
              const error = new Error('Authentication failed');
              error.status = 401;
              error.data = data;
              throw error;
            }
          }

          // Handle other HTTP errors
          const error = new Error(data?.message || `HTTP error! status: ${response.status}`);
          error.status = response.status;
          error.data = data;
          throw error;
        }

        return data;
      } catch (error) {
        // Handle abort/timeout errors
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please try again.');
        }
        
        // Handle network errors
        if (!error.status) {
          error.message = 'Network error. Please check your connection.';
        }
        throw error;
      }
    };

    // If we're currently refreshing tokens, queue this request
    if (this.isRefreshing && options.includeAuth !== false) {
      return this.queueRequest(() => makeRequest());
    }

    return makeRequest();
  }

  // Handle authentication failure
  handleAuthFailure() {
    this.clearToken();
    
    // Dispatch custom event for auth failure
    window.dispatchEvent(new CustomEvent('authFailure', {
      detail: { message: 'Authentication failed. Please log in again.' }
    }));

    // Optional: Redirect to login page
    // window.location.href = '/login';
  }

  // HTTP method helpers with improved error handling
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    let body;
    let contentType;

    if (data instanceof FormData) {
      body = data;
      contentType = 'multipart/form-data'; // This will be handled by getHeaders
    } else if (data !== null && data !== undefined) {
      body = JSON.stringify(data);
      contentType = 'application/json';
    }
    
    return this.request(endpoint, {
      method: 'POST',
      body,
      contentType,
      ...options
    });
  }

  async put(endpoint, data, options = {}) {
    let body;
    let contentType;

    if (data instanceof FormData) {
      body = data;
      contentType = 'multipart/form-data';
    } else if (data !== null && data !== undefined) {
      body = JSON.stringify(data);
      contentType = 'application/json';
    }

    return this.request(endpoint, {
      method: 'PUT',
      body,
      contentType,
      ...options
    });
  }

  async patch(endpoint, data, options = {}) {
    let body;
    let contentType = 'application/json';

    if (data !== null && data !== undefined) {
      body = JSON.stringify(data);
    }

    return this.request(endpoint, {
      method: 'PATCH',
      body,
      contentType,
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Utility methods
  
  // Download file with proper headers
  async downloadFile(endpoint, filename, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(options.includeAuth !== false),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true, message: 'File downloaded successfully' };
    } catch (error) {
      throw new Error(error.message || 'Download failed');
    }
  }

  // Upload with progress tracking
  async uploadWithProgress(endpoint, formData, onProgress, options = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      
      // Set authorization header
      if (options.includeAuth !== false && this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }

      xhr.send(formData);
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.get('/api/health', { includeAuth: false, timeout: 5000 });
      return response;
    } catch (error) {
      throw new Error('API is not available');
    }
  }

  // Get API status/info
  async getApiInfo() {
    try {
      const response = await this.get('/api/info', { includeAuth: false });
      return response;
    } catch (error) {
      throw new Error('Failed to get API information');
    }
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export additional utilities
export const ApiUtils = {
  // Format error messages for display
  formatErrorMessage: (error) => {
    if (error.data && error.data.message) {
      return error.data.message;
    }
    return error.message || 'An unexpected error occurred';
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return !error.status && error.message.includes('Network error');
  },

  // Check if error is authentication related
  isAuthError: (error) => {
    return error.status === 401 || error.status === 403;
  },

  // Check if error is validation related
  isValidationError: (error) => {
    return error.status === 400 || error.status === 422;
  },

  // Check if error is server related
  isServerError: (error) => {
    return error.status >= 500;
  }
};