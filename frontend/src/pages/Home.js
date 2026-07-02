
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useTheme } from '../context/ThemeContext';

const HERO_BG = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80";

function Home() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [allGenres, setAllGenres] = useState([]);
  const [allLanguages, setAllLanguages] = useState([]);

  useEffect(() => { fetchMovies(); }, [search, genre, language, sortBy]);

  const fetchMovies = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genre) params.append('genre', genre);
      if (language) params.append('language', language);
      if (sortBy) params.append('sort', sortBy);
      const res = await API.get(`/movies?${params.toString()}`);
      setMovies(res.data);
      // Extract unique genres and languages for filter dropdowns
      const genres = [...new Set(res.data.map(m => m.genre).filter(Boolean))];
      const langs = [...new Set(res.data.map(m => m.language).filter(Boolean))];
      if (!genre) setAllGenres(genres);
      if (!language) setAllLanguages(langs);
    } catch(e){ console.log(e); }
  };

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', transition: 'background 0.3s' }}>
      <Navbar />
      <div style={{ position:'relative', height:'480px', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <img src={HERO_BG} alt="cinema" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.3)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(10,15,30,0.2) 0%, rgba(10,15,30,0.6) 60%, '+colors.bg+' 100%)' }} />
        <div style={{ position:'relative', textAlign:'center', padding:'0 20px' }}>
          <div style={{ fontSize:'14px', letterSpacing:'4px', color:'#ff004f', fontWeight:'700', marginBottom:'16px', textTransform:'uppercase' }}>🎬 Now Showing</div>
          <h1 style={{ fontSize:'clamp(36px,6vw,72px)', fontWeight:'900', lineHeight:1.1, background:'linear-gradient(135deg,#ffffff 0%,#ff6b9d 50%,#ff004f 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'16px' }}>
            Experience Cinema<br />Like Never Before
          </h1>
          <p style={{ color:'#94a3b8', fontSize:'18px', marginBottom:'32px' }}>Book tickets for the latest blockbusters</p>
          <div style={{ display:'flex', alignItems:'center', background:'rgba(255,255,255,0.08)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'50px', padding:'6px 6px 6px 20px', maxWidth:'480px', margin:'0 auto' }}>
            <span style={{ fontSize:'18px', marginRight:'10px' }}>🔍</span>
            <input placeholder="Search movies..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:'16px' }} />
            <button style={{ background:'linear-gradient(135deg,#ff004f,#cc0040)', border:'none', borderRadius:'40px', padding:'10px 24px', color:'white', fontWeight:'700', cursor:'pointer', fontSize:'14px' }}>Search</button>
          </div>        </div>
      </div>

      <div style={{ padding:'40px 30px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h2 style={{ fontSize:'28px', fontWeight:'800', color:colors.text, margin:0 }}>{search ? `Results for "${search}"` : '🔥 Trending Now'}</h2>
            <p style={{ color:colors.textDim, marginTop:'4px', fontSize:'14px' }}>{movies.length} movie{movies.length!==1?'s':''} available</p>
          </div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
            <select value={genre} onChange={e=>setGenre(e.target.value)} style={filterStyle}>
              <option value="">All Genres</option>
              {allGenres.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
            <select value={language} onChange={e=>setLanguage(e.target.value)} style={filterStyle}>
              <option value="">All Languages</option>
              {allLanguages.map(l=><option key={l} value={l}>{l}</option>)}
            </select>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={filterStyle}>
              <option value="">Sort: Default</option>
              <option value="rating">Sort: Rating</option>
              <option value="title">Sort: A-Z</option>
              <option value="newest">Sort: Newest</option>
            </select>
            {(genre || language || sortBy) && (
              <button onClick={()=>{setGenre('');setLanguage('');setSortBy('');}} style={{ padding:'8px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', color:'#ef4444', cursor:'pointer', fontSize:'13px', fontWeight:'600' }}>✕ Clear</button>
            )}
          </div>
        </div>
        {movies.length===0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px', color:colors.textDim }}>
            <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎭</div>
            <h3 style={{ fontSize:'22px', color:colors.textMuted }}>No movies found</h3>
            <p>Try a different search or filter</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'24px' }}>
            {movies.map(movie => (
              <MovieCard key={movie._id} movie={movie} colors={colors} hovered={hoveredId===movie._id} onHover={setHoveredId} onClick={()=>navigate('/movie/'+movie._id)} />
            ))}
          </div>
        )}
      </div>
      <div style={{ borderTop:'1px solid '+colors.border, padding:'24px 30px', textAlign:'center', color:colors.textDim, fontSize:'13px' }}>
        © 2025 CineVerse — Distributed Movie Booking System
      </div>
    </div>
  );
}

function MovieCard({ movie, colors, hovered, onHover, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div onMouseEnter={()=>onHover(movie._id)} onMouseLeave={()=>onHover(null)}
      style={{ borderRadius:'16px', overflow:'hidden', cursor:'pointer', background:colors.bg2, border:'1px solid '+colors.border, transform:hovered?'translateY(-10px) scale(1.02)':'translateY(0) scale(1)', boxShadow:hovered?'0 24px 60px rgba(255,0,79,0.3)':'0 4px 20px rgba(0,0,0,0.2)', transition:'all 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
      <div style={{ position:'relative', height:'320px', overflow:'hidden' }}>
        {!imgError ? (
          <img src={movie.poster} alt={movie.title} onError={()=>setImgError(true)} style={{ width:'100%', height:'100%', objectFit:'cover', transform:hovered?'scale(1.08)':'scale(1)', transition:'transform 0.5s ease' }} />
        ) : (
          <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1e293b,#0f172a)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
            <span style={{ fontSize:'48px' }}>🎬</span>
            <span style={{ color:'#64748b', fontSize:'13px' }}>{movie.title}</span>
          </div>
        )}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'120px', background:'linear-gradient(to top, '+colors.bg2+' 0%, transparent 100%)' }} />
        <div style={{ position:'absolute', top:'12px', right:'12px', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,200,0,0.3)', borderRadius:'20px', padding:'4px 10px', fontSize:'12px', fontWeight:'700', color:'#fbbf24' }}>⭐ {movie.rating}</div>
        <div style={{ position:'absolute', top:'12px', left:'12px', background:'rgba(255,0,79,0.8)', borderRadius:'20px', padding:'4px 10px', fontSize:'11px', fontWeight:'700', color:'white' }}>{movie.genre}</div>
      </div>
      <div style={{ padding:'16px' }}>
        <h3 style={{ fontSize:'16px', fontWeight:'700', color:colors.text, margin:'0 0 6px', lineHeight:1.3 }}>{movie.title}</h3>
        <div style={{ display:'flex', gap:'12px', marginBottom:'14px' }}>
          <span style={{ fontSize:'12px', color:colors.textDim }}>🌐 {movie.language}</span>
          <span style={{ fontSize:'12px', color:colors.textDim }}>⏱ {movie.duration}</span>
        </div>
        <button onClick={onClick} style={{ width:'100%', padding:'10px', background:hovered?'linear-gradient(135deg,#ff004f,#cc0040)':'rgba(255,0,79,0.1)', border:'1px solid rgba(255,0,79,0.3)', borderRadius:'10px', color:hovered?'white':'#ff004f', cursor:'pointer', fontSize:'14px', fontWeight:'700', transition:'all 0.3s ease' }}>
          🎟️ Book Tickets
        </button>
      </div>
    </div>
  );
}

const filterStyle = { padding:'8px 12px', background:'#111827', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', color:'white', fontSize:'13px', cursor:'pointer', outline:'none' };

export default Home;

