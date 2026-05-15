import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import { useNavigate } from 'react-router-dom';

function AddShow() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [show, setShow] = useState({ movie: '', theatre: '', showTime: '', price: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [moviesRes, theatresRes] = await Promise.all([
        API.get('/movies'),
        API.get('/admin/theatres')
      ]);
      setMovies(moviesRes.data);
      setTheatres(theatresRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setShow({ ...show, [e.target.name]: e.target.value });
  };

  const addShow = async () => {
    if (!show.movie || !show.theatre || !show.showTime || !show.price) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await API.post('/admin/show', show);
      alert('Show Added Successfully! 50 seats auto-generated.');
      navigate('/admin');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add show');
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

        <h1 style={{ marginTop: '20px', marginBottom: '5px' }}>Add Show</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Seats A1–E10 (50 seats) will be auto-generated</p>

        <div style={{ maxWidth: '480px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Movie</label>
            <select name="movie" onChange={handleChange} value={show.movie} style={selectStyle}>
              <option value="">Select Movie</option>
              {movies.map((movie) => (
                <option key={movie._id} value={movie._id}>{movie.title}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Theatre</label>
            <select name="theatre" onChange={handleChange} value={show.theatre} style={selectStyle}>
              <option value="">Select Theatre</option>
              {theatres.map((theatre) => (
                <option key={theatre._id} value={theatre._id}>{theatre.name} — {theatre.city}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Show Time</label>
            <input
              name="showTime"
              type="datetime-local"
              value={show.showTime}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Ticket Price (₹)</label>
            <input
              name="price"
              type="number"
              min="1"
              placeholder="e.g. 250"
              value={show.price}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={addShow}
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
              {loading ? 'Adding...' : '🎭 Add Show'}
            </button>
            <button onClick={() => navigate('/admin')} style={cancelBtnStyle}>
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

const selectStyle = {
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

const cancelBtnStyle = {
  padding: '14px 20px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  color: 'white',
  fontSize: '16px',
  cursor: 'pointer'
};

export default AddShow;
