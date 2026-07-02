import React from 'react';
import { Navigate } from 'react-router-dom';

function TheatreOwnerRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" />;
  // Admin can also access theatre owner dashboard (they may own a theatre)
  if (user.role !== 'theatreOwner' && user.role !== 'admin') {
    return <Navigate to="/home" />;
  }
  return children;
}

export default TheatreOwnerRoute;
