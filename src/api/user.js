// userApi.js - User management API functions
import { apiClient } from "./apiClient.js";
import { API_ENDPOINTS } from "./url.js";

export const userApi = {
  // Create new user (public endpoint for registration)
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

  // Get all users (admin only) with pagination, sorting, filtering, and search
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

  // Update user profile (supports credentials update with current password verification)
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
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
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

  // Get user settings
  getUserSettings: async (userId) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.USERS.SETTINGS_GET(userId)
      );
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch user settings");
    }
  },

  // Update user settings (dedicated settings endpoint)
  updateUserSettings: async (userId, settings) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.USERS.SETTINGS_UPDATE(userId),
        settings
      );
      return response;
    } catch (error) {
      throw new Error(error.message || "Settings update failed");
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

  // Specialized methods for common user operations

  // Change password (requires current password)
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      const response = await userApi.updateUser(userId, {
        currentPassword,
        password: newPassword,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Password change failed");
    }
  },

  // Update email (with validation)
  updateEmail: async (userId, newEmail) => {
    try {
      const response = await userApi.updateUser(userId, {
        email: newEmail,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Email update failed");
    }
  },

  // Update username (with validation)
  updateUsername: async (userId, newUsername) => {
    try {
      const response = await userApi.updateUser(userId, {
        username: newUsername,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Username update failed");
    }
  },

  // Update profile information (basic fields)
  updateProfile: async (userId, profileData) => {
    try {
      // Filter to only include profile fields
      const allowedFields = [
        "firstName",
        "lastName",
        "phoneNumber",
        "dob",
        "address",
      ];
      const filteredData = Object.keys(profileData)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = profileData[key];
          return obj;
        }, {});

      const response = await userApi.updateUser(userId, filteredData);
      return response;
    } catch (error) {
      throw new Error(error.message || "Profile update failed");
    }
  },

  // Update notification settings only
  updateNotificationSettings: async (userId, notifications) => {
    try {
      const response = await userApi.updateUserSettings(userId, {
        notifications,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Notification settings update failed");
    }
  },

  // Update theme preference
  updateTheme: async (userId, theme) => {
    try {
      const response = await userApi.updateUserSettings(userId, {
        theme,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Theme update failed");
    }
  },

  // Update language preference
  updateLanguage: async (userId, language) => {
    try {
      const response = await userApi.updateUserSettings(userId, {
        language,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Language update failed");
    }
  },

  // Admin-only methods

  // Update user role (admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await userApi.updateUser(userId, {
        role,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Role update failed");
    }
  },

  // Update user tags (admin only)
  updateUserTags: async (userId, tags) => {
    try {
      const response = await userApi.updateUser(userId, {
        tags,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Tags update failed");
    }
  },

  // Bulk operations for admin

  // Search users with advanced filtering
  searchUsers: async (searchParams) => {
    try {
      const {
        search,
        searchFields = "firstName,lastName,email,username",
        role,
        status,
        tags = [],
        limit = 10,
        skip = 0,
        sortBy = "createdAt",
        sortDirection = "desc",
      } = searchParams;

      const params = {
        limit,
        skip,
        sortBy,
        sortDirection,
      };

      if (search) {
        params.search = search;
        params.searchFields = searchFields;
      }

      if (role) params.role = role;
      if (status) params.status = status;

      // Handle tags array
      if (tags.length > 0) {
        tags.forEach((tag) => {
          if (!params.tags) params.tags = [];
          params.tags.push(tag);
        });
      }

      return await userApi.getAllUsers(params);
    } catch (error) {
      throw new Error(error.message || "User search failed");
    }
  },

  // Get users by role
  getUsersByRole: async (role, params = {}) => {
    try {
      return await userApi.getAllUsers({
        ...params,
        role,
      });
    } catch (error) {
      throw new Error(error.message || "Failed to fetch users by role");
    }
  },

  // Get users by status
  getUsersByStatus: async (status, params = {}) => {
    try {
      return await userApi.getAllUsers({
        ...params,
        status,
      });
    } catch (error) {
      throw new Error(error.message || "Failed to fetch users by status");
    }
  },
};