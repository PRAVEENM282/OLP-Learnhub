import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, userType } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    // Redirect to appropriate dashboard based on user role
    let redirectPath = '/';
    if (userType === 'admin') redirectPath = '/admin/dashboard';
    else if (userType === 'teacher') redirectPath = '/teacher/dashboard';
    else if (userType === 'student') redirectPath = '/student/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute; 