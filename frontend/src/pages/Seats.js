import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function Seats() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [seatOwners, setSeatOwners] = useState({});
  const [bookedSeats, setBookedSeats] = useState([]);
  const [timeLeft, setTimeLeft] = useState(120);

  const currentUserId = JSON.parse(localStorage.getItem('user'))._id;

  // FETCH SHOW
  const fetchShow = useCallback(async () => {
    try {
      const res = await API.get('/admin/shows');
      const selectedShow = res.data.find((s) => s._id === showId);
      setShow(selectedShow);
      setBookedSeats(selectedShow?.bookedSeats || []);
    } catch (error) {
      console.log(error);
    }
  }, [showId]);

  // FETCH LOCKS
  const fetchLockedSeats = useCallback(async () => {
    try {
      const res = await API.get(`/bookings/locks/${showId}`);
      setLockedSeats(res.data.lockedSeats || []);
      setSeatOwners(res.data.seatOwners || {});
    } catch (error) {
      console.log(error);
    }
  }, [showId]);

  // INITIAL LOAD + JOIN SOCKET ROOM
  useEffect(() => {
    fetchShow();
    fetchLockedSeats();
    socket.emit('joinShow', showId);

    return () => {
      socket.emit('leaveShow', showId);
    };
  }, [fetchShow, fetchLockedSeats, showId]);

  // SOCKET EVENTS
  useEffect(() => {
    socket.on('seatLocked', (data) => {
      setLockedSeats((prev) => [...new Set([...prev, ...data.seats])]);
      setSeatOwners((prev) => {
        const updated = { ...prev };
        data.seats.forEach((seat) => { updated[seat] = data.userId; });
        return updated;
      });
    });

    socket.on('seatUnlocked', (data) => {
      setLockedSeats((prev) => prev.filter((s) => s !== data.seat));
    });

    socket.on('bookingConfirmed', (data) => {
      setBookedSeats((prev) => [...new Set([...prev, ...data.seats])]);
      // Remove from locked
      setLockedSeats((prev) => prev.filter((s) => !data.seats.includes(s)));
    });

    return () => {
      socket.off('seatLocked');
      socket.off('seatUnlocked');
      socket.off('bookingConfirmed');
    };
  }, []);

  // COUNTDOWN TIMER (resets when seats are locked)
  useEffect(() => {
    const mySeats = lockedSeats.filter(
      (seat) => String(seatOwners[seat]) === String(currentUserId)
    );
    if (mySeats.length === 0) return;

    setTimeLeft(120);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockedSeats.length]); // eslint-disable-line

  // MY LOCKED SEATS
  const mySeats = lockedSeats.filter(
    (seat) => String(seatOwners[seat]) === String(currentUserId)
  );

  const ticketPrice = show?.price || 200;
  const totalPrice = mySeats.length * ticketPrice;

  // TOGGLE SEAT (lock / unlock)
  const toggleSeat = async (seat) => {
    if (bookedSeats.includes(seat)) return;

    const ownerId = String(seatOwners[seat]);
    const isMine = ownerId === String(currentUserId);

    if (lockedSeats.includes(seat) && !isMine) {
      alert(`${seat} is already locked by another user`);
      return;
    }

    if (isMine) {
      // UNLOCK
      try {
        await API.post('/bookings/unlock', { showId, seat });
        socket.emit('seatUnlocked', { showId, seat });
        setLockedSeats((prev) => prev.filter((s) => s !== seat));
      } catch (error) {
        console.log(error);
      }
      return;
    }

    // LOCK
    try {
      await API.post('/bookings/lock', { showId, seats: [seat], userId: currentUserId });
      setLockedSeats((prev) => [...new Set([...prev, seat])]);
      setSeatOwners((prev) => ({ ...prev, [seat]: currentUserId }));
      socket.emit('seatLocked', { showId, seats: [seat], userId: currentUserId });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to lock seat');
    }
  };

  // RAZORPAY PAYMENT
  const handlePayment = async () => {
    try {
      const { data: order } = await axios.post(
        'http://localhost:5000/api/payment/create-order',
        { amount: totalPrice }
      );

      const options = {
        key: 'rzp_test_SouWI5KXK5cZAk',
        amount: order.amount,
        currency: order.currency,
        name: 'CineVerse',
        description: `${show.movie?.title} — ${mySeats.join(', ')}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              'http://localhost:5000/api/payment/verify',
              { ...response, seats: mySeats, showId, userId: currentUserId }
            );
            if (verifyRes.data.success) {
              socket.emit('bookingConfirmed', { showId, seats: mySeats });
              navigate('/success', { state: { booking: verifyRes.data.booking } });
            }
          } catch (err) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('user'))?.name || '',
        },
        theme: { color: '#ff004f' }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      alert('Payment failed. Please try again.');
    }
  };

  if (!show) {
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: 'white' }}>Loading show...</h2>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', padding: '30px' }}>

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          style={{ background: '#1e293b', border: '1px solid #334155', padding: '10px 20px', borderRadius: '10px', color: 'white', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
        >
          ← Go Back
        </button>

        {/* SHOW INFO */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ margin: '0 0 4px', color: '#ff004f' }}>{show.movie?.title}</h1>
          <p style={{ color: '#94a3b8', margin: '2px 0' }}>🏛️ {show.theatre?.name}</p>
          <p style={{ color: '#94a3b8', margin: '2px 0' }}>🕐 {show.showTime} &nbsp;|&nbsp; 💰 ₹{ticketPrice} per seat</p>
        </div>

        {/* TIMER */}
        {mySeats.length > 0 && (
          <div style={{
            background: timeLeft < 30 ? '#7f1d1d' : '#1e293b',
            border: `1px solid ${timeLeft < 30 ? '#ef4444' : '#334155'}`,
            padding: '12px 20px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'inline-block'
          }}>
            <span style={{ color: timeLeft < 30 ? '#fca5a5' : 'orange', fontWeight: 'bold' }}>
              ⏱ Complete payment in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}

        {/* LEGEND */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <LegendItem color="#00b300" label="Your Selection" />
          <LegendItem color="#1e293b" label="Available" border="1px solid #334155" />
          <LegendItem color="#64748b" label="Locked by Others" />
          <LegendItem color="#ff0000" label="Booked" />
        </div>

        {/* SCREEN */}
        <div style={{
          width: '70%', margin: '20px auto 30px', background: '#cbd5e1',
          color: '#111827', textAlign: 'center', padding: '10px',
          borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', letterSpacing: '2px'
        }}>
          ▲ SCREEN ▲
        </div>

        {/* SEAT GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px', maxWidth: '700px', margin: '0 auto' }}>
          {show.seats.map((seat) => {
            const isLocked = lockedSeats.includes(seat);
            const isBooked = bookedSeats.includes(seat);
            const isMine = String(seatOwners[seat]) === String(currentUserId);

            let bg = '#1e293b';
            let border = '1px solid #334155';
            if (isBooked) { bg = '#ff0000'; border = 'none'; }
            else if (isLocked && isMine) { bg = '#00b300'; border = 'none'; }
            else if (isLocked) { bg = '#64748b'; border = 'none'; }

            return (
              <button
                key={seat}
                onClick={() => toggleSeat(seat)}
                title={isBooked ? 'Booked' : isLocked && !isMine ? 'Locked' : seat}
                style={{
                  padding: '12px 4px',
                  border,
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  background: bg,
                  color: 'white',
                  cursor: isBooked ? 'not-allowed' : 'pointer',
                  transition: '0.2s'
                }}
              >
                {seat}
              </button>
            );
          })}
        </div>

        {/* SUMMARY + PAYMENT */}
        <div style={{
          marginTop: '40px',
          background: '#1e293b',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #334155',
          maxWidth: '700px',
          margin: '40px auto 0'
        }}>
          <h2 style={{ margin: '0 0 10px' }}>
            Selected: {mySeats.length > 0 ? mySeats.join(', ') : 'None'}
          </h2>
          <h2 style={{ margin: '0 0 20px', color: '#10b981' }}>
            Total: ₹{totalPrice}
          </h2>
          <button
            disabled={mySeats.length === 0}
            onClick={handlePayment}
            style={{
              width: '100%',
              padding: '16px',
              background: mySeats.length === 0 ? '#334155' : '#ff004f',
              border: 'none',
              borderRadius: '12px',
              color: mySeats.length === 0 ? '#64748b' : 'white',
              fontSize: '18px',
              cursor: mySeats.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {mySeats.length === 0 ? 'Select seats to continue' : `💳 Pay ₹${totalPrice}`}
          </button>
        </div>

      </div>
    </>
  );
}

function LegendItem({ color, label, border }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '20px', height: '20px', background: color, borderRadius: '4px', border: border || 'none' }} />
      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</span>
    </div>
  );
}

export default Seats;
