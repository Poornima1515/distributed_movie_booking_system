import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await API.get('/users/profile');
      setProfile(res.data.user);
      setRecentBookings(res.data.recentBookings || []);
      setNameInput(res.data.user.name);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/users/profile', { name: nameInput });
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: res.data.user.name }));
      setProfile(res.data.user);
      alert('Name updated successfully!');
    } catch (err) { alert(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) return alert('New passwords do not match');
    setChangingPass(true);
    try {
      await API.put('/users/password', { oldPassword: oldPass, newPassword: newPass });
      alert('Password changed successfully!');
      setOldPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) { alert(err.response?.data?.message || 'Failed to change password'); }
    finally { setChangingPass(false); }
  };

  if (!profile) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8' }}>Loading profile...</p>
    </div>
  );

  const roleColor = profile.role === 'admin' ? '#ff004f' : profile.role === 'theatreOwner' ? '#f59e0b' : '#10b981';

  return (
    <>
      <Navbar />
      <div style={{ background: colors.bg, minHeight: '100vh', padding: '30px', color: colors.text }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* HEADER */}
          <div style={{ background: 'linear-gradient(135deg,rgba(255,0,79,0.1),rgba(99,102,241,0.1))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff004f,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', color: 'white', flexShrink: 0 }}>
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: '900', color: 'white' }}>{profile.name}</h1>
              <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '14px' }}>{profile.email}</p>
              <span style={{ background: `rgba(${roleColor === '#ff004f' ? '255,0,79' : roleColor === '#f59e0b' ? '245,158,11' : '16,185,129'},0.15)`, border: `1px solid ${roleColor}44`, color: roleColor, padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                {profile.role}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '16px', padding: '16px 20px' }}>
                <p style={{ color: '#818cf8', fontWeight: '900', fontSize: '22px', margin: 0 }}>{(profile.loyaltyPoints || 0).toLocaleString()}</p>
                <p style={{ color: '#64748b', fontSize: '12px', margin: '4px 0 0' }}>Loyalty Points</p>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {['overview', 'edit', 'security'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '9px 20px', borderRadius: '10px', border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.08)', background: activeTab === tab ? '#ff004f' : '#111827', color: activeTab === tab ? 'white' : '#94a3b8', cursor: 'pointer', fontWeight: '700', fontSize: '13px', textTransform: 'capitalize' }}>
                {tab === 'overview' ? '📊 Overview' : tab === 'edit' ? '✏️ Edit Profile' : '🔒 Security'}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px' }}>
                <StatCard label="Total Spent" value={`₹${(profile.totalSpent || 0).toLocaleString()}`} icon="💰" color="#10b981" />
                <StatCard label="Loyalty Points" value={(profile.loyaltyPoints || 0).toLocaleString()} icon="🌟" color="#818cf8" />
                <StatCard label="Points Worth" value={`₹${Math.floor((profile.loyaltyPoints || 0) / 100) * 50}`} icon="🎁" color="#f59e0b" />
              </div>
              <div style={{ background: '#111827', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: '800', color: 'white' }}>Recent Bookings</h3>
                {recentBookings.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No bookings yet</p>
                ) : recentBookings.map(b => (
                  <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <p style={{ margin: 0, color: 'white', fontWeight: '600', fontSize: '14px' }}>{b.movie?.title || 'Movie'}</p>
                      <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '12px' }}>{b.theatre?.name} · {b.seats?.join(', ')}</p>
                    </div>
                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '14px' }}>₹{b.totalAmount}</span>
                  </div>
                ))}
                <button onClick={() => navigate('/bookings')} style={{ marginTop: '16px', padding: '10px 20px', background: 'rgba(255,0,79,0.1)', border: '1px solid rgba(255,0,79,0.3)', borderRadius: '10px', color: '#ff004f', cursor: 'pointer', fontWeight: '700', fontSize: '13px', width: '100%' }}>
                  View All Bookings →
                </button>
              </div>
            </div>
          )}

          {/* EDIT PROFILE */}
          {activeTab === 'edit' && (
            <div style={{ background: '#111827', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ margin: '0 0 20px', fontWeight: '800', color: 'white' }}>✏️ Update Name</h3>
              <form onSubmit={handleUpdateName}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Full Name</label>
                  <input value={nameInput} onChange={e => setNameInput(e.target.value)} required minLength={2} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Email (cannot be changed)</label>
                  <input value={profile.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <button type="submit" disabled={saving} style={btnStyle}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </form>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div style={{ background: '#111827', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ margin: '0 0 20px', fontWeight: '800', color: 'white' }}>🔒 Change Password</h3>
              <form onSubmit={handleChangePassword}>
                {[
                  { label: 'Current Password', val: oldPass, set: setOldPass },
                  { label: 'New Password', val: newPass, set: setNewPass },
                  { label: 'Confirm New Password', val: confirmPass, set: setConfirmPass }
                ].map(({ label, val, set }) => (
                  <div key={label} style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>{label}</label>
                    <input type="password" value={val} onChange={e => set(e.target.value)} required minLength={6} style={inputStyle} />
                  </div>
                ))}
                <button type="submit" disabled={changingPass} style={btnStyle}>{changingPass ? 'Changing...' : 'Change Password'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: '#111827', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `4px solid ${color}` }}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <p style={{ color: '#64748b', fontSize: '11px', margin: '8px 0 4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
      <p style={{ fontSize: '20px', fontWeight: '900', color: 'white', margin: 0 }}>{value}</p>
    </div>
  );
}

const labelStyle = { display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
const btnStyle = { padding: '12px 24px', background: '#ff004f', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '14px' };

export default Profile;
