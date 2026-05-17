import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';

const socket = io('http://localhost:5000');

function Seats() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [seatOwners, setSeatOwners] = useState({});
  const [bookedSeats, setBookedSeats] = useState([]);
  const [timeLeft, setTimeLeft] = useState(120);

  const { colors } = useTheme();

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const currentUserId = user?._id;

  // FETCH SHOW
  const fetchShow = useCallback(async () => {
    try {
      const res = await API.get(`/admin/show/${showId}`);
      setShow(res.data);
      setBookedSeats(res.data?.bookedSeats || []);
    } catch (error) {
      console.log(error);
    }
  }, [showId]);

  // FETCH LOCKED SEATS
  const fetchLockedSeats = useCallback(async () => {
    try {
      const res = await API.get(`/bookings/locks/${showId}`);

      setLockedSeats(res.data.lockedSeats || []);
      setSeatOwners(res.data.seatOwners || {});
    } catch (error) {
      console.log(error);
    }
  }, [showId]);

  // INITIAL LOAD
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
    const handleSeatLocked = (data) => {
      setLockedSeats((prev) => [...new Set([...prev, ...data.seats])]);

      setSeatOwners((prev) => {
        const updated = { ...prev };

        data.seats.forEach((seat) => {
          updated[seat] = data.userId;
        });

        return updated;
      });
    };

    const handleSeatUnlocked = (data) => {
      setLockedSeats((prev) =>
        prev.filter((seat) => seat !== data.seat)
      );

      setSeatOwners((prev) => {
        const updated = { ...prev };
        delete updated[data.seat];
        return updated;
      });
    };

    const handleBookingConfirmed = (data) => {
      setBookedSeats((prev) => [
        ...new Set([...prev, ...data.seats])
      ]);

      setLockedSeats((prev) =>
        prev.filter((seat) => !data.seats.includes(seat))
      );
    };

    const handleSeatReopened = (data) => {
      setBookedSeats((prev) =>
        prev.filter((seat) => !data.seats.includes(seat))
      );
    };

    socket.on('seatLocked', handleSeatLocked);
    socket.on('seatUnlocked', handleSeatUnlocked);
    socket.on('bookingConfirmed', handleBookingConfirmed);
    socket.on('seatReopened', handleSeatReopened);

    return () => {
      socket.off('seatLocked', handleSeatLocked);
      socket.off('seatUnlocked', handleSeatUnlocked);
      socket.off('bookingConfirmed', handleBookingConfirmed);
      socket.off('seatReopened', handleSeatReopened);
    };
  }, []);

  // MY SEATS
  const mySeats = lockedSeats.filter(
    (seat) =>
      String(seatOwners[seat]) === String(currentUserId)
  );

  // TIMER
  useEffect(() => {
    if (mySeats.length === 0) return;

    setTimeLeft(120);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mySeats.length]);

  const ticketPrice = show?.price || 200;
  const totalPrice = mySeats.length * ticketPrice;

  // DISPLAY SEATS
  const displaySeats =
    show?.seats?.length > 0
      ? show.seats
      : (() => {
          const seats = [];

          ['A', 'B', 'C', 'D', 'E'].forEach((row) => {
            for (let i = 1; i <= 10; i++) {
              seats.push(`${row}${i}`);
            }
          });

          return seats;
        })();

  // TOGGLE SEAT
  const toggleSeat = async (seat) => {
    if (bookedSeats.includes(seat)) return;

    const isMine =
      String(seatOwners[seat]) === String(currentUserId);

    // LOCKED BY OTHER USER
    if (lockedSeats.includes(seat) && !isMine) {
      alert(`${seat} is locked by another user`);
      return;
    }

    // UNLOCK MY SEAT
    if (isMine) {
      try {
        await API.post('/bookings/unlock', {
          showId,
          seat
        });

        socket.emit('seatUnlocked', {
          showId,
          seat
        });

      } catch (error) {
        console.log(error);
      }

      return;
    }

    // LOCK SEAT
    try {
      await API.post('/bookings/lock', {
        showId,
        seats: [seat],
        userId: currentUserId
      });

      socket.emit('seatLocked', {
        showId,
        seats: [seat],
        userId: currentUserId
      });

    } catch (error) {
      alert(
        error.response?.data?.message ||
          'Failed to lock seat'
      );
    }
  };

  // PAYMENT
  const handlePayment = async () => {
    try {
      const { data: order } = await axios.post(
        'http://localhost:5000/api/payment/create-order',
        {
          amount: totalPrice
        }
      );

      const options = {
        key: 'rzp_test_SouWI5KXK5cZAk',
        amount: order.amount,
        currency: order.currency,
        name: 'CineVerse',
        description: `${show.movie?.title} — ${mySeats.join(', ')}`,
        order_id: order.id,

        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              'http://localhost:5000/api/payment/verify',
              {
                ...response,
                seats: mySeats,
                showId,
                userId: currentUserId
              }
            );

            if (verifyRes.data.success) {
              socket.emit('bookingConfirmed', {
                showId,
                seats: mySeats,
                userName: user.name,
                movieTitle: show.movie?.title,
                theatreName: show.theatre?.name
              });

              navigate('/success', {
                state: {
                  booking: verifyRes.data.booking
                }
              });
            }
          } catch (error) {
            alert('Payment verification failed.');
          }
        },

        prefill: {
          name: user?.name || ''
        },

        theme: {
          color: '#ff004f'
        }
      };

      const razor = new window.Razorpay(options);
      razor.open();

    } catch (error) {
      alert('Payment failed. Try again.');
    }
  };

  // LOADING
  if (!show) {
    return (
      <div
        style={{
          background: colors.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}
          >
            🎬
          </div>

          <p style={{ color: '#94a3b8' }}>
            Loading show...
          </p>
        </div>
      </div>
    );
  }

  const rows = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div
      style={{
        background: colors.bg,
        minHeight: '100vh'
      }}
    >
      <Navbar />

      {/* YOUR EXISTING JSX UI CONTINUES HERE */}

    </div>
  );
}

export default Seats;