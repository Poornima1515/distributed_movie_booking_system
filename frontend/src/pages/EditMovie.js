import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import { useNavigate, useParams } from 'react-router-dom';

function EditMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState({
    title: '',
    language: '',
    genre: '',
    duration: '',
    rating: '',
    poster: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await API.get(`/movies/${id}`);
        setMovie(res.data);
      } catch (error) {
        alert('Failed to load movie');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id, navigate]);

  const handleChange = (e) => {
    setMovie({ ...movie, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await API.put(`/movies/${id}`, movie);
      alert('Movie updated successfully!');
      navigate('/admin');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update movie');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: 'white' }}>Loading...</h2>
      </div>
    );
  }

  const fields = ['title', 'language', 'genre', 'duration', 'rating', 'poster'];

  return (
    <>
      <Navbar />
      <div style={{ background: '#0f172a', minHeight: '100vh', padding: '30px', color: 'white' }}>
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate('/admin')}
          style={backBtnStyle}
        >
          ← Back to Dashboard
        </button>

        <h1 style={{ marginTop: '20px', marginBottom: '5px' }}>Edit Movie</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Update movie details below</p>

        <div style={{ maxWidth: '520px' }}>
          {fields.map((key) => (
            <div key={key} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px', textTransform: 'capitalize' }}>
                {key}
              </label>
              <input
                name={key}
                value={movie[key] || ''}
                onChange={handleChange}
                placeholder={key}
                style={inputStyle}
              />
            </div>
          ))}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              name="description"
              value={movie.description || ''}
              onChange={handleChange}
              placeholder="Movie description..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* POSTER PREVIEW */}
          {movie.poster && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Poster Preview:</p>
              <img
                src={movie.poster}
                alt="poster preview"
                style={{ width: '120px', borderRadius: '10px', border: '2px solid #334155' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleUpdate}
              disabled={saving}
              style={{
                flex: 1,
                padding: '14px',
                background: saving ? '#64748b' : '#ff004f',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
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

export default EditMovie;
