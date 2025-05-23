// userApi.js - User management API functions
import { apiClient } from "./apiClient.js";
import { API_ENDPOINTS } from "./url.js";

export const userApi = {
  // Create new user (admin only)
  createUser: async (userData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USERS.BASE, userData);
      return response;
    } catch (error) {
      throw new Error(error.message || "User creation failed");
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.BASE);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch current user");
    }
  },

  // Get all users (admin only)
  getAllUsers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.USERS.ALL}?${queryString}`
        : API_ENDPOINTS.USERS.ALL;
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch users");
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.BY_ID(userId));
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch user");
    }
  },

  // Update user profile
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.USERS.BY_ID(userId),
        userData
      );
      return response;
    } catch (error) {
      throw new Error(error.message || "User update failed");
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.USERS.BY_ID(userId)
      );
      return response;
    } catch (error) {
      throw new Error(error.message || "User deletion failed");
    }
  },

  // Update user avatar
  updateAvatar: async (userId, file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiClient.post(
        API_ENDPOINTS.USERS.AVATAR(userId),
        formData
      );
      return response;
    } catch (error) {
      throw new Error(error.message || "Avatar update failed");
    }
  },

  // Delete user avatar
  deleteAvatar: async (userId) => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.USERS.AVATAR(userId)
      );
      return response;
    } catch (error) {
      throw new Error(error.message || "Avatar deletion failed");
    }
  },

  // Get user login history
  getLoginHistory: async (userId) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.USERS.LOGIN_HISTORY(userId)
      );
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch login history");
    }
  },

  // Delete login history entry
  deleteLoginHistoryEntry: async (userId, loginId) => {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.USERS.LOGIN_HISTORY_ENTRY(userId, loginId)
      );
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to delete login history entry");
    }
  },

  // Update user status (admin only)
  updateUserStatus: async (userId, status) => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.USERS.STATUS(userId),
        { status }
      );
      return response;
    } catch (error) {
      throw new Error(error.message || "Status update failed");
    }
  },

  // Update user settings
  updateUserSettings: async (userId, settings) => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.USERS.SETTINGS(userId),
        { settings }
      );
      return response;
    } catch (error) {
      throw new Error(error.message || "Settings update failed");
    }
  },
};
