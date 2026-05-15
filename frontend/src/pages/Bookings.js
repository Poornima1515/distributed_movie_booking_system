import React, { useEffect, useState, useCallback } from 'react';
import API from '../api';
import Navbar from '../components/Navbar';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/bookings/user/${user._id}`);
      setBookings(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const toggleQR = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: '30px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0 }}>My Bookings</h1>
            <p style={{ color: '#94a3b8', margin: '5px 0 0' }}>
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchBookings} style={refreshBtnStyle}>
              🔄 Refresh
            </button>
            <button onClick={() => navigate('/home')} style={backBtnStyle}>
              ← Home
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <p style={{ fontSize: '18px' }}>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            border: '1px solid #334155'
          }}>
            <p style={{ fontSize: '48px', marginBottom: '10px' }}>🎟️</p>
            <h2 style={{ color: '#94a3b8' }}>No bookings yet</h2>
            <p style={{ color: '#64748b' }}>Book your first movie ticket!</p>
            <button onClick={() => navigate('/home')} style={{ ...btnPrimary, marginTop: '20px', width: 'auto', padding: '12px 30px' }}>
              Browse Movies
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map((booking) => {
              const qrData = JSON.stringify({
                bookingId: booking.bookingId,
                seats: booking.seats,
                amount: booking.totalAmount
              });
              const isExpanded = expandedId === booking._id;

              return (
                <div key={booking._id} style={{
                  background: '#1e293b',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #334155'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    {/* LEFT: BOOKING INFO */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h2 style={{ margin: '0 0 8px', color: 'white' }}>
                        🎬 {booking.movie?.title || 'Unknown Movie'}
                      </h2>
                      <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '14px' }}>
                        🏛️ {booking.theatre?.name || 'Unknown Theatre'}
                      </p>
                      <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '14px' }}>
                        💺 Seats: <span style={{ color: 'white' }}>{booking.seats?.join(', ')}</span>
                      </p>
                      <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '14px' }}>
                        💰 Amount: <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{booking.totalAmount}</span>
                      </p>
                      <p style={{ color: '#64748b', margin: '4px 0', fontSize: '12px', fontFamily: 'monospace' }}>
                        ID: {booking.bookingId}
                      </p>
                    </div>

                    {/* RIGHT: STATUS + QR TOGGLE */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                      <span style={{
                        background: booking.paymentStatus === 'SUCCESS' ? '#10b981' : '#ef4444',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {booking.paymentStatus || 'SUCCESS'}
                      </span>
                      <button
                        onClick={() => toggleQR(booking._id)}
                        style={{
                          padding: '8px 16px',
                          background: isExpanded ? '#334155' : '#0ea5e9',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}
                      >
                        {isExpanded ? '🔼 Hide QR' : '📱 Show QR'}
                      </button>
                    </div>
                  </div>

                  {/* QR CODE PANEL */}
                  {isExpanded && (
                    <div style={{
                      marginTop: '20px',
                      paddingTop: '20px',
                      borderTop: '1px solid #334155',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Scan at the theatre entrance</p>
                      <div style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
                        <QRCode value={qrData} size={160} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

const btnPrimary = {
  background: '#ff004f',
  border: 'none',
  borderRadius: '10px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 'bold',
  padding: '10px 20px'
};

const refreshBtnStyle = {
  padding: '10px 16px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold'
};

const backBtnStyle = {
  padding: '10px 16px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold'
};

export default Bookings;
