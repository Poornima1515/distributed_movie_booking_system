import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle, colors } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = () => { localStorage.clear(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: scrolled ? colors.navBg : colors.navBg,
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${colors.border}`,
      padding: '0 30px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      height: '64px',
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.15)' : 'none'
    }}>
      {/* LOGO */}
      <div onClick={() => navigate('/home')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg,#ff004f,#cc0040)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', boxShadow: '0 0 15px rgba(255,0,79,0.4)'
        }}>🎬</div>
        <span style={{ fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg,#ff004f,#ff6b9d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CineVerse
        </span>
      </div>

      {/* NAV LINKS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {[
          { label: '🏠 Home', path: '/home' },
          { label: '🎟️ My Bookings', path: '/bookings' },
          ...(user?.role === 'admin' ? [{ label: '⚙️ Admin', path: '/admin' }] : [])
        ].map(({ label, path }) => (
          <button key={path} onClick={() => navigate(path)} style={{
            background: isActive(path) ? 'rgba(255,0,79,0.12)' : 'transparent',
            border: isActive(path) ? '1px solid rgba(255,0,79,0.35)' : '1px solid transparent',
            borderRadius: '8px', padding: '8px 14px',
            color: isActive(path) ? '#ff004f' : colors.textMuted,
            cursor: 'pointer', fontSize: '14px', fontWeight: '600',
            transition: 'all 0.2s ease'
          }}>{label}</button>
        ))}
      </div>

      {/* RIGHT: THEME + USER + LOGOUT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* THEME TOGGLE */}
        <button onClick={toggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: colors.bg3, border: `1px solid ${colors.border}`,
          cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#ff004f,#6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 'bold', color: 'white'
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>{user.name}</span>
          </div>
        )}
        <button onClick={logout} style={{
          background: 'rgba(255,0,79,0.1)', border: '1px solid rgba(255,0,79,0.3)',
          borderRadius: '8px', padding: '8px 14px', color: '#ff004f',
          cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s ease'
        }}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;