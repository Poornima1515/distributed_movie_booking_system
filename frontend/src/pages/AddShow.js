import React,{useEffect,useState} from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import {useNavigate} from 'react-router-dom';
import {useTheme} from '../context/ThemeContext';
function AddShow(){
  const navigate=useNavigate(); const {colors}=useTheme();
  const [movies,setMovies]=useState([]); const [theatres,setTheatres]=useState([]);
  const [show,setShow]=useState({movie:'',theatre:'',showTime:'',price:''}); const [loading,setLoading]=useState(false);
  useEffect(()=>{API.get('/movies').then(r=>setMovies(r.data));API.get('/admin/theatres').then(r=>setTheatres(r.data));},[]);
  const handleChange=(e)=>setShow({...show,[e.target.name]:e.target.value});
  const addShow=async()=>{
    if(!show.movie||!show.theatre||!show.showTime||!show.price){alert('Fill all fields');return;}
    setLoading(true);
    try{await API.post('/admin/show',show);alert('Show Added! 50 seats auto-generated.');navigate('/admin');}
    catch(e){alert(e.response?.data?.message||'Failed');}finally{setLoading(false);}
  };
  const inp={width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid '+colors.border,background:colors.bg3,color:colors.text,fontSize:'14px',outline:'none',boxSizing:'border-box'};
  const lbl={display:'block',color:colors.textMuted,fontSize:'13px',marginBottom:'6px'};
  return(<><Navbar/>
  <div style={{background:colors.bg,minHeight:'100vh',padding:'30px',color:colors.text,transition:'background 0.3s'}}>
    <button onClick={()=>navigate('/admin')} style={{padding:'10px 18px',background:colors.bg3,border:'1px solid '+colors.border,borderRadius:'10px',color:colors.text,cursor:'pointer',fontSize:'14px',fontWeight:'bold'}}>Back</button>
    <h1 style={{marginTop:'20px',color:colors.text}}>Add Show</h1>
    <p style={{color:colors.textMuted,marginBottom:'30px'}}>Seats A1-E10 (50 seats) will be auto-generated</p>
    <div style={{maxWidth:'480px'}}>
      <div style={{marginBottom:'16px'}}><label style={lbl}>Movie</label>
        <select name='movie' onChange={handleChange} value={show.movie} style={inp}>
          <option value=''>Select Movie</option>
          {movies.map(m=><option key={m._id} value={m._id}>{m.title}</option>)}
        </select></div>
      <div style={{marginBottom:'16px'}}><label style={lbl}>Theatre</label>
        <select name='theatre' onChange={handleChange} value={show.theatre} style={inp}>
          <option value=''>Select Theatre</option>
          {theatres.map(t=><option key={t._id} value={t._id}>{t.name} - {t.city}</option>)}
        </select></div>
      <div style={{marginBottom:'16px'}}><label style={lbl}>Show Time</label>
        <input name='showTime' type='datetime-local' value={show.showTime} onChange={handleChange} style={inp}/></div>
      <div style={{marginBottom:'24px'}}><label style={lbl}>Ticket Price (Rs.)</label>
        <input name='price' type='number' min='1' placeholder='e.g. 250' value={show.price} onChange={handleChange} style={inp}/></div>
      <div style={{display:'flex',gap:'12px'}}>
        <button onClick={addShow} disabled={loading} style={{flex:1,padding:'14px',background:loading?colors.bg3:'#ff004f',border:'none',borderRadius:'10px',color:'white',fontSize:'16px',fontWeight:'bold',cursor:loading?'not-allowed':'pointer'}}>{loading?'Adding...':'Add Show'}</button>
        <button onClick={()=>navigate('/admin')} style={{padding:'14px 20px',background:colors.bg3,border:'1px solid '+colors.border,borderRadius:'10px',color:colors.text,fontSize:'16px',cursor:'pointer'}}>Cancel</button>
      </div>
    </div>
  </div></>);
}
export default AddShow;