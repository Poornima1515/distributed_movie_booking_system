import React from 'react';

import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
function AdminLogin() {

  const navigate = useNavigate();

  return (
<>
  <Navbar />
    <div
      style={{
        background: '#0f172a',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >

      <div
        style={{
          background: '#1e293b',
          padding: '40px',
          borderRadius: '20px',
          width: '400px'
        }}
      >

        <h1
          style={{
            color: 'red',
            textAlign: 'center',
            marginBottom: '30px'
          }}
        >
          Admin Login
        </h1>

        <input
          placeholder="Admin Email"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '15px'
          }}
        />

        <input
          type="password"
          placeholder="Password"
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px'
          }}
        />

        <button
          onClick={() =>
            navigate('/admin-dashboard')
          }
          style={{
            width: '100%',
            padding: '12px',
            background: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '10px'
          }}
        >
          Login
        </button>

      </div>

    </div>
</>
  );

}

export default AdminLogin;