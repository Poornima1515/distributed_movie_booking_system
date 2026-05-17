import React, { useState } from 'react';
import API from '../api';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
function AddMovie() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [movie, setMovie] = useState({ title:'', language:'', genre:'', duration:'', rating:'', poster:'', description:'' });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setMovie({ ...movie, [e.target.name]: e.target.value });
  const addMovie = async () => {
    if (!movie.title) { alert('Title required'); return; }
    setLoading(true);
    try { await API.post('/movies/add', movie); alert('Movie Added!'); navigate('/admin'); }
    catch(e) { alert(e.response?.data?.message || 'Failed'); } finally { setLoading(false); }
  };
  const inp = { width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid '+colors.border, background:colors.bg3, color:colors.text, fontSize:'14px', outline:'none', boxSizing:'border-box' };
  const lbl = { display:'block', color:colors.textMuted, fontSize:'13px', marginBottom:'6px' };
  return (
    <><Navbar />
    <div style={{ background:colors.bg, minHeight:'100vh', padding:'30px', color:colors.text, transition:'background 0.3s' }}>
      <button onClick={()=>navigate('/admin')} style={{ padding:'10px 18px', background:colors.bg3, border:'1px solid '+colors.border, borderRadius:'10px', color:colors.text, cursor:'pointer', fontSize:'14px', fontWeight:'bold' }}>← Back</button>
      <h1 style={{ marginTop:'20px', color:colors.text }}>Add Movie</h1>
      <p style={{ color:colors.textMuted, marginBottom:'30px' }}>Fill in the details to add a new movie</p>
      <div style={{ maxWidth:'520px' }}>
        {['title','language','genre','duration','rating','poster'].map(key => (
          <div key={key} style={{ marginBottom:'16px' }}>
            <label style={lbl}>{key.charAt(0).toUpperCase()+key.slice(1)}</label>
            <input name={key} value={movie[key]} placeholder={'Enter '+key} onChange={handleChange} style={inp} />
          </div>
        ))}
        <div style={{ marginBottom:'24px' }}>
          <label style={lbl}>Description</label>
          <textarea name='description' value={movie.description} placeholder='Enter description...' onChange={handleChange} rows={4} style={{...inp, resize:'vertical'}} />
        </div>
        {movie.poster && <div style={{ marginBottom:'20px' }}><img src={movie.poster} alt='preview' style={{ width:'120px', borderRadius:'10px', border:'2px solid '+colors.border }} onError={e=>e.target.style.display='none'} /></div>}
        <div style={{ display:'flex', gap:'12px' }}>
          <button onClick={addMovie} disabled={loading} style={{ flex:1, padding:'14px', background:loading?colors.bg3:'#ff004f', border:'none', borderRadius:'10px', color:'white', fontSize:'16px', fontWeight:'bold', cursor:loading?'not-allowed':'pointer' }}>{loading?'Adding...':'Add Movie'}</button>
          <button onClick={()=>navigate('/admin')} style={{ padding:'14px 20px', background:colors.bg3, border:'1px solid '+colors.border, borderRadius:'10px', color:colors.text, fontSize:'16px', cursor:'pointer' }}>Cancel</button>
        </div>
      </div>
    </div></>
  );
}
export default AddMovie;