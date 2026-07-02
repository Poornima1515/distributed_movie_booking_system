import React, { useEffect, useState, useCallback } from 'react';
import API from '../api';
import Navbar from '../components/Navbar';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';

const SOCKET_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [redeemInput, setRedeemInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const navigate = useNavigate();
  const { colors } = useTheme();
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

  const fetchLoyalty = useCallback(async () => {
    try {
      const res = await API.get('/loyalty/points');
      setLoyaltyData(res.data);
    } catch {
      // Ignore if not available
    }
  }, []);

  useEffect(() => { fetchBookings(); fetchLoyalty(); }, [fetchBookings, fetchLoyalty]);

  // Listen for seat reopened events to refresh
  useEffect(() => {
    socket.on('seatReopened', () => fetchBookings());
    return () => socket.off('seatReopened');
  }, [fetchBookings]);

  const toggleQR = (id) => setExpandedId(expandedId === id ? null : id);

  const handleRedeemPoints = () => {
    const pts = Number(redeemInput);
    if (!pts || pts < 100) return alert('Minimum 100 points required');
    if (pts % 100 !== 0) return alert('Must be in multiples of 100');
    const discount = Math.floor(pts / 100) * 50;
    alert(`ℹ️ How to use your ${pts} points (₹${discount} off):\n\n1. Go to Home → pick a movie\n2. Select your seats\n3. In the booking summary, find the 🌟 Loyalty Points section\n4. Enter ${pts} and click Apply\n5. ₹${discount} will be deducted from your total\n\nYour points are only deducted when you complete the booking.`);
    setRedeemInput('');
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel booking for ${booking.movie?.title}?\nYou will receive a 75% refund of ₹${Math.round(booking.totalAmount * 0.75)}.`)) return;
    setCancellingId(booking._id);
    try {
      const res = await API.patch(`/bookings/cancel/${booking._id}`);
      // Emit socket event so seats reopen in real-time
      socket.emit('bookingCancelled', {
        showId: booking.show?._id || booking.show,
        seats: booking.seats,
        userName: user.name,
        movieTitle: booking.movie?.title,
        theatreName: booking.theatre?.name
      });
      alert(`Booking cancelled. Refund of ₹${res.data.refundAmount} will be processed within 5-7 business days.`);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancellingId(null);
    }
  };

  const handleDownloadPDF = async (booking) => {
    try {
      const res = await fetch(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api')}/payment/ticket/${booking._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to download');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CineVerse-Ticket-${booking.bookingId?.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Could not download ticket. Try again.');
    }
  };

  const confirmed = bookings.filter(b => b.status !== 'CANCELLED');
  const cancelled = bookings.filter(b => b.status === 'CANCELLED');

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, padding: '30px', transition: 'background 0.3s' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: colors.text }}>🎟️ My Bookings</h1>
            <p style={{ color: '#94a3b8', margin: '5px 0 0', fontSize: '14px' }}>
              {confirmed.length} active · {cancelled.length} cancelled
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchBookings} style={refreshBtn}>🔄 Refresh</button>
            <button onClick={() => navigate('/home')} style={backBtn}>← Home</button>
          </div>
        </div>

        {/* LOYALTY POINTS CARD */}
        {loyaltyData && (
          <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', padding: '20px 24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🌟</div>
                <div>
                  <p style={{ color: '#818cf8', fontWeight: '800', fontSize: '18px', margin: 0 }}>{(loyaltyData.loyaltyPoints || 0).toLocaleString()} Points</p>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: '3px 0 0' }}>Worth ₹{loyaltyData.pointsValue || 0} · Total spent ₹{(loyaltyData.totalSpent || 0).toLocaleString()}</p>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                <p style={{ margin: 0 }}>1 point per ₹10 spent</p>
                <p style={{ margin: '4px 0 0', color: '#818cf8' }}>100 points = ₹50 off</p>
              </div>
            </div>
            {/* REDEEM SECTION */}
            {(loyaltyData.loyaltyPoints || 0) >= 100 && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '14px', borderTop: '1px solid rgba(99,102,241,0.2)' }}>
                <input
                  type="number" step="100" min="100" max={loyaltyData.loyaltyPoints}
                  placeholder="Points to redeem (min 100)"
                  value={redeemInput}
                  onChange={e => setRedeemInput(e.target.value)}
                  style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', color: 'white', fontSize: '14px', flex: 1, minWidth: '200px', outline: 'none' }}
                />
                <span style={{ color: '#818cf8', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  = ₹{redeemInput ? Math.floor(Number(redeemInput) / 100) * 50 : 0} off
                </span>
                <button onClick={handleRedeemPoints} disabled={!redeemInput}
                  style={{ padding: '8px 20px', background: '#6366f1', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                  How to use
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ fontSize: '18px' }}>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ background: '#111827', borderRadius: '20px', padding: '60px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '56px', marginBottom: '12px' }}>��️</p>
            <h2 style={{ color: '#94a3b8', fontWeight: '700' }}>No bookings yet</h2>
            <p style={{ color: '#64748b' }}>Book your first movie ticket!</p>
            <button onClick={() => navigate('/home')} style={{ ...primaryBtn, marginTop: '20px', width: 'auto', padding: '12px 30px' }}>
              Browse Movies
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map((booking) => {
              const isCancelled = booking.status === 'CANCELLED';
              const qrData = JSON.stringify({ bookingId: booking.bookingId, seats: booking.seats, amount: booking.totalAmount });
              const isExpanded = expandedId === booking._id;
              const isCancelling = cancellingId === booking._id;

              return (
                <div key={booking._id} style={{
                  background: '#111827',
                  borderRadius: '20px',
                  padding: '24px',
                  border: `1px solid ${isCancelled ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  opacity: isCancelled ? 0.75 : 1,
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    {/* LEFT */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'white' }}>
                          🎬 {booking.movie?.title || 'Unknown Movie'}
                        </h2>
                        <span style={{
                          background: isCancelled ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                          border: `1px solid ${isCancelled ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
                          color: isCancelled ? '#ef4444' : '#10b981',
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
                        }}>
                          {isCancelled ? '✕ CANCELLED' : '✓ CONFIRMED'}
                        </span>
                      </div>
                      <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>🏛️ {booking.theatre?.name || 'Unknown Theatre'}</p>
                      <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>🕐 {booking.show?.showTime || 'N/A'}</p>
                      <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>
                        💺 Seats: <span style={{ color: 'white', fontWeight: '600' }}>{booking.seats?.join(', ')}</span>
                      </p>
                      <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>
                        💰 Amount: <span style={{ color: '#10b981', fontWeight: '700' }}>₹{booking.totalAmount}</span>
                        {isCancelled && booking.refundAmount > 0 && (
                          <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>
                            (Refund: ₹{booking.refundAmount})
                          </span>
                        )}
                      </p>
                      {!isCancelled && booking.loyaltyPointsEarned > 0 && (
                        <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>
                          🌟 Points: <span style={{ color: '#818cf8', fontWeight: '700' }}>+{booking.loyaltyPointsEarned}</span>
                        </p>
                      )}
                      {booking.mealsTotal > 0 && (
                        <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>
                          🍿 Meals: <span style={{ color: '#f59e0b', fontWeight: '600' }}>₹{booking.mealsTotal}</span>
                        </p>
                      )}
                      <p style={{ color: '#334155', margin: '4px 0', fontSize: '11px', fontFamily: 'monospace' }}>
                        ID: {booking.bookingId}
                      </p>
                    </div>

                    {/* RIGHT: ACTIONS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      {!isCancelled && (
                        <>
                          <button onClick={() => toggleQR(booking._id)} style={{
                            padding: '8px 14px', background: isExpanded ? '#1e293b' : 'rgba(14,165,233,0.15)',
                            border: `1px solid ${isExpanded ? '#334155' : 'rgba(14,165,233,0.4)'}`,
                            borderRadius: '8px', color: isExpanded ? '#94a3b8' : '#0ea5e9',
                            cursor: 'pointer', fontSize: '12px', fontWeight: '700'
                          }}>
                            {isExpanded ? '🔼 Hide QR' : '📱 Show QR'}
                          </button>
                          <button onClick={() => handleDownloadPDF(booking)} style={{
                            padding: '8px 14px', background: 'rgba(99,102,241,0.15)',
                            border: '1px solid rgba(99,102,241,0.4)',
                            borderRadius: '8px', color: '#818cf8',
                            cursor: 'pointer', fontSize: '12px', fontWeight: '700'
                          }}>
                            📄 Download PDF
                          </button>
                          <button
                            onClick={() => handleCancel(booking)}
                            disabled={isCancelling}
                            style={{
                              padding: '8px 14px', background: 'rgba(239,68,68,0.1)',
                              border: '1px solid rgba(239,68,68,0.3)',
                              borderRadius: '8px', color: '#ef4444',
                              cursor: isCancelling ? 'not-allowed' : 'pointer',
                              fontSize: '12px', fontWeight: '700', opacity: isCancelling ? 0.6 : 1
                            }}>
                            {isCancelling ? '⏳ Cancelling...' : '✕ Cancel'}
                          </button>
                        </>
                      )}
                      {isCancelled && (
                        <span style={{ color: '#64748b', fontSize: '12px' }}>
                          Cancelled {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleDateString('en-IN') : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* QR PANEL */}
                  {isExpanded && !isCancelled && (
                    <div style={{
                      marginTop: '20px', paddingTop: '20px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                    }}>
                      <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>📱 Scan at the theatre entrance</p>
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

const primaryBtn = { background: '#ff004f', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: '700', padding: '10px 20px' };
const refreshBtn = { padding: '10px 16px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };
const backBtn = { padding: '10px 16px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };

export default Bookings;