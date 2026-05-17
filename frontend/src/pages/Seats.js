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
  const user = JSON.parse(localStorage.getItem('user'));
  const currentUserId = user._id;

  const fetchShow = useCallback(async () => {
    try {
      const res = await API.get(`/admin/show/${showId}`);
      setShow(res.data);
      setBookedSeats(res.data?.bookedSeats || []);
    } catch (e) { console.log(e); }
  }, [showId]);

  const fetchLockedSeats = useCallback(async () => {
    try {
      const res = await API.get(`/bookings/locks/${showId}`);
      setLockedSeats(res.data.lockedSeats || []);
      setSeatOwners(res.data.seatOwners || {});
    } catch (e) { console.log(e); }
  }, [showId]);

  useEffect(() => {
    fetchShow(); fetchLockedSeats();
    socket.emit('joinShow', showId);
    return () => { socket.emit('leaveShow', showId); };
  }, [fetchShow, fetchLockedSeats, showId]);

  useEffect(() => {
    socket.on('seatLocked', (data) => {
      setLockedSeats(prev => [...new Set([...prev, ...data.seats])]);
      setSeatOwners(prev => { const u = { ...prev }; data.seats.forEach(s => { u[s] = data.userId; }); return u; });
    });
    socket.on('seatUnlocked', (data) => {
      setLockedSeats(prev => prev.filter(s => s !== data.seat));
      setSeatOwners(prev => { const u = { ...prev }; delete u[data.seat]; return u; });
    });
    socket.on('bookingConfirmed', (data) => {
      setBookedSeats(prev => [...new Set([...prev, ...data.seats])]);
      setLockedSeats(prev => prev.filter(s => !data.seats.includes(s)));
    });
    socket.on('seatReopened', (data) => {
      setBookedSeats(prev => prev.filter(s => !data.seats.includes(s)));
    });
    return () => { socket.off('seatLocked'); socket.off('seatUnlocked'); socket.off('bookingConfirmed'); socket.off('seatReopened'); };
  }, []);

  useEffect(() => {
    const mySeats = lockedSeats.filter(s => String(seatOwners[s]) === String(currentUserId));
    if (mySeats.length === 0) return;
    setTimeLeft(120);
    const timer = setInterval(() => setTimeLeft(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; }), 1000);
    return () => clearInterval(timer);
  }, [lockedSeats.length]); // eslint-disable-line

  const mySeats = lockedSeats.filter(s => String(seatOwners[s]) === String(currentUserId));
  const ticketPrice = show?.price || 200;
  const totalPrice = mySeats.length * ticketPrice;

  const displaySeats = (show?.seats?.length > 0) ? show.seats : (() => {
    const s = []; ['A','B','C','D','E'].forEach(r => { for (let i=1;i<=10;i++) s.push(`${r}${i}`); }); return s;
  })();

  const toggleSeat = async (seat) => {
    if (bookedSeats.includes(seat)) return;
    const isMine = String(seatOwners[seat]) === String(currentUserId);
    if (lockedSeats.includes(seat) && !isMine) { alert(`${seat} is locked by another user`); return; }
    if (isMine) {
      try {
        await API.post('/bookings/unlock', { showId, seat });
        socket.emit('seatUnlocked', { showId, seat });
        setLockedSeats(prev => prev.filter(s => s !== seat));
        setSeatOwners(prev => { const u = { ...prev }; delete u[seat]; return u; });
      } catch (e) { console.log(e); }
      return;
    }
    try {
      await API.post('/bookings/lock', { showId, seats: [seat], userId: currentUserId });
      setLockedSeats(prev => [...new Set([...prev, seat])]);
      setSeatOwners(prev => ({ ...prev, [seat]: currentUserId }));
      socket.emit('seatLocked', { showId, seats: [seat], userId: currentUserId });
    } catch (e) { alert(e.response?.data?.message || 'Failed to lock seat'); }
  };

  const handlePayment = async () => {
    try {
      const { data: order } = await axios.post('http://localhost:5000/api/payment/create-order', { amount: totalPrice });
      const options = {
        key: 'rzp_test_SouWI5KXK5cZAk',
        amount: order.amount, currency: order.currency,
        name: 'CineVerse',
        description: `${show.movie?.title} — ${mySeats.join(', ')}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post('http://localhost:5000/api/payment/verify', { ...response, seats: mySeats, showId, userId: currentUserId });
            if (verifyRes.data.success) {
              socket.emit('bookingConfirmed', {
                showId, seats: mySeats,
                userName: user.name,
                movieTitle: show.movie?.title,
                theatreName: show.theatre?.name
              });
              navigate('/success', { state: { booking: verifyRes.data.booking } });
            }
          } catch { alert('Payment verification failed.'); }
        },
        prefill: { name: user?.name || '' },
        theme: { color: '#ff004f' }
      };
      new window.Razorpay(options).open();
    } catch (e) { alert('Payment failed. Try again.'); }
  };

  if (!show) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div><p style={{ color: '#94a3b8' }}>Loading show...</p></div>
    </div>
  );

  const rows = ['A','B','C','D','E'];

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', transition: 'background 0.3s' }}>
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg,rgba(255,0,79,0.08),rgba(10,15,30,0))', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 30px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 16px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', marginBottom: '12px' }}>← Back</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'white', margin: '0 0 6px' }}>{show.movie?.title}</h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>🏛️ {show.theatre?.name}</span>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>🕐 {show.showTime}</span>
              <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '700' }}>₹{ticketPrice} / seat</span>
            </div>
          </div>
          {mySeats.length > 0 && (
            <div style={{ background: timeLeft < 30 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.1)', border: `1px solid ${timeLeft < 30 ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.3)'}`, borderRadius: '12px', padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>TIME REMAINING</div>
              <div style={{ color: timeLeft < 30 ? '#ef4444' : '#f59e0b', fontSize: '24px', fontWeight: '900', fontFamily: 'monospace' }}>
                {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[{ color:'#10b981',label:'Your Selection' },{ color:'#1e293b',label:'Available',border:'1px solid #334155' },{ color:'#64748b',label:'Locked by Others' },{ color:'#ef4444',label:'Booked' }].map(({ color, label, border }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '18px', height: '18px', background: color, borderRadius: '4px', border: border || 'none' }} />
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', width: '60%', padding: '10px 40px', background: 'linear-gradient(180deg,rgba(255,255,255,0.15),rgba(255,255,255,0.03))', borderRadius: '4px 4px 50% 50% / 4px 4px 20px 20px', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', fontSize: '12px', fontWeight: '700', letterSpacing: '4px' }}>SCREEN</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
          {rows.map(row => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#334155', fontSize: '13px', fontWeight: '700', width: '20px', textAlign: 'center' }}>{row}</span>
              <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'center' }}>
                {displaySeats.filter(s => s.startsWith(row)).map(seat => {
                  const isBooked = bookedSeats.includes(seat);
                  const isLocked = lockedSeats.includes(seat);
                  const isMine = String(seatOwners[seat]) === String(currentUserId);
                  let bg = '#1e293b', border = '1px solid #334155', cursor = 'pointer';
                  if (isBooked) { bg = '#ef4444'; border = 'none'; cursor = 'not-allowed'; }
                  else if (isMine) { bg = '#10b981'; border = 'none'; }
                  else if (isLocked) { bg = '#64748b'; border = 'none'; cursor = 'not-allowed'; }
                  return (
                    <button key={seat} onClick={() => toggleSeat(seat)} title={isBooked ? 'Booked' : isLocked && !isMine ? 'Locked' : `Seat ${seat}`}
                      style={{ width: '44px', height: '40px', border, borderRadius: '8px 8px 4px 4px', background: bg, color: 'white', cursor, fontSize: '11px', fontWeight: '700', transition: 'all 0.15s ease', transform: isMine ? 'scale(1.1)' : 'scale(1)', boxShadow: isMine ? '0 0 12px rgba(16,185,129,0.5)' : 'none' }}>
                      {seat.slice(1)}
                    </button>
                  );
                })}
              </div>
              <span style={{ color: '#334155', fontSize: '13px', fontWeight: '700', width: '20px', textAlign: 'center' }}>{row}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>Selected Seats</div>
              <div style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>{mySeats.length > 0 ? mySeats.join(', ') : 'None selected'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>Total Amount</div>
              <div style={{ color: '#10b981', fontSize: '32px', fontWeight: '900' }}>₹{totalPrice}</div>
            </div>
          </div>
          <button disabled={mySeats.length === 0} onClick={handlePayment} style={{ width: '100%', padding: '16px', background: mySeats.length === 0 ? '#1e293b' : 'linear-gradient(135deg,#ff004f,#cc0040)', border: mySeats.length === 0 ? '1px solid #334155' : 'none', borderRadius: '14px', color: mySeats.length === 0 ? '#64748b' : 'white', fontSize: '18px', cursor: mySeats.length === 0 ? 'not-allowed' : 'pointer', fontWeight: '800', boxShadow: mySeats.length > 0 ? '0 8px 30px rgba(255,0,79,0.4)' : 'none', transition: 'all 0.3s ease' }}>
            {mySeats.length === 0 ? 'Select seats to continue' : `🎬 Pay ₹${totalPrice} for ${mySeats.length} seat${mySeats.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Seats;