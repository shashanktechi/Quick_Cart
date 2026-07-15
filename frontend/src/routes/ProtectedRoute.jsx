import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on user's role
    switch (role) {
      case 'CUSTOMER': return <Navigate to="/login/customer" replace />;
      case 'STORE_ADMIN': return <Navigate to="/login/seller" replace />;
      case 'DELIVERY_PARTNER': return <Navigate to="/login/delivery" replace />;
      case 'SYSTEM_ADMIN': return <Navigate to="/login/admin" replace />;
      default: return <Navigate to="/login/customer" replace />; // Default to customer login
    }
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to correct dashboard based on actual role
    switch (role) {
      case 'CUSTOMER': return <Navigate to="/" replace />;
      case 'STORE_ADMIN': return <Navigate to="/shopkeeper/dashboard" replace />;
      case 'DELIVERY_PARTNER': return <Navigate to="/delivery/dashboard" replace />;
      case 'SYSTEM_ADMIN': return <Navigate to="/admin/dashboard" replace />;
      default: return <Navigate to="/login/customer" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
