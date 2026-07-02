import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';

function Success() {
  const { colors } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const loyaltyPointsEarned = location.state?.loyaltyPointsEarned || booking?.loyaltyPointsEarned || 0;

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/payment/ticket/${booking._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CineVerse-Ticket-${booking.bookingId?.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not download ticket. Try again.');
    }
  };

  if (!booking) {
    return (
      <div style={{ background: '#0a0f1e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h1>No Booking Found</h1>
          <button onClick={() => navigate('/home')} style={btnPrimary}>Go to Home</button>
        </div>
      </div>
    );
  }

  const qrData = JSON.stringify({ bookingId: booking.bookingId, seats: booking.seats, amount: booking.totalAmount });

  return (
    <>
      <Navbar />
      <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px', transition: 'background 0.3s' }}>
        <div style={{ background: colors.bg2, padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '520px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

          {/* SUCCESS ANIMATION */}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 16px' }}>✅</div>
          <h1 style={{ color: '#10b981', margin: '0 0 6px', fontSize: '28px', fontWeight: '900' }}>Booking Confirmed!</h1>
          <p style={{ color: '#94a3b8', marginBottom: '28px', fontSize: '14px' }}>Your tickets are ready. Check your email for the ticket.</p>

          {/* LOYALTY POINTS EARNED */}
          {loyaltyPointsEarned > 0 && (
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '14px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🌟</span>
              <div>
                <p style={{ color: '#818cf8', fontWeight: '800', fontSize: '16px', margin: 0 }}>+{loyaltyPointsEarned} Loyalty Points Earned!</p>
                <p style={{ color: '#64748b', fontSize: '12px', margin: '3px 0 0' }}>Keep booking to earn more rewards</p>
              </div>
            </div>
          )}

          {/* QR CODE */}
          <div style={{ background: 'white', padding: '20px', display: 'inline-block', borderRadius: '16px', marginBottom: '28px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
            <QRCode value={qrData} size={180} />
          </div>

          {/* BOOKING DETAILS */}
          <div style={{ background: colors.bg3, borderRadius: '16px', padding: '20px', textAlign: 'left', marginBottom: '28px', border: '1px solid '+colors.border }}>
            <DetailRow label="Booking ID" value={booking.bookingId} mono />
            <DetailRow label="Seats" value={booking.seats?.join(', ')} />
            <DetailRow label="Amount" value={`₹${booking.totalAmount}`} green />
            {booking.mealsTotal > 0 && <DetailRow label="Meals" value={`₹${booking.mealsTotal}`} />}
            {booking.movie?.title && <DetailRow label="Movie" value={booking.movie.title} />}
            {booking.theatre?.name && <DetailRow label="Theatre" value={booking.theatre.name} />}
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={handleDownloadPDF} style={{ ...btnPrimary, background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
              📄 Download PDF Ticket
            </button>
            <button onClick={() => navigate('/bookings')} style={btnPrimary}>
              🎟️ View My Bookings
            </button>
            <button onClick={() => navigate('/home')} style={btnSecondary}>
              🏠 Go to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value, mono, green }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: '#64748b', fontSize: '13px' }}>{label}</span>
      <span style={{ color: green ? '#10b981' : 'white', fontSize: '13px', fontFamily: mono ? 'monospace' : 'inherit', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all', fontWeight: green ? '700' : '500' }}>
        {value}
      </span>
    </div>
  );
}

const btnPrimary = { width: '100%', padding: '14px', background: 'linear-gradient(135deg,#ff004f,#cc0040)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 20px rgba(255,0,79,0.3)' };
const btnSecondary = { width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '15px' };

export default Success;