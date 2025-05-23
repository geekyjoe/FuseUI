// AuthContext.jsx - Authentication Context Provider
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authApi, userApi } from './index';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AuthActionTypes = {
  LOADING: 'LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ERROR: 'SET_ERROR'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOADING:
      return {
        ...state,
        isLoading: action.payload ?? true,
        error: null
      };

    case AuthActionTypes.LOGIN_SUCCESS:
    case AuthActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AuthActionTypes.LOGIN_FAILURE:
    case AuthActionTypes.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AuthActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
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
    throw new Error('useAuth must be used within an AuthProvider');
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

  // Initialize authentication state
  const initializeAuth = async () => {
    dispatch({ type: AuthActionTypes.LOADING, payload: true });

    try {
      // Check if user has stored auth data
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        // Validate token with backend
        const response = await authApi.checkToken();
        
        if (response.success && response.data?.user) {
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token: storedToken
            }
          });
        } else {
          // Invalid token, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          dispatch({ type: AuthActionTypes.LOGOUT });
        }
      } else {
        dispatch({ type: AuthActionTypes.LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear invalid stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      dispatch({ type: AuthActionTypes.LOGOUT });
    }
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AuthActionTypes.LOADING, payload: true });

    try {
      const response = await authApi.login(credentials);
      
      if (response.success && response.data) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token
          }
        });
        
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: error.message
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
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        dispatch({
          type: AuthActionTypes.REGISTER_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token
          }
        });
        
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.REGISTER_FAILURE,
        payload: error.message
      });
      return { success: false, message: error.message };
    }
  };

  // Logout function
  const logout = () => {
    authApi.logout();
    dispatch({ type: AuthActionTypes.LOGOUT });
  };

  // Update user profile
  const updateUser = async (userId, userData) => {
    try {
      const response = await userApi.updateUser(userId, userData);
      
      if (response.success) {
        // Update local user data if returned
        if (response.userData) {
          const updatedUser = { ...state.user, ...response.userData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          dispatch({
            type: AuthActionTypes.UPDATE_USER,
            payload: response.userData
          });
        }
        
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message
      });
      return { success: false, message: error.message };
    }
  };

  // Update user settings
  const updateSettings = async (userId, settings) => {
    try {
      const response = await userApi.updateUserSettings(userId, settings);
      
      if (response.success) {
        const updatedUser = { 
          ...state.user, 
          settings: response.settings 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: { settings: response.settings }
        });
        
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Settings update failed');
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message
      });
      return { success: false, message: error.message };
    }
  };

  // Update avatar
  const updateAvatar = async (userId, file) => {
    try {
      const response = await userApi.updateAvatar(userId, file);
      
      if (response.success) {
        const updatedUser = { 
          ...state.user, 
          avatarUrl: response.avatarUrl 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: { avatarUrl: response.avatarUrl }
        });
        
        return { success: true, message: response.message, avatarUrl: response.avatarUrl };
      } else {
        throw new Error(response.message || 'Avatar update failed');
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message
      });
      return { success: false, message: error.message };
    }
  };

  // Delete avatar
  const deleteAvatar = async (userId) => {
    try {
      const response = await userApi.deleteAvatar(userId);
      
      if (response.success) {
        const updatedUser = { 
          ...state.user, 
          avatarUrl: null 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: { avatarUrl: null }
        });
        
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Avatar deletion failed');
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: error.message
      });
      return { success: false, message: error.message };
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken();
      
      if (response.success && response.data?.token) {
        return { success: true };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      // On refresh failure, logout user
      logout();
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

    // Actions
    login,
    register,
    logout,
    updateUser,
    updateSettings,
    updateAvatar,
    deleteAvatar,
    refreshToken,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;