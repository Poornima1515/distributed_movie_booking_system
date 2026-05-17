import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import { useTheme } from '../context/ThemeContext';

function Revenue() {
  const { colors } = useTheme();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    API.get('/analytics').then(r => setAnalytics(r.data)).catch(console.log);
  }, []);

  if (!analytics) return (
    <><Navbar /><div style={{ background:'#0a0f1e', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'#94a3b8' }}>Loading...</p></div></>
  );

  return (
    <>
      <Navbar />
      <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, padding: '30px', transition: 'background 0.3s' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>📊 Revenue Dashboard</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>Live analytics from your booking system</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'Total Revenue', value: `₹${analytics.summary?.totalRevenue?.toLocaleString()}`, color: '#10b981', icon: '💰' },
            { label: 'Tickets Sold', value: analytics.summary?.totalTickets, color: '#6366f1', icon: '🎟️' },
            { label: 'Total Bookings', value: analytics.summary?.totalBookings, color: '#0ea5e9', icon: '📋' },
            { label: 'Cancelled', value: analytics.summary?.cancelledBookings, color: '#ef4444', icon: '✕' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={{ background: '#111827', padding: '24px', borderRadius: '16px', borderLeft: `4px solid ${color}` }}>
              <span style={{ fontSize: '28px' }}>{icon}</span>
              <p style={{ color: '#64748b', fontSize: '12px', margin: '8px 0 4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
              <p style={{ fontSize: '26px', fontWeight: '900', color: 'white', margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
        <div style={{ background: '#111827', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: '800' }}>🏛️ Revenue Per Theatre</h3>
          {analytics.revenuePerTheatre?.map((item, i) => {
            const max = analytics.revenuePerTheatre[0]?.revenue || 1;
            const pct = Math.round((item.revenue / max) * 100);
            return (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'white', fontWeight: '600' }}>{item.theatre}</span>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>₹{item.revenue?.toLocaleString()}</span>
                </div>
                <div style={{ height: '10px', background: '#1e293b', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: '#10b981', borderRadius: '5px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Revenue;