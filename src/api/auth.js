// authApi.js - Authentication API functions
import { apiClient } from "./apiClient.js";
import { API_ENDPOINTS } from "./url.js";

export const authApi = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData,
        {
          includeAuth: false,
        }
      );

      // Store token if registration successful
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token);
      }

      return response;
    } catch (error) {
      throw new Error(error.message || "Registration failed");
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials,
        {
          includeAuth: false,
        }
      );

      // Store token if login successful
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token);
      }

      return response;
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);

      // Update token if refresh successful
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token);
      }

      return response;
    } catch (error) {
      // Clear token on refresh failure
      apiClient.clearToken();
      throw new Error(error.message || "Token refresh failed");
    }
  },

  // Check token validity
  checkToken: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.CHECK_TOKEN);
      return response;
    } catch (error) {
      // Clear token on validation failure
      apiClient.clearToken();
      throw new Error(error.message || "Token validation failed");
    }
  },

  // Logout user
  logout: () => {
    apiClient.clearToken();
    // Clear any additional user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("userSettings");
  },
};
