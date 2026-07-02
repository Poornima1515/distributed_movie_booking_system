import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useTheme } from '../context/ThemeContext';

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recBasis, setRecBasis] = useState('');
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchMovie(); fetchShows(); fetchReviews(); }, [id]);

  const fetchMovie = async () => {
    try {
      const res = await API.get(`/movies/${id}`);
      setMovie(res.data);
      fetchRecommendations(id);
    } catch (error) { console.log(error); }
  };

  const fetchShows = async () => {
    try {
      const res = await API.get('/admin/shows');
      setShows(res.data.filter(s => s.movie?._id === id));
    } catch (error) { console.log(error); }
  };

  const fetchRecommendations = async (movieId) => {
    try {
      const res = await API.get(`/movies/${movieId}/recommendations`);
      setRecommendations(res.data.recommendations || []);
      setRecBasis(res.data.basedOn || 'genre');
    } catch (error) { console.log(error); }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/movie/${id}`);
      setReviews(res.data);
      // Check if user already reviewed
      const mine = res.data.find(r => r.user?._id === user._id || r.user === user._id);
      if (mine) { setMyRating(mine.rating); setMyReview(mine.review || ''); }
      // Check if user can review (has booking)
      const bRes = await API.get(`/bookings/user/${user._id}`);
      const hasBooked = bRes.data.some(b => (b.movie?._id || b.movie) === id && b.status === 'CONFIRMED');
      setCanReview(hasBooked);
    } catch (e) { console.log(e); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!myRating) return alert('Please select a rating');
    setSubmittingReview(true);
    try {
      await API.post('/reviews', { movieId: id, rating: myRating, review: myReview });
      alert('Review submitted!');
      fetchReviews();
      fetchMovie(); // refresh average rating
    } catch (err) { alert(err.response?.data?.message || 'Failed to submit review'); }
    finally { setSubmittingReview(false); }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await API.delete(`/reviews/${reviewId}`);
      fetchReviews(); fetchMovie();
    } catch (err) { alert('Failed to delete review'); }
  };

  if (!movie) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
        <p style={{ color: '#94a3b8', fontSize: '18px' }}>Loading movie...</p>
      </div>
    </div>
  );

  const availableSeats = shows.reduce((sum, s) => sum + ((s.seats?.length || 50) - (s.bookedSeats?.length || 0)), 0);

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', transition: 'background 0.3s' }}>
      <Navbar />

      {/* BACKDROP HERO */}
      <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
        {!imgError && movie.poster ? (
          <img src={movie.poster} alt={movie.title} onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px) brightness(0.25)', transform: 'scale(1.1)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a0a2e,#0a0f1e)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,15,30,0.3) 0%, rgba(10,15,30,0.7) 60%, #0a0f1e 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px', display: 'flex', gap: '30px', alignItems: 'flex-end' }}>
          <div style={{ width: '160px', minWidth: '160px', height: '240px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            {!imgError && movie.poster ? (
              <img src={movie.poster} alt={movie.title} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e293b,#0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🎬</div>
            )}
          </div>
          <div style={{ flex: 1, paddingBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <Badge text={movie.genre} color="#ff004f" />
              <Badge text={movie.language} color="#6366f1" />
              <Badge text={movie.duration} color="#0ea5e9" />
            </div>
            <h1 style={{ fontSize: 'clamp(24px,4vw,48px)', fontWeight: '900', color: 'white', margin: '0 0 10px', lineHeight: 1.1 }}>{movie.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ color: '#fbbf24', fontWeight: '700', fontSize: '18px' }}>⭐ {movie.rating}</span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>{availableSeats} seats available</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 20px', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginBottom: '30px' }}>
          ← Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }}>
          <div>
            {movie.description && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '30px' }}>
                <h3 style={{ color: '#ff004f', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Synopsis</h3>
                <p style={{ color: '#94a3b8', lineHeight: '1.8', fontSize: '15px' }}>{movie.description}</p>
              </div>
            )}

            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>🎭 Available Shows</h2>
            {shows.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎭</div>
                <p style={{ color: '#64748b', fontSize: '16px' }}>No shows scheduled yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {shows.map(show => {
                  const booked = show.bookedSeats?.length || 0;
                  const total = show.seats?.length || 50;
                  const pct = Math.round((booked / total) * 100);
                  return (
                    <div key={show._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '18px' }}>🏛️</span>
                          <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>{show.theatre?.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#94a3b8', fontSize: '13px' }}>🕐 {show.showTime}</span>
                          <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '600' }}>₹{show.price}</span>
                          <span style={{ color: pct > 80 ? '#ef4444' : '#64748b', fontSize: '13px' }}>{total - booked} seats left</span>
                        </div>
                        <div style={{ marginTop: '10px', height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981', borderRadius: '2px' }} />
                        </div>
                      </div>
                      <button onClick={() => navigate(`/seats/${show._id}`)} style={{ background: 'linear-gradient(135deg,#ff004f,#cc0040)', border: 'none', borderRadius: '12px', padding: '12px 24px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 15px rgba(255,0,79,0.3)', whiteSpace: 'nowrap' }}>
                        Select Seats →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* REVIEWS SECTION */}
            <div style={{ marginTop: '40px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
                ⭐ Reviews {movie.totalReviews > 0 && <span style={{ color: '#f59e0b', fontSize: '18px' }}>({movie.averageRating}/5 · {movie.totalReviews} reviews)</span>}
              </h2>
              {/* WRITE REVIEW */}
              {canReview && (
                <div style={{ background: '#111827', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 style={{ margin: '0 0 16px', color: 'white', fontSize: '16px', fontWeight: '700' }}>✍️ Write a Review</h3>
                  <form onSubmit={handleSubmitReview}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setMyRating(s)}
                          style={{ fontSize: '28px', background: 'transparent', border: 'none', cursor: 'pointer', filter: s <= myRating ? 'none' : 'grayscale(1)', transform: s <= myRating ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s' }}>⭐</button>
                      ))}
                      {myRating > 0 && <span style={{ color: '#f59e0b', alignSelf: 'center', fontWeight: '700' }}>{myRating}/5</span>}
                    </div>
                    <textarea value={myReview} onChange={e => setMyReview(e.target.value)} placeholder="Share your thoughts (optional)" maxLength={500} rows={3}
                      style={{ width: '100%', padding: '10px 14px', background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', outline: 'none', marginBottom: '12px' }} />
                    <button type="submit" disabled={submittingReview || !myRating}
                      style={{ padding: '10px 24px', background: submittingReview ? '#334155' : '#ff004f', border: 'none', borderRadius: '10px', color: 'white', cursor: submittingReview ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '14px' }}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}
              {/* REVIEWS LIST */}
              {reviews.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No reviews yet. Be the first!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{ background: '#111827', borderRadius: '14px', padding: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff004f,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>
                            {r.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, color: 'white', fontWeight: '600', fontSize: '14px' }}>{r.user?.name}</p>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#f59e0b', fontWeight: '700' }}>{'⭐'.repeat(r.rating)}</span>
                          {(r.user?._id === user._id || r.user === user._id) && (
                            <button onClick={() => handleDeleteReview(r._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>✕ Delete</button>
                          )}
                        </div>
                      </div>
                      {r.review && <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>{r.review}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RECOMMENDATIONS */}
            {recommendations.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white', margin: 0 }}>🤖 You Might Also Like</h2>
                  <span style={{ background: recBasis === 'collaborative' ? 'rgba(99,102,241,0.15)' : 'rgba(255,0,79,0.1)', border: `1px solid ${recBasis === 'collaborative' ? 'rgba(99,102,241,0.4)' : 'rgba(255,0,79,0.3)'}`, color: recBasis === 'collaborative' ? '#818cf8' : '#ff004f', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                    {recBasis === 'collaborative' ? '👥 Based on bookings' : '🎭 Same genre'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                  {recommendations.map(rec => (
                    <div key={rec._id} onClick={() => navigate(`/movie/${rec._id}`)} style={{ background: '#111827', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(255,0,79,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                        {rec.poster ? (
                          <img src={rec.poster} alt={rec.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e293b,#0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🎬</div>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, #111827, transparent)' }} />
                      </div>
                      <div style={{ padding: '10px' }}>
                        <p style={{ color: 'white', fontWeight: '700', fontSize: '13px', margin: '0 0 4px', lineHeight: 1.3 }}>{rec.title}</p>
                        <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>{rec.genre}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: MOVIE DETAILS CARD */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', position: 'sticky', top: '80px' }}>
              <h3 style={{ color: '#ff004f', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Movie Details</h3>
              {[
                { label: 'Genre', value: movie.genre, icon: '🎭' },
                { label: 'Language', value: movie.language, icon: '🌐' },
                { label: 'Duration', value: movie.duration, icon: '⏱' },
                { label: 'Rating', value: `${movie.rating} / 5`, icon: '⭐' },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>{icon} {label}</span>
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{value}</span>
                </div>
              ))}
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ color: '#10b981', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{shows.length} Show{shows.length !== 1 ? 's' : ''} Available</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>{availableSeats} total seats remaining</div>
              </div>
              {movie.trailerUrl && (
                <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', marginTop: '12px', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#ef4444', fontWeight: '700', fontSize: '14px', textAlign: 'center', textDecoration: 'none' }}>
                  ▶ Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <span style={{ background: `${color}22`, border: `1px solid ${color}44`, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700', color }}>{text}</span>
  );
}

export default MovieDetails;