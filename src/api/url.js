export const BASE_URL = 'https://apollo-42564633004.asia-south1.run.app';
// export const BASE_URL = 'http://192.168.1.7:6969';

// Export API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh',
    CHECK_TOKEN: '/api/auth/check-token',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password'
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
    SETTINGS_GET: (id) => `/api/users/${id}/settings`,
    SETTINGS_UPDATE: (id) => `/api/users/${id}/settings`
  },

  // General API endpoints
  HEALTH: '/api/health',
  INFO: '/api/info'
};

// Helper functions for dynamic endpoint generation
export const EndpointHelpers = {
  // Generate user-specific endpoints
  user: {
    profile: (userId) => API_ENDPOINTS.USERS.BY_ID(userId),
    avatar: (userId) => API_ENDPOINTS.USERS.AVATAR(userId),
    settings: (userId) => API_ENDPOINTS.USERS.SETTINGS_GET(userId),
    updateSettings: (userId) => API_ENDPOINTS.USERS.SETTINGS_UPDATE(userId),
    loginHistory: (userId) => API_ENDPOINTS.USERS.LOGIN_HISTORY(userId),
    status: (userId) => API_ENDPOINTS.USERS.STATUS(userId)
  },

  // Generate auth endpoints
  auth: {
    login: () => API_ENDPOINTS.AUTH.LOGIN,
    register: () => API_ENDPOINTS.AUTH.REGISTER,
    logout: () => API_ENDPOINTS.AUTH.LOGOUT,
    refresh: () => API_ENDPOINTS.AUTH.REFRESH_TOKEN,
    checkToken: () => API_ENDPOINTS.AUTH.CHECK_TOKEN,
    verifyEmail: () => API_ENDPOINTS.AUTH.VERIFY_EMAIL,
    forgotPassword: () => API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    resetPassword: () => API_ENDPOINTS.AUTH.RESET_PASSWORD
  }
};

// Validation helpers
export const UrlValidators = {
  // Validate user ID parameter
  validateUserId: (userId) => {
    if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
      throw new Error('Valid user ID is required');
    }
    return String(userId);
  },

  // Validate and sanitize endpoint parameters
  sanitizeParams: (params) => {
    const sanitized = {};
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        sanitized[key] = String(value);
      }
    });
    return sanitized;
  },

  // Build query string from parameters
  buildQueryString: (params) => {
    const sanitized = UrlValidators.sanitizeParams(params);
    const searchParams = new URLSearchParams();
    
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    });
    
    return searchParams.toString();
  }
};

// URL builder utility
export const UrlBuilder = {
  // Build complete URL with base URL
  buildUrl: (endpoint, params = {}) => {
    let url = `${BASE_URL}${endpoint}`;
    
    const queryString = UrlValidators.buildQueryString(params);
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  },

  // Build user endpoint with validation
  buildUserEndpoint: (userId, endpoint) => {
    const validUserId = UrlValidators.validateUserId(userId);
    return endpoint(validUserId);
  },

  // Build paginated endpoint
  buildPaginatedEndpoint: (baseEndpoint, page = 1, limit = 10, additionalParams = {}) => {
    const params = {
      skip: (page - 1) * limit,
      limit,
      ...additionalParams
    };
    
    return UrlBuilder.buildUrl(baseEndpoint, params);
  }
};

// Export default base URL for backward compatibility
export default BASE_URL;