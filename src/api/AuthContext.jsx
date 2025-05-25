// AuthContext.jsx - Authentication Context Provider
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authApi, userApi, apiClient } from "./index";
import { API_ENDPOINTS } from "./url";

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AuthActionTypes = {
  LOADING: "LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  UPDATE_USER: "UPDATE_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_ERROR: "SET_ERROR",
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOADING:
      return {
        ...state,
        isLoading: action.payload ?? true,
        error: null,
      };

    case AuthActionTypes.LOGIN_SUCCESS:
    case AuthActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.LOGIN_FAILURE:
    case AuthActionTypes.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null,
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AuthActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen for auth failures from apiClient
  useEffect(() => {
    const handleAuthFailure = () => {
      dispatch({ type: AuthActionTypes.LOGOUT });
    };

    window.addEventListener("authFailure", handleAuthFailure);

    return () => {
      window.removeEventListener("authFailure", handleAuthFailure);
    };
  }, []);

  // Initialize authentication state
  // Update the initializeAuth function
  const initializeAuth = async () => {
    dispatch({ type: AuthActionTypes.LOADING, payload: true });

    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        // Parse stored user data
        const parsedUser = JSON.parse(storedUser);

        // Set the token in apiClient
        apiClient.setToken(storedToken);

        // Validate token and get fresh user data
        const response = await authApi.checkToken();

        if (response.success && response.data?.user) {
          // Merge stored user data with fresh data
          const updatedUser = {
            ...parsedUser,
            ...response.data.user,
          };

          // Update localStorage with merged data
          localStorage.setItem("user", JSON.stringify(updatedUser));

          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: {
              user: updatedUser,
              token: storedToken,
            },
          });
        } else {
          throw new Error("Invalid token");
        }
      } else {
        dispatch({ type: AuthActionTypes.LOADING, payload: false });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      dispatch({ type: AuthActionTypes.LOGOUT });
    }
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AuthActionTypes.LOADING, payload: true });

    try {
      const response = await authApi.login(credentials);

      if (response.success && response.data) {
        // Update apiClient token
        apiClient.setToken(response.data.token);

        // Store auth data
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });

        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: error.message,
      });
      return { success: false, message: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AuthActionTypes.LOADING, payload: true });

    try {
      const response = await authApi.register(userData);

      if (response.success && response.data) {
        // Update apiClient token
        apiClient.setToken(response.data.token);

        // Store user data
        localStorage.setItem("user", JSON.stringify(response.data.user));

        dispatch({
          type: AuthActionTypes.REGISTER_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });

        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.REGISTER_FAILURE,
        payload: error.message,
      });
      return { success: false, message: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if available
      await authApi.logout();
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      // Clear all auth data
      apiClient.clearToken();
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      dispatch({ type: AuthActionTypes.LOGOUT });
    }
  };

  // Update user profile using userApi
  const updateUser = async (userId, userData) => {
    try {
      const response = await userApi.updateUser(userId, userData);

      if (
        response.success ||
        response.message === "User updated successfully"
      ) {
        // Update local user data if returned
        if (response.userData || response.user) {
          const updatedUserData = response.userData || response.user;
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const updatedUser = { ...currentUser, ...updatedUserData };

          // Store updated user data
          localStorage.setItem("user", JSON.stringify(updatedUser));

          // Update global state
          dispatch({
            type: AuthActionTypes.UPDATE_USER,
            payload: updatedUserData,
          });
        }

        return {
          success: true,
          message: response.message || "User updated successfully",
          userData: response.userData || response.user,
        };
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error) {
      console.error("Error in updateUser:", error);

      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message,
      });

      return {
        success: false,
        message: error.message || "Failed to update user",
      };
    }
  };

  // Update user settings using userApi
  const updateSettings = async (userId, settings) => {
    try {
      const response = await userApi.updateUserSettings(userId, settings);

      if (response.success) {
        const updatedUser = {
          ...state.user,
          settings: response.settings || settings,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: { settings: response.settings || settings },
        });

        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || "Settings update failed");
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message,
      });
      return { success: false, message: error.message };
    }
  };

  // Update avatar using userApi
  const updateAvatar = async (userId, file) => {
    try {
      const response = await userApi.updateAvatar(userId, file);

      if (response.success) {
        const updatedUser = {
          ...state.user,
          avatarUrl: response.avatarUrl,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: { avatarUrl: response.avatarUrl },
        });

        return {
          success: true,
          message: response.message,
          avatarUrl: response.avatarUrl,
        };
      } else {
        throw new Error(response.message || "Avatar update failed");
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message,
      });
      return { success: false, message: error.message };
    }
  };

  // Delete avatar using userApi
  const deleteAvatar = async (userId) => {
    try {
      const response = await userApi.deleteAvatar(userId);

      if (response.success) {
        const updatedUser = {
          ...state.user,
          avatarUrl: null,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: { avatarUrl: null },
        });

        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || "Avatar deletion failed");
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message,
      });
      return { success: false, message: error.message };
    }
  };

  // Change password using userApi
  const changePassword = async (userId, currentPassword, newPassword) => {
    try {
      const response = await userApi.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      if (response.success) {
        return {
          success: true,
          message: response.message || "Password changed successfully",
        };
      } else {
        throw new Error(response.message || "Password change failed");
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message,
      });
      return { success: false, message: error.message };
    }
  };

  // Update email using userApi
  const updateEmail = async (userId, newEmail) => {
    try {
      const response = await userApi.updateEmail(userId, newEmail);

      if (response.success) {
        // Update local user data
        const updatedUser = {
          ...state.user,
          email: newEmail,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: { email: newEmail },
        });

        return {
          success: true,
          message: response.message || "Email updated successfully",
        };
      } else {
        throw new Error(response.message || "Email update failed");
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message,
      });
      return { success: false, message: error.message };
    }
  };

  // Update username using userApi
  const updateUsername = async (userId, newUsername) => {
    try {
      const response = await userApi.updateUsername(userId, newUsername);

      if (response.success) {
        // Update local user data
        const updatedUser = {
          ...state.user,
          username: newUsername,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: { username: newUsername },
        });

        return {
          success: true,
          message: response.message || "Username updated successfully",
        };
      } else {
        throw new Error(response.message || "Username update failed");
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message,
      });
      return { success: false, message: error.message };
    }
  };

  // Update profile using userApi
  const updateProfile = async (userId, profileData) => {
    try {
      const response = await userApi.updateProfile(userId, profileData);

      if (response.success) {
        // Update local user data
        const updatedUser = {
          ...state.user,
          ...profileData,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: profileData,
        });

        return {
          success: true,
          message: response.message || "Profile updated successfully",
        };
      } else {
        throw new Error(response.message || "Profile update failed");
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message,
      });
      return { success: false, message: error.message };
    }
  };

  // Refresh token using apiClient
  const refreshToken = async () => {
    try {
      const response = await apiClient.refreshToken();

      if (response && response.token) {
        // Token was refreshed successfully by apiClient
        return { success: true };
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      // On refresh failure, logout user
      logout();
      return { success: false, message: error.message };
    }
  };

  // Get current user from API
  const getCurrentUser = async () => {
    try {
      const response = await userApi.getCurrentUser();

      if (response && response.user) {
        // Update local storage and state
        localStorage.setItem("user", JSON.stringify(response.user));

        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: response.user,
        });

        return { success: true, user: response.user };
      } else {
        throw new Error("Failed to fetch current user");
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message,
      });
      return { success: false, message: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  // Context value
  const contextValue = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Authentication actions
    login,
    register,
    logout,
    refreshToken,
    getCurrentUser,

    // User management actions
    updateUser,
    updateProfile,
    updateSettings,
    updateAvatar,
    deleteAvatar,
    changePassword,
    updateEmail,
    updateUsername,

    // Utility actions
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
