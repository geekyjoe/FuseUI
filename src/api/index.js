// Import apiClient first
import { apiClient } from './apiClient';
import { authApi } from './auth';
import { userApi } from './user';
import { BASE_URL, API_ENDPOINTS } from './url.js';

// Re-export individual exports
export { apiClient };
export { authApi };
export { userApi };
export { BASE_URL, API_ENDPOINTS };

// Export default object with all services
export default {
  client: apiClient,
  auth: authApi,
  user: userApi
};