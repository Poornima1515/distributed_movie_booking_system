import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { io } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';

const socket = io('http://localhost:5000');

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const show = location.state?.show;
  const selectedSeats = location.state?.selectedSeats;

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');

  // Guard: if navigated directly without state
  if (!show || !selectedSeats) {
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2>No payment data found.</h2>
          <button
            onClick={() => navigate('/home')}
            style={{ marginTop: '20px', padding: '12px 24px', background: '#ff004f', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '16px' }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = selectedSeats.length * show.price;

  const confirmBooking = async () => {
    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
      alert('Enter valid UPI ID');
      return;
    }
    if (paymentMethod === 'CARD' && (cardNumber.length < 16 || cvv.length < 3)) {
      alert('Invalid Card Details');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await API.post('/bookings/confirm', {
        user: user._id,
        movie: show.movie._id,
        theatre: show.theatre._id,
        show: show._id,
        seats: selectedSeats,
        totalAmount
      });

      socket.emit('bookingConfirmed', { showId: show._id, seats: selectedSeats });
      navigate('/success', { state: { booking: res.data.booking } });
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', padding: '30px' }}>
        <h1>Payment</h1>
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '20px', maxWidth: '500px', marginTop: '30px' }}>
          <h2>{show.movie.title}</h2>
          <p>Seats: {selectedSeats.join(', ')}</p>
          <p>Amount: ₹{totalAmount}</p>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%', padding: '12px', marginTop: '20px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
          >
            <option value="UPI">UPI</option>
            <option value="CARD">Credit/Debit Card</option>
          </select>

          {paymentMethod === 'UPI' && (
            <input
              placeholder="Enter UPI ID (e.g. name@upi)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              style={{ width: '100%', padding: '12px', marginTop: '20px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', boxSizing: 'border-box' }}
            />
          )}

          {paymentMethod === 'CARD' && (
            <div>
              <input
                placeholder="Card Number (16 digits)"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={16}
                style={{ width: '100%', padding: '12px', marginTop: '20px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', boxSizing: 'border-box' }}
              />
              <input
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                maxLength={4}
                style={{ width: '100%', padding: '12px', marginTop: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <button
            onClick={confirmBooking}
            style={{ width: '100%', padding: '15px', background: '#ff004f', border: 'none', borderRadius: '10px', color: 'white', marginTop: '30px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </>
  );
}

export default Payment;