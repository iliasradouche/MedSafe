// client/src/auth/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from './useAuth';
import Loading from '../components/Loading';

export default function PrivateRoute({ roles }) {
  const { user } = useAuth();
if (user === undefined) {
  return <Loading />; 
}
  // If not logged in, redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles array provided, enforce role-based access
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise render child routes
  return <Outlet />;
}
