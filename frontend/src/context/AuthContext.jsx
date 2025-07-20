import React, { createContext, useContext, useReducer, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token header
  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user from token
  const loadUser = async () => {
    if (state.token) {
      try {
        setAuthToken(state.token);
        
        // Check if token is expired
        const decoded = jwtDecode(state.token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          dispatch({ type: 'LOGOUT' });
          setAuthToken(null);
          return;
        }

        const response = await api.get('/me');
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.data,
            token: state.token
          }
        });
      } catch (error) {
        dispatch({ type: 'LOGOUT' });
        setAuthToken(null);
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.post('/register', userData);
      
      const { token, ...user } = response.data.data;
      setAuthToken(token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'AUTH_FAIL',
        payload: message
      });
      return { success: false, error: message };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      console.log('Login attempt with credentials:', { email: credentials.email });
      dispatch({ type: 'AUTH_START' });
      const response = await api.post('/login', credentials);
      
      console.log('Login response:', response.data);
      
      const { token, ...user } = response.data.data;
      setAuthToken(token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      
      console.log('Login successful, user:', user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Login error response:', error.response?.data);
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'AUTH_FAIL',
        payload: message
      });
      return { success: false, error: message };
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    setAuthToken(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/me', userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.data
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    register,
    login,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 