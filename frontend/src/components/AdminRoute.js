import React from 'react';

import {

  Navigate

} from 'react-router-dom';

function AdminRoute({ children }) {

  const user =
    JSON.parse(
      localStorage.getItem('user')
    );

  if (!user) {

    return (
      <Navigate to="/login" />
    );

  }

  if (user.role !== 'admin') {

    return (
      <Navigate to="/home" />
    );

  }

  return children;

}

export default AdminRoute;