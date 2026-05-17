import React,{useState} from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import {useNavigate} from 'react-router-dom';
import {useTheme} from '../context/ThemeContext';
function AddTheatre(){
  const navigate=useNavigate(); const {colors}=useTheme();
  const [theatre,setTheatre]=useState({name:'',city:'',screens:''}); const [loading,setLoading]=useState(false);
  const handleChange=(e)=>setTheatre({...theatre,[e.target.name]:e.target.value});
  const handleAdd=async()=>{
    if(!theatre.name||!theatre.city||!theatre.screens){alert('Fill all fields');return;}
    setLoading(true);
    try{await API.post('/admin/theatre',{...theatre,screens:Number(theatre.screens)});alert('Theatre added!');navigate('/admin');}
    catch(e){alert(e.response?.data?.message||'Failed');}finally{setLoading(false);}
  };
  const inp={width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid '+colors.border,background:colors.bg3,color:colors.text,fontSize:'14px',outline:'none',boxSizing:'border-box'};
  const lbl={display:'block',color:colors.textMuted,fontSize:'13px',marginBottom:'6px'};
  return(<><Navbar/>
  <div style={{background:colors.bg,minHeight:'100vh',padding:'30px',color:colors.text,transition:'background 0.3s'}}>
    <button onClick={()=>navigate('/admin')} style={{padding:'10px 18px',background:colors.bg3,border:'1px solid '+colors.border,borderRadius:'10px',color:colors.text,cursor:'pointer',fontSize:'14px',fontWeight:'bold'}}>Back</button>
    <h1 style={{marginTop:'20px',color:colors.text}}>Add Theatre</h1>
    <p style={{color:colors.textMuted,marginBottom:'30px'}}>Register a new theatre in the system</p>
    <div style={{maxWidth:'480px'}}>
      <div style={{marginBottom:'16px'}}><label style={lbl}>Theatre Name</label><input name='name' value={theatre.name} onChange={handleChange} placeholder='e.g. PVR Cinemas' style={inp}/></div>
      <div style={{marginBottom:'16px'}}><label style={lbl}>City</label><input name='city' value={theatre.city} onChange={handleChange} placeholder='e.g. Mumbai' style={inp}/></div>
      <div style={{marginBottom:'24px'}}><label style={lbl}>Number of Screens</label><input name='screens' type='number' min='1' value={theatre.screens} onChange={handleChange} placeholder='e.g. 5' style={inp}/></div>
      <div style={{display:'flex',gap:'12px'}}>
        <button onClick={handleAdd} disabled={loading} style={{flex:1,padding:'14px',background:loading?colors.bg3:'#ff004f',border:'none',borderRadius:'10px',color:'white',fontSize:'16px',fontWeight:'bold',cursor:loading?'not-allowed':'pointer'}}>{loading?'Adding...':'Add Theatre'}</button>
        <button onClick={()=>navigate('/admin')} style={{padding:'14px 20px',background:colors.bg3,border:'1px solid '+colors.border,borderRadius:'10px',color:colors.text,fontSize:'16px',cursor:'pointer'}}>Cancel</button>
      </div>
    </div>
  </div></>);
}
export default AddTheatre;