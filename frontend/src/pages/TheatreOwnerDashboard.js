import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const TABS = ['Overview', 'Shows', 'Bookings', 'Meals', 'Revenue'];

function TheatreOwnerDashboard() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [theatre, setTheatre] = useState(null);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [meals, setMeals] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(false);

  // Meal form state
  const [showMealForm, setShowMealForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [mealForm, setMealForm] = useState({ name: '', description: '', price: '', category: 'snack', image: '', isAvailable: true });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [theatreRes, showsRes, bookingsRes, mealsRes, revenueRes] = await Promise.all([
        API.get('/theatre-owner/theatre'),
        API.get('/theatre-owner/shows'),
        API.get('/theatre-owner/bookings'),
        API.get('/theatre-owner/meals'),
        API.get('/theatre-owner/revenue')
      ]);
      setTheatre(theatreRes.data);
      setShows(showsRes.data);
      setBookings(bookingsRes.data);
      setMeals(mealsRes.data);
      setRevenue(revenueRes.data);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 404) {
        alert('No theatre is assigned to your account. Contact admin.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMeal) {
        await API.put(`/theatre-owner/meals/${editingMeal._id}`, mealForm);
      } else {
        await API.post('/theatre-owner/meals', mealForm);
      }
      setShowMealForm(false);
      setEditingMeal(null);
      setMealForm({ name: '', description: '', price: '', category: 'snack', image: '', isAvailable: true });
      const res = await API.get('/theatre-owner/meals');
      setMeals(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save meal');
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!window.confirm('Delete this meal?')) return;
    try {
      await API.delete(`/theatre-owner/meals/${id}`);
      setMeals(prev => prev.filter(m => m._id !== id));
    } catch { alert('Failed to delete meal'); }
  };

  const startEdit = (meal) => {
    setEditingMeal(meal);
    setMealForm({ name: meal.name, description: meal.description || '', price: meal.price, category: meal.category, image: meal.image || '', isAvailable: meal.isAvailable });
    setShowMealForm(true);
  };

  const confirmedBookings = bookings.filter(b => b.status !== 'CANCELLED');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

  return (
    <>
      <Navbar />
      <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text, padding: '30px', transition: 'background 0.3s' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#ff004f', fontSize: '32px', margin: 0, fontWeight: '900' }}>🎭 Theatre Owner Dashboard</h1>
            <p style={{ color: '#64748b', margin: '5px 0 0', fontSize: '14px' }}>{theatre?.name || 'My Theatre'} — Owner Panel</p>
          </div>
          <button onClick={fetchAll} disabled={loading} style={refreshBtnStyle}>
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '9px 18px', borderRadius: '10px',
              border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', fontWeight: '700', fontSize: '13px',
              background: activeTab === tab ? '#ff004f' : '#111827',
              color: activeTab === tab ? 'white' : '#94a3b8'
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div>
            {/* Theatre Info Card */}
            {theatre && (
              <div style={{ background: '#111827', border: '1px solid rgba(255,0,79,0.2)', borderRadius: '20px', padding: '28px', marginBottom: '30px' }}>
                <h2 style={{ margin: '0 0 16px', color: 'white', fontSize: '22px', fontWeight: '800' }}>🏛️ {theatre.name}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px' }}>
                  <InfoItem label="City" value={theatre.city || '—'} />
                  <InfoItem label="Screens" value={theatre.screens || '—'} />
                  <InfoItem label="Commission Rate" value={`${theatre.commissionRate}%`} />
                  <InfoItem label="Owner" value={theatre.owner?.name || '—'} />
                </div>
              </div>
            )}
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatCard label="Total Shows" value={shows.length} icon="🎭" color="#6366f1" />
              <StatCard label="Confirmed Bookings" value={confirmedBookings.length} icon="🎟️" color="#10b981" />
              <StatCard label="Cancelled" value={cancelledBookings.length} icon="✕" color="#ef4444" />
              <StatCard label="Total Revenue" value={`₹${(revenue?.computed?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="#ff004f" />
              <StatCard label="Your Share" value={`₹${(revenue?.computed?.ownerRevenue || 0).toLocaleString()}`} icon="🏦" color="#f59e0b" />
              <StatCard label="Meals on Menu" value={meals.length} icon="🍿" color="#0ea5e9" />
            </div>
          </div>
        )}

        {/* SHOWS TAB */}
        {activeTab === 'Shows' && (
          <div>
            <h2 style={{ marginBottom: '20px', fontWeight: '800' }}>My Shows ({shows.length})</h2>
            {shows.length === 0 ? <EmptyState message="No shows available yet." /> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' }}>
                {shows.map(show => {
                  const booked = show.bookedSeats?.length || 0;
                  const total = show.seats?.length || 50;
                  const pct = Math.round((booked / total) * 100);
                  const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981';
                  return (
                    <div key={show._id} style={cardStyle}>
                      <h3 style={{ margin: '0 0 8px', color: '#ff004f', fontSize: '16px', fontWeight: '800' }}>{show.movie?.title || 'Unknown'}</h3>
                      <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>🕐 {show.showTime}</p>
                      <p style={{ color: '#94a3b8', margin: '4px 0', fontSize: '13px' }}>💰 Rs.{show.price}</p>
                      <div style={{ margin: '10px 0 4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>Occupancy</span>
                        <span style={{ color, fontSize: '12px', fontWeight: '700' }}>{booked}/{total} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: '#0a0f1e', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pct + '%', background: color, borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'Bookings' && (
          <div>
            <h2 style={{ marginBottom: '20px', fontWeight: '800' }}>My Bookings ({bookings.length})</h2>
            {bookings.length === 0 ? <EmptyState message="No bookings yet." /> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#111827', color: '#94a3b8' }}>
                      {['Booking ID', 'User', 'Movie', 'Seats', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>{(b.bookingId || '').slice(0, 8)}...</span></td>
                        <td style={tdStyle}>{b.user?.name || '—'}</td>
                        <td style={tdStyle}>{b.movie?.title || '—'}</td>
                        <td style={tdStyle}>{(b.seats || []).join(', ')}</td>
                        <td style={tdStyle}><span style={{ color: '#10b981', fontWeight: '700' }}>₹{b.totalAmount}</span></td>
                        <td style={tdStyle}>
                          <span style={{ background: b.status === 'CANCELLED' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${b.status === 'CANCELLED' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`, color: b.status === 'CANCELLED' ? '#ef4444' : '#10b981', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{b.status}</span>
                        </td>
                        <td style={tdStyle}><span style={{ color: '#64748b', fontSize: '12px' }}>{b.bookedAt ? new Date(b.bookedAt).toLocaleDateString('en-IN') : '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MEALS TAB */}
        {activeTab === 'Meals' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: '800' }}>Meal Menu ({meals.length})</h2>
              <button onClick={() => { setShowMealForm(true); setEditingMeal(null); setMealForm({ name: '', description: '', price: '', category: 'snack', image: '', isAvailable: true }); }} style={addBtnStyle}>+ Add Meal</button>
            </div>

            {showMealForm && (
              <div style={{ background: '#111827', border: '1px solid rgba(255,0,79,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 20px', color: 'white' }}>{editingMeal ? 'Edit Meal' : 'Add New Meal'}</h3>
                <form onSubmit={handleMealSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }}>
                    <input required placeholder="Name *" value={mealForm.name} onChange={e => setMealForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                    <input required type="number" placeholder="Price (₹) *" value={mealForm.price} onChange={e => setMealForm(p => ({ ...p, price: e.target.value }))} style={inputStyle} />
                    <select value={mealForm.category} onChange={e => setMealForm(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                      <option value="snack">Snack</option>
                      <option value="drink">Drink</option>
                      <option value="combo">Combo</option>
                      <option value="dessert">Dessert</option>
                    </select>
                    <input placeholder="Image URL (optional)" value={mealForm.image} onChange={e => setMealForm(p => ({ ...p, image: e.target.value }))} style={inputStyle} />
                    <input placeholder="Description (optional)" value={mealForm.description} onChange={e => setMealForm(p => ({ ...p, description: e.target.value }))} style={inputStyle} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" checked={mealForm.isAvailable} onChange={e => setMealForm(p => ({ ...p, isAvailable: e.target.checked }))} id="avail" />
                      <label htmlFor="avail" style={{ color: '#94a3b8', fontSize: '14px' }}>Available</label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button type="submit" style={addBtnStyle}>{editingMeal ? 'Update Meal' : 'Add Meal'}</button>
                    <button type="button" onClick={() => { setShowMealForm(false); setEditingMeal(null); }} style={cancelBtnStyle}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {meals.length === 0 ? <EmptyState message="No meals on the menu yet. Add your first item!" /> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '20px' }}>
                {meals.map(meal => (
                  <div key={meal._id} style={{ ...cardStyle, opacity: meal.isAvailable ? 1 : 0.6 }}>
                    {meal.image && <img src={meal.image} alt={meal.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 4px', color: 'white', fontSize: '15px', fontWeight: '700' }}>{meal.name}</h3>
                      <span style={{ background: 'rgba(255,0,79,0.15)', border: '1px solid rgba(255,0,79,0.3)', color: '#ff004f', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>₹{meal.price}</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 8px' }}>{meal.category} {!meal.isAvailable && '· Unavailable'}</p>
                    {meal.description && <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 12px' }}>{meal.description}</p>}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEdit(meal)} style={editBtnStyle}>Edit</button>
                      <button onClick={() => handleDeleteMeal(meal._id)} style={deleteBtnStyle}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === 'Revenue' && (
          <div>
            <h2 style={{ marginBottom: '24px', fontWeight: '800' }}>Revenue Breakdown</h2>
            {!revenue ? <EmptyState message="Loading revenue data..." /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '20px' }}>
                  <StatCard label="Total Revenue" value={`₹${(revenue.computed?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="#ff004f" />
                  <StatCard label="Your Share" value={`₹${(revenue.computed?.ownerRevenue || 0).toLocaleString()}`} icon="🏦" color="#10b981" />
                  <StatCard label="Admin Commission" value={`₹${(revenue.computed?.adminRevenue || 0).toLocaleString()}`} icon="🏢" color="#6366f1" />
                  <StatCard label="Total Bookings" value={revenue.totalBookings || 0} icon="🎟️" color="#f59e0b" />
                </div>

                {/* Revenue split visual */}
                <div style={{ background: '#111827', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 style={{ margin: '0 0 20px', color: 'white', fontWeight: '800' }}>Revenue Split</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px', width: '160px' }}>Your Share ({100 - (revenue.theatre?.commissionRate || 10)}%)</span>
                    <div style={{ flex: 1, height: '12px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${100 - (revenue.theatre?.commissionRate || 10)}%`, background: '#10b981', borderRadius: '6px' }} />
                    </div>
                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '14px', width: '80px', textAlign: 'right' }}>₹{(revenue.computed?.ownerRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px', width: '160px' }}>Admin Commission ({revenue.theatre?.commissionRate || 10}%)</span>
                    <div style={{ flex: 1, height: '12px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${revenue.theatre?.commissionRate || 10}%`, background: '#6366f1', borderRadius: '6px' }} />
                    </div>
                    <span style={{ color: '#6366f1', fontWeight: '700', fontSize: '14px', width: '80px', textAlign: 'right' }}>₹{(revenue.computed?.adminRevenue || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Per-movie breakdown */}
                {(revenue.movieBreakdown || []).length > 0 && (
                  <div style={{ background: '#111827', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ margin: '0 0 20px', color: 'white', fontWeight: '800' }}>Revenue by Movie</h3>
                    {revenue.movieBreakdown.map((item, i) => {
                      const max = revenue.movieBreakdown[0]?.revenue || 1;
                      const pct = Math.round((item.revenue / max) * 100);
                      const colors = ['#ff004f', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b'];
                      return (
                        <div key={i} style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{item.movie}</span>
                            <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '700' }}>₹{item.revenue?.toLocaleString()} · {item.tickets} tickets</span>
                          </div>
                          <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: pct + '%', background: colors[i % colors.length], borderRadius: '4px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: '#111827', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `4px solid ${color}` }}>
      <span style={{ fontSize: '28px' }}>{icon}</span>
      <p style={{ color: '#64748b', fontSize: '12px', margin: '8px 0 4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: '900', color: 'white', margin: 0 }}>{value}</p>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
      <p style={{ color: 'white', fontSize: '15px', fontWeight: '700', margin: 0 }}>{value}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ background: '#111827', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ fontSize: '18px' }}>{message}</p>
    </div>
  );
}

const cardStyle = { background: '#111827', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' };
const addBtnStyle = { padding: '10px 20px', background: '#ff004f', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '14px' };
const cancelBtnStyle = { padding: '10px 20px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer', fontWeight: '700', fontSize: '14px' };
const editBtnStyle = { flex: 1, padding: '8px', background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: '8px', color: '#0ea5e9', cursor: 'pointer', fontWeight: '700', fontSize: '13px' };
const deleteBtnStyle = { flex: 1, padding: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontWeight: '700', fontSize: '13px' };
const refreshBtnStyle = { padding: '10px 20px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '14px' };
const tdStyle = { padding: '12px 16px', color: 'white' };
const inputStyle = { padding: '10px 14px', background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontSize: '14px', width: '100%', boxSizing: 'border-box' };

export default TheatreOwnerDashboard;
