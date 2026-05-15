import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import Navbar from '../components/Navbar';

function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h1>No Booking Found</h1>
          <button onClick={() => navigate('/home')} style={btnPrimary}>Go to Home</button>
        </div>
      </div>
    );
  }

  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    seats: booking.seats,
    amount: booking.totalAmount
  });

  return (
    <>
      <Navbar />
      <div style={{
        background: '#0f172a',
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px'
      }}>
        <div style={{
          background: '#1e293b',
          padding: '40px',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center',
          border: '1px solid #334155'
        }}>
          {/* SUCCESS ICON */}
          <div style={{ fontSize: '60px', marginBottom: '10px' }}>✅</div>
          <h1 style={{ color: '#10b981', margin: '0 0 5px' }}>Booking Confirmed!</h1>
          <p style={{ color: '#94a3b8', marginBottom: '25px' }}>Your tickets are ready</p>

          {/* QR CODE */}
          <div style={{
            background: 'white',
            padding: '20px',
            display: 'inline-block',
            borderRadius: '12px',
            marginBottom: '25px'
          }}>
            <QRCode value={qrData} size={180} />
          </div>

          {/* BOOKING DETAILS */}
          <div style={{
            background: '#0f172a',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '25px'
          }}>
            <DetailRow label="Booking ID" value={booking.bookingId} mono />
            <DetailRow label="Seats" value={booking.seats?.join(', ')} />
            <DetailRow label="Amount" value={`₹${booking.totalAmount}`} />
            {booking.movie?.title && <DetailRow label="Movie" value={booking.movie.title} />}
            {booking.theatre?.name && <DetailRow label="Theatre" value={booking.theatre.name} />}
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

function DetailRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</span>
      <span style={{ color: 'white', fontSize: '13px', fontFamily: mono ? 'monospace' : 'inherit', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>
        {value}
      </span>
    </div>
  );
}

const btnPrimary = {
  width: '100%',
  padding: '14px',
  background: '#ff004f',
  border: 'none',
  borderRadius: '10px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold'
};

const btnSecondary = {
  width: '100%',
  padding: '14px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '16px'
};

export default Success;
