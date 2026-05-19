import React, { useEffect, useState, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';

// Single socket instance outside component so it persists across renders
const SOCKET_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';
const socket = io(SOCKET_URL, { autoConnect: true });

const LOCK_DURATION = 120; // seconds

function Seats() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const [show, setShow] = useState(null);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [seatOwners, setSeatOwners] = useState({});
  const [bookedSeats, setBookedSeats] = useState([]);
  const [timeLeft, setTimeLeft] = useState(LOCK_DURATION);

  // Track when the current user locked their seats (timestamp)
  const lockStartRef = useRef(null);
  const timerRef = useRef(null);
  // Track previous mySeats count to detect first selection
  const prevMySeatCountRef = useRef(0);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const currentUserId = user?._id;

  // ─── FETCH SHOW ───────────────────────────────────────────────
  const fetchShow = useCallback(async () => {
    try {
      const res = await API.get(`/admin/show/${showId}`);
      setShow(res.data);
      setBookedSeats(res.data?.bookedSeats || []);
    } catch (err) {
      console.error('fetchShow error:', err);
    }
  }, [showId]);

  // ─── FETCH LOCKED SEATS ───────────────────────────────────────
  const fetchLockedSeats = useCallback(async () => {
    try {
      const res = await API.get(`/bookings/locks/${showId}`);
      setLockedSeats(res.data.lockedSeats || []);
      setSeatOwners(res.data.seatOwners || {});
    } catch (err) {
      console.error('fetchLockedSeats error:', err);
    }
  }, [showId]);

  // ─── INITIAL LOAD + SOCKET JOIN ───────────────────────────────
  useEffect(() => {
    fetchShow();
    fetchLockedSeats();
    socket.emit('joinShow', showId);

    // Poll every 10s to sync expired locks from other users
    const pollInterval = setInterval(fetchLockedSeats, 10000);

    return () => {
      socket.emit('leaveShow', showId);
      clearInterval(pollInterval);
    };
  }, [fetchShow, fetchLockedSeats, showId]);

  // ─── SOCKET EVENTS ────────────────────────────────────────────
  useEffect(() => {
    const onSeatLocked = (data) => {
      setLockedSeats((prev) => [...new Set([...prev, ...data.seats])]);
      setSeatOwners((prev) => {
        const updated = { ...prev };
        data.seats.forEach((s) => { updated[s] = data.userId; });
        return updated;
      });
    };

    const onSeatUnlocked = (data) => {
      setLockedSeats((prev) => prev.filter((s) => s !== data.seat));
      setSeatOwners((prev) => {
        const updated = { ...prev };
        delete updated[data.seat];
        return updated;
      });
    };

    // Fired when a user's lock timer expires — releases seats for everyone
    const onSeatsExpired = (data) => {
      setLockedSeats((prev) => prev.filter((s) => !data.seats.includes(s)));
      setSeatOwners((prev) => {
        const updated = { ...prev };
        data.seats.forEach((s) => { delete updated[s]; });
        return updated;
      });
    };

    const onBookingConfirmed = (data) => {
      setBookedSeats((prev) => [...new Set([...prev, ...data.seats])]);
      setLockedSeats((prev) => prev.filter((s) => !data.seats.includes(s)));
      setSeatOwners((prev) => {
        const updated = { ...prev };
        data.seats.forEach((s) => { delete updated[s]; });
        return updated;
      });
    };

    const onSeatReopened = (data) => {
      setBookedSeats((prev) => prev.filter((s) => !data.seats.includes(s)));
    };

    socket.on('seatLocked', onSeatLocked);
    socket.on('seatUnlocked', onSeatUnlocked);
    socket.on('seatsExpired', onSeatsExpired);
    socket.on('bookingConfirmed', onBookingConfirmed);
    socket.on('seatReopened', onSeatReopened);

    return () => {
      socket.off('seatLocked', onSeatLocked);
      socket.off('seatUnlocked', onSeatUnlocked);
      socket.off('seatsExpired', onSeatsExpired);
      socket.off('bookingConfirmed', onBookingConfirmed);
      socket.off('seatReopened', onSeatReopened);
    };
  }, []);

  // ─── DERIVE MY SEATS ─────────────────────────────────────────
  const mySeats = lockedSeats.filter(
    (seat) => String(seatOwners[seat]) === String(currentUserId)
  );

  // ─── TIMER — starts when first seat is selected, counts down ──
  useEffect(() => {
    const wasZero = prevMySeatCountRef.current === 0;
    const isNowPositive = mySeats.length > 0;

    // Start timer only when going from 0 → 1+ seats
    if (wasZero && isNowPositive) {
      lockStartRef.current = Date.now();
      setTimeLeft(LOCK_DURATION);

      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lockStartRef.current) / 1000);
        const remaining = LOCK_DURATION - elapsed;

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setTimeLeft(0);
          handleExpiry();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }

    // Stop timer when all seats are deselected
    if (mySeats.length === 0) {
      clearInterval(timerRef.current);
      lockStartRef.current = null;
      setTimeLeft(LOCK_DURATION);
    }

    prevMySeatCountRef.current = mySeats.length;
  // eslint-disable-line
  }, [mySeats.length]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Keep a ref to latest seatOwners so handleExpiry can read it without stale closure
  const seatOwnersRef = useRef({});
  useEffect(() => {
    seatOwnersRef.current = seatOwners;
  }, [seatOwners]);

  const lockedSeatsRef = useRef([]);
  useEffect(() => {
    lockedSeatsRef.current = lockedSeats;
  }, [lockedSeats]);

  // ─── HANDLE LOCK EXPIRY ───────────────────────────────────────
  // Called when the 120s timer hits 0 — unlocks all held seats
  const handleExpiry = useCallback(() => {
    const currentLocked = lockedSeatsRef.current;
    const currentOwners = seatOwnersRef.current;

    const expiredSeats = currentLocked.filter(
      (s) => String(currentOwners[s]) === String(currentUserId)
    );

    if (expiredSeats.length === 0) return;

    // Unlock each seat in Redis
    expiredSeats.forEach((seat) => {
      API.post('/bookings/unlock', { showId, seat }).catch(console.error);
    });

    // Notify all clients in the room
    socket.emit('seatsExpired', { showId, seats: expiredSeats });

    // Clean up local state
    setLockedSeats((prev) => prev.filter((s) => !expiredSeats.includes(s)));
    setSeatOwners((prev) => {
      const updated = { ...prev };
      expiredSeats.forEach((s) => { delete updated[s]; });
      return updated;
    });
  // eslint-disable-line
  }, [showId, currentUserId]);

  // ─── TOGGLE SEAT ─────────────────────────────────────────────
  const toggleSeat = async (seat) => {
    if (bookedSeats.includes(seat)) return;

    const isMine = String(seatOwners[seat]) === String(currentUserId);
    const isLockedByOther = lockedSeats.includes(seat) && !isMine;

    if (isLockedByOther) {
      alert(`Seat ${seat} is currently held by another user`);
      return;
    }

    if (isMine) {
      // Deselect: unlock
      try {
        await API.post('/bookings/unlock', { showId, seat });
        // Emit to all clients (server broadcasts to whole room)
        socket.emit('seatUnlocked', { showId, seat });
      } catch (err) {
        console.error('unlock error:', err);
      }
      return;
    }

    // Check if timer already expired for this session
    if (lockStartRef.current !== null) {
      const elapsed = Math.floor((Date.now() - lockStartRef.current) / 1000);
      if (elapsed >= LOCK_DURATION) {
        alert('Your seat hold has expired. Please start over.');
        return;
      }
    }

    // Select: lock
    try {
      await API.post('/bookings/lock', {
        showId,
        seats: [seat],
        userId: currentUserId
      });
      // Emit to all clients (server broadcasts to whole room)
      socket.emit('seatLocked', {
        showId,
        seats: [seat],
        userId: currentUserId
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to lock seat. It may have just been taken.');
      // Refresh locked seats to get latest state
      fetchLockedSeats();
    }
  };

  // ─── PAYMENT ─────────────────────────────────────────────────
  const handlePayment = async () => {
    if (mySeats.length === 0) return;

    // Check timer hasn't expired
    if (lockStartRef.current !== null) {
      const elapsed = Math.floor((Date.now() - lockStartRef.current) / 1000);
      if (elapsed >= LOCK_DURATION) {
        alert('Your seat hold has expired. Please reselect your seats.');
        return;
      }
    }

    try {
      const { data: order } = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/payment/create-order`,
        { amount: totalPrice }
      );

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_SouWI5KXK5cZAk',
        amount: order.amount,
        currency: order.currency,
        name: 'CineVerse',
        description: `${show.movie?.title} - ${mySeats.join(', ')}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/payment/verify`,
              { ...response, seats: mySeats, showId, userId: currentUserId }
            );
            if (verifyRes.data.success) {
              socket.emit('bookingConfirmed', {
                showId,
                seats: mySeats,
                userName: user.name,
                movieTitle: show.movie?.title,
                theatreName: show.theatre?.name
              });
              navigate('/success', { state: { booking: verifyRes.data.booking } });
            }
          } catch {
            alert('Payment verification failed.');
          }
        },
        prefill: { name: user?.name || '' },
        theme: { color: '#ff004f' }
      };

      new window.Razorpay(options).open();
    } catch {
      alert('Payment failed. Try again.');
    }
  };

  // ─── DERIVED VALUES ───────────────────────────────────────────
  const ticketPrice = show?.price || 200;
  const totalPrice = mySeats.length * ticketPrice;

  const displaySeats =
    show?.seats?.length > 0
      ? show.seats
      : ['A', 'B', 'C', 'D', 'E'].flatMap((row) =>
          Array.from({ length: 10 }, (_, i) => `${row}${i + 1}`)
        );

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsByRow = rows.reduce((acc, row) => {
    acc[row] = displaySeats.filter((s) => s.startsWith(row));
    return acc;
  }, {});

  const getSeatStyle = (seat) => {
    const isMine = String(seatOwners[seat]) === String(currentUserId);
    const isBooked = bookedSeats.includes(seat);
    const isLockedByOther = lockedSeats.includes(seat) && !isMine;

    const base = {
      width: '38px',
      height: '38px',
      borderRadius: '8px 8px 4px 4px',
      border: 'none',
      fontSize: '11px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: isBooked || isLockedByOther ? 'not-allowed' : 'pointer',
      transition: 'transform 0.15s, opacity 0.15s',
      opacity: isBooked ? 0.5 : 1
    };

    if (isBooked) return { ...base, background: '#374151', color: '#6b7280' };
    if (isMine) return { ...base, background: 'linear-gradient(135deg,#ff004f,#cc0040)', color: 'white', boxShadow: '0 4px 12px rgba(255,0,79,0.5)' };
    if (isLockedByOther) return { ...base, background: '#78350f', color: '#fbbf24' };
    return { ...base, background: '#1e3a5f', color: '#93c5fd', border: '1px solid #2563eb' };
  };

  // Timer color
  const timerColor = timeLeft <= 30 ? '#ef4444' : timeLeft <= 60 ? '#f59e0b' : '#ff004f';

  // ─── LOADING ─────────────────────────────────────────────────
  if (!show) {
    return (
      <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
          <p style={{ color: '#94a3b8' }}>Loading show...</p>
        </div>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div style={{ background: colors.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px' }}>

        {/* SHOW INFO */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px 24px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 6px' }}>
              {show.movie?.title}
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
              {show.theatre?.name}&nbsp;&nbsp;•&nbsp;&nbsp;{show.showTime}&nbsp;&nbsp;•&nbsp;&nbsp;Rs.{ticketPrice} / seat
            </p>
          </div>

          {/* COUNTDOWN TIMER — only shown when user has seats held */}
          {mySeats.length > 0 && (
            <div style={{ background: `rgba(${timeLeft <= 30 ? '239,68,68' : '255,0,79'},0.1)`, border: `1px solid rgba(${timeLeft <= 30 ? '239,68,68' : '255,0,79'},0.35)`, borderRadius: '12px', padding: '10px 18px', textAlign: 'center', minWidth: '90px' }}>
              <div style={{ color: timerColor, fontWeight: '800', fontSize: '20px', fontVariantNumeric: 'tabular-nums' }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                {timeLeft <= 30 ? 'Expiring soon!' : 'Hold expires'}
              </div>
            </div>
          )}
        </div>

        {/* SCREEN */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', width: '60%', height: '6px', background: 'linear-gradient(90deg, transparent, #6366f1, #a855f7, #6366f1, transparent)', borderRadius: '3px', marginBottom: '6px' }} />
          <p style={{ color: '#64748b', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>Screen</p>
        </div>

        {/* SEAT GRID */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
          {rows.map((row) => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', width: '20px', textAlign: 'center', flexShrink: 0 }}>
                {row}
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(seatsByRow[row] || []).map((seat) => (
                  <button
                    key={seat}
                    onClick={() => toggleSeat(seat)}
                    style={getSeatStyle(seat)}
                    title={
                      bookedSeats.includes(seat)
                        ? 'Already booked'
                        : lockedSeats.includes(seat) && String(seatOwners[seat]) !== String(currentUserId)
                        ? 'Held by another user'
                        : `Seat ${seat}`
                    }
                  >
                    {seat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* LEGEND */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { bg: '#1e3a5f', border: '1px solid #2563eb', label: 'Available' },
            { bg: '#ff004f', label: 'Your selection' },
            { bg: '#78350f', label: 'Held by others' },
            { bg: '#374151', label: 'Booked' }
          ].map(({ bg, border, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: bg, border: border || 'none', flexShrink: 0 }} />
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* BOOKING SUMMARY */}
        {mySeats.length > 0 ? (
          <div style={{ background: 'rgba(255,0,79,0.05)', border: '1px solid rgba(255,0,79,0.2)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', margin: '0 0 16px' }}>
              Your Selection
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {mySeats.map((seat) => (
                <span
                  key={seat}
                  onClick={() => toggleSeat(seat)}
                  style={{ background: 'rgba(255,0,79,0.15)', border: '1px solid rgba(255,0,79,0.4)', borderRadius: '8px', padding: '4px 12px', color: '#ff004f', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                  title="Click to deselect"
                >
                  {seat} ✕
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                  {mySeats.length} seat{mySeats.length > 1 ? 's' : ''} × Rs.{ticketPrice}
                </span>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginLeft: '12px' }}>
                  = Rs.{totalPrice}
                </span>
              </div>
              <button
                onClick={handlePayment}
                disabled={timeLeft === 0}
                style={{ background: timeLeft === 0 ? '#374151' : 'linear-gradient(135deg,#ff004f,#cc0040)', border: 'none', borderRadius: '12px', padding: '14px 32px', color: timeLeft === 0 ? '#6b7280' : 'white', cursor: timeLeft === 0 ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: timeLeft === 0 ? 'none' : '0 4px 20px rgba(255,0,79,0.4)' }}
              >
                {timeLeft === 0 ? 'Hold Expired' : `Pay Rs.${totalPrice}`}
              </button>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Click on an available seat to select it
          </p>
        )}

      </div>
    </div>
  );
}

export default Seats;
