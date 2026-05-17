import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const BG = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const registerUser = async () => {
    if (!form.name || !form.email || !form.password) { alert('Please fill all fields'); return; }
    setLoading(true);
    try {
      await API.post('/auth/register', { ...form, role: 'user' });
      alert('Registration Successful! Please login.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      <img src={BG} alt="cinema" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.2)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(10,15,30,0.95) 0%,rgba(30,10,50,0.85) 100%)' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#ff004f,#cc0040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 0 30px rgba(255,0,79,0.5)' }}>🎬</div>
            <span style={{ fontSize: '28px', fontWeight: '900', background: 'linear-gradient(135deg,#ff004f,#ff6b9d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CineVerse</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: '900', color: 'white', lineHeight: 1.1, marginBottom: '16px' }}>
            Join the<br />
            <span style={{ background: 'linear-gradient(135deg,#ff004f,#ff6b9d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Cinema Revolution.</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '380px', lineHeight: 1.7 }}>
            Create your account and start booking tickets for the latest blockbusters instantly.
          </p>
        </motion.div>
      </div>

      <div style={{ width: '460px', minWidth: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}
        >
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>Create account</h2>
          <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '14px' }}>Fill in your details to get started</p>

          {[
            { name: 'name', label: 'Full Name', icon: <FaUser color="#64748b" size={14} />, placeholder: 'Your name', type: 'text' },
            { name: 'email', label: 'Email address', icon: <FaEnvelope color="#64748b" size={14} />, placeholder: 'you@example.com', type: 'email' },
            { name: 'password', label: 'Password', icon: <FaLock color="#64748b" size={14} />, placeholder: 'Create a password', type: 'password' },
          ].map(({ name, label, icon, placeholder, type }) => (
            <div key={name} style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>{label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px' }}>
                {icon}
                <input name={name} type={type} placeholder={placeholder} value={form[name]} onChange={handleChange}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '15px' }} />
              </div>
            </div>
          ))}

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={registerUser} disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? '#334155' : 'linear-gradient(135deg,#ff004f,#cc0040)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', boxShadow: loading ? 'none' : '0 8px 25px rgba(255,0,79,0.35)', marginTop: '8px' }}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </motion.button>

          <p style={{ marginTop: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ff004f', textDecoration: 'none', fontWeight: '700' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;