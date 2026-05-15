import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import { useNavigate } from 'react-router-dom';

function AddTheatre() {
  const navigate = useNavigate();
  const [theatre, setTheatre] = useState({ name: '', city: '', screens: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setTheatre({ ...theatre, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!theatre.name || !theatre.city || !theatre.screens) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await API.post('/admin/theatre', {
        ...theatre,
        screens: Number(theatre.screens)
      });
      alert('Theatre added successfully!');
      navigate('/admin');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add theatre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ background: '#0f172a', minHeight: '100vh', padding: '30px', color: 'white' }}>
        {/* BACK BUTTON */}
        <button onClick={() => navigate('/admin')} style={backBtnStyle}>
          ← Back to Dashboard
        </button>

        <h1 style={{ marginTop: '20px', marginBottom: '5px' }}>Add Theatre</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Register a new theatre in the system</p>

        <div style={{ maxWidth: '480px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Theatre Name</label>
            <input
              name="name"
              value={theatre.name}
              onChange={handleChange}
              placeholder="e.g. PVR Cinemas"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>City</label>
            <input
              name="city"
              value={theatre.city}
              onChange={handleChange}
              placeholder="e.g. Mumbai"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Number of Screens</label>
            <input
              name="screens"
              type="number"
              min="1"
              value={theatre.screens}
              onChange={handleChange}
              placeholder="e.g. 5"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAdd}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: loading ? '#64748b' : '#ff004f',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Adding...' : '🏛️ Add Theatre'}
            </button>
            <button
              onClick={() => navigate('/admin')}
              style={{
                padding: '14px 20px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '10px',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #334155',
  background: '#1e293b',
  color: 'white',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  color: '#94a3b8',
  fontSize: '13px',
  marginBottom: '6px'
};

const backBtnStyle = {
  padding: '10px 18px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold'
};

export default AddTheatre;
