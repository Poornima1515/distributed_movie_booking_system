import React from 'react';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) return <Navigate to="/login" />;

  // Strict admin-only check — theatreOwner cannot access admin routes
  if (user.role !== 'admin') {
    if (user.role === 'theatreOwner') return <Navigate to="/theatre-owner" />;
    return <Navigate to="/home" />;
  }

  return children;
}

export default AdminRoute;
