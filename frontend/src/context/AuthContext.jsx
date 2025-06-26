import React, { createContext, useContext, useReducer, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  userType: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        userType: action.payload.user.type,
      };
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        userType: null,
      };
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        userType: action.payload.type,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if token is valid on app load
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            dispatch({ type: 'LOGOUT' });
            toast.error('Session expired. Please login again.');
          } else {
            // Token is valid, load user data
            await loadUser();
          }
        } catch (error) {
          console.error('Token validation error:', error);
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkToken();
  }, []);

  // Load user data
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'LOAD_USER', payload: data.data });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Load user error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.data,
            token: data.data.token,
          },
        });
        toast.success(`Welcome back, ${data.data.name}!`);
        return { success: true };
      } else {
        toast.error(data.message || 'Login failed');
        dispatch({ type: 'LOGIN_FAIL' });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
      dispatch({ type: 'LOGIN_FAIL' });
      return { success: false, message: 'Network error' };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.data,
            token: data.data.token,
          },
        });
        toast.success(`Welcome to OLP, ${data.data.name}!`);
        return { success: true };
      } else {
        toast.error(data.message || 'Registration failed');
        dispatch({ type: 'LOGIN_FAIL' });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please try again.');
      dispatch({ type: 'LOGIN_FAIL' });
      return { success: false, message: 'Network error' };
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'UPDATE_USER', payload: data.data });
        toast.success('Profile updated successfully');
        return { success: true };
      } else {
        toast.error(data.message || 'Update failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.userType === role;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is teacher
  const isTeacher = () => hasRole('teacher');

  // Check if user is student
  const isStudent = () => hasRole('student');

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    userType: state.userType,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
    isTeacher,
    isStudent,
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