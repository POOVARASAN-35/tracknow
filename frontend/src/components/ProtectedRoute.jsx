import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#0a0e1a">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'driver' ? '/deliveries' : '/dashboard'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
