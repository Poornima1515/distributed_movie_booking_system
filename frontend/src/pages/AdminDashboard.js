import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const TABS = ['Overview', 'Movies', 'Shows', 'Theatres', 'Bookings'];

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [moviesRes, showsRes, theatresRes, bookingsRes] = await Promise.all([
        API.get('/movies'),
        API.get('/admin/shows'),
        API.get('/admin/theatres'),
        API.get('/bookings')
      ]);
      setMovies(moviesRes.data);
      setShows(showsRes.data);
      setTheatres(theatresRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteMovie = async (id) => {
    if (!window.confirm('Delete this movie? This cannot be undone.')) return;
    try {
      await API.delete(`/movies/${id}`);
      setMovies((prev) => prev.filter((m) => m._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete movie');
    }
  };

  const deleteShow = async (id) => {
    if (!window.confirm('Delete this show?')) return;
    try {
      await API.delete(`/admin/show/${id}`);
      setShows((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete show');
    }
  };

  const deleteTheatre = async (id) => {
    if (!window.confirm('Delete this theatre?')) return;
    try {
      await API.delete(`/admin/theatre/${id}`);
      setTheatres((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete theatre');
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <>
      <Navbar />
      <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', padding: '30px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#ff004f', fontSize: '32px', margin: 0 }}>Admin Dashboard</h1>
            <p style={{ color: '#94a3b8', margin: '5px 0 0' }}>CineVerse Management Panel</p>
          </div>
          <button onClick={fetchData} style={refreshBtnStyle} title="Refresh all data">
            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                background: activeTab === tab ? '#ff004f' : '#1e293b',
                color: 'white',
                transition: '0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && (
          <div>
            {/* STAT CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '20px', marginBottom: '40px' }}>
              <StatCard label="Total Movies" value={movies.length} icon="🎬" color="#6366f1" />
              <StatCard label="Total Shows" value={shows.length} icon="🎭" color="#0ea5e9" />
              <StatCard label="Total Theatres" value={theatres.length} icon="🏛️" color="#10b981" />
              <StatCard label="Total Bookings" value={bookings.length} icon="🎟️" color="#f59e0b" />
              <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon="💰" color="#ff004f" />
            </div>

            {/* QUICK ACTIONS */}
            <h2 style={{ marginBottom: '15px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <ActionBtn label="➕ Add Movie" onClick={() => navigate('/admin/add-movie')} />
              <ActionBtn label="➕ Add Show" onClick={() => navigate('/admin/add-show')} />
              <ActionBtn label="➕ Add Theatre" onClick={() => navigate('/admin/add-theatre')} />
              <ActionBtn label="🎬 Manage Movies" onClick={() => setActiveTab('Movies')} secondary />
              <ActionBtn label="🎭 Manage Shows" onClick={() => setActiveTab('Shows')} secondary />
              <ActionBtn label="🏛️ Manage Theatres" onClick={() => setActiveTab('Theatres')} secondary />
            </div>
          </div>
        )}

        {/* ── MOVIES TAB ── */}
        {activeTab === 'Movies' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Movies ({movies.length})</h2>
              <button onClick={() => navigate('/admin/add-movie')} style={addBtnStyle}>➕ Add Movie</button>
            </div>
            {movies.length === 0 ? (
              <EmptyState message="No movies added yet." />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '20px' }}>
                {movies.map((movie) => (
                  <div key={movie._id} style={cardStyle}>
                    <img
                      src={movie.poster || 'https://via.placeholder.com/300x200?text=No+Poster'}
                      alt={movie.title}
                      style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }}
                    />
                    <h3 style={{ margin: '0 0 6px', color: 'white' }}>{movie.title}</h3>
                    <p style={{ color: '#94a3b8', margin: '3px 0', fontSize: '13px' }}>🎭 {movie.genre} &nbsp;|&nbsp; 🌐 {movie.language}</p>
                    <p style={{ color: '#94a3b8', margin: '3px 0', fontSize: '13px' }}>⭐ {movie.rating} &nbsp;|&nbsp; ⏱ {movie.duration}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                      <button
                        onClick={() => navigate(`/admin/edit-movie/${movie._id}`)}
                        style={editBtnStyle}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteMovie(movie._id)}
                        style={deleteBtnStyle}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SHOWS TAB ── */}
        {activeTab === 'Shows' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Shows ({shows.length})</h2>
              <button onClick={() => navigate('/admin/add-show')} style={addBtnStyle}>➕ Add Show</button>
            </div>
            {shows.length === 0 ? (
              <EmptyState message="No shows added yet." />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' }}>
                {shows.map((show) => (
                  <div key={show._id} style={cardStyle}>
                    <h3 style={{ margin: '0 0 8px', color: '#ff004f' }}>{show.movie?.title || 'Unknown Movie'}</h3>
                    <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>🏛️ {show.theatre?.name || 'Unknown Theatre'}</p>
                    <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>🕐 {show.showTime}</p>
                    <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>💰 ₹{show.price}</p>
                    <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>
                      🎟️ {show.bookedSeats?.length || 0} / {show.seats?.length || 0} booked
                    </p>
                    <div style={{ marginTop: '14px' }}>
                      <button onClick={() => deleteShow(show._id)} style={{ ...deleteBtnStyle, width: '100%' }}>
                        🗑️ Delete Show
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── THEATRES TAB ── */}
        {activeTab === 'Theatres' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Theatres ({theatres.length})</h2>
              <button onClick={() => navigate('/admin/add-theatre')} style={addBtnStyle}>➕ Add Theatre</button>
            </div>
            {theatres.length === 0 ? (
              <EmptyState message="No theatres added yet." />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
                {theatres.map((theatre) => (
                  <div key={theatre._id} style={cardStyle}>
                    <h3 style={{ margin: '0 0 8px', color: 'white' }}>🏛️ {theatre.name}</h3>
                    <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>📍 {theatre.city}</p>
                    <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>🎬 {theatre.screens} Screen(s)</p>
                    <div style={{ marginTop: '14px' }}>
                      <button onClick={() => deleteTheatre(theatre._id)} style={{ ...deleteBtnStyle, width: '100%' }}>
                        🗑️ Delete Theatre
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'Bookings' && (
          <div>
            <h2 style={{ marginBottom: '20px' }}>All Bookings ({bookings.length})</h2>
            {bookings.length === 0 ? (
              <EmptyState message="No bookings yet." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                      <th style={thStyle}>Booking ID</th>
                      <th style={thStyle}>Movie</th>
                      <th style={thStyle}>Theatre</th>
                      <th style={thStyle}>Seats</th>
                      <th style={thStyle}>Amount</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={tdStyle}>{booking.bookingId?.slice(0, 8)}...</td>
                        <td style={tdStyle}>{booking.movie?.title || '—'}</td>
                        <td style={tdStyle}>{booking.theatre?.name || '—'}</td>
                        <td style={tdStyle}>{booking.seats?.join(', ')}</td>
                        <td style={tdStyle}>₹{booking.totalAmount}</td>
                        <td style={tdStyle}>
                          <span style={{
                            background: booking.paymentStatus === 'SUCCESS' ? '#10b981' : '#ef4444',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {booking.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}

// ── HELPER COMPONENTS ──

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: '#1e293b',
      padding: '24px',
      borderRadius: '16px',
      borderLeft: `4px solid ${color}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <span style={{ fontSize: '28px' }}>{icon}</span>
      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</span>
      <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>{value}</span>
    </div>
  );
}

function ActionBtn({ label, onClick, secondary }) {
  return (
    <button onClick={onClick} style={{
      padding: '12px 20px',
      background: secondary ? '#1e293b' : '#ff004f',
      border: secondary ? '1px solid #334155' : 'none',
      borderRadius: '10px',
      color: 'white',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: '0.2s'
    }}>
      {label}
    </button>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{
      background: '#1e293b',
      padding: '40px',
      borderRadius: '16px',
      textAlign: 'center',
      color: '#94a3b8'
    }}>
      <p style={{ fontSize: '18px' }}>{message}</p>
    </div>
  );
}

// ── STYLES ──
const cardStyle = {
  background: '#1e293b',
  padding: '20px',
  borderRadius: '16px',
  border: '1px solid #334155'
};

const addBtnStyle = {
  padding: '10px 20px',
  background: '#ff004f',
  border: 'none',
  borderRadius: '10px',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px'
};

const editBtnStyle = {
  flex: 1,
  padding: '8px',
  background: '#0ea5e9',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px'
};

const deleteBtnStyle = {
  flex: 1,
  padding: '8px',
  background: '#ef4444',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px'
};

const refreshBtnStyle = {
  padding: '10px 20px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px'
};

const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: '600'
};

const tdStyle = {
  padding: '12px 16px',
  color: 'white'
};

export default AdminDashboard;
