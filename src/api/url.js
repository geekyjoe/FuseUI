// url.js - Base URL configuration
const config = {
  development: 'http://192.168.1.8:6969', // Replace with your development API URL
  production: 'https://your-api-domain.com', // Replace with your production API URL
  staging: 'https://staging-api-domain.com'  // Replace with your staging API URL
};

// Get environment from process.env or default to development
const environment = process.env.NODE_ENV || 'development';

// Export base URL
export const BASE_URL = config[environment];

// Export API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH_TOKEN: '/api/auth/token-refresh',
    CHECK_TOKEN: '/api/auth/check-token'
  },
  
  // User endpoints
  USERS: {
    BASE: '/api/users',
    ALL: '/api/users/all',
    BY_ID: (id) => `/api/users/${id}`,
    AVATAR: (id) => `/api/users/${id}/avatar`,
    LOGIN_HISTORY: (id) => `/api/users/${id}/login-history`,
    LOGIN_HISTORY_ENTRY: (userId, loginId) => `/api/users/${userId}/login-history/${loginId}`,
    STATUS: (id) => `/api/users/status/${id}`,
    SETTINGS: (id) => `/api/users/settings/${id}`
  }
};

export default BASE_URL;