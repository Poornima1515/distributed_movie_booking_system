import React, { useEffect, useState, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';

const SOCKET_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true
});
const TABS = ['Overview','Analytics','Live Feed','Movies','Shows','Theatres','Bookings'];

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [liveActivity, setLiveActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const feedRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [moviesRes, showsRes, theatresRes, bookingsRes] = await Promise.all([
        API.get('/movies'), API.get('/admin/shows'), API.get('/admin/theatres'), API.get('/bookings')
      ]);
      setMovies(moviesRes.data); setShows(showsRes.data);
      setTheatres(theatresRes.data); setBookings(bookingsRes.data);
    } catch(e){console.log(e);} finally{setLoading(false);}
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try { const res = await API.get('/analytics'); setAnalytics(res.data); } catch(e){console.log(e);}
  }, []);

  useEffect(() => {
    fetchData(); fetchAnalytics();
    socket.emit('joinAdmin');
    socket.on('newBookingActivity', (data) => {
      setLiveActivity(prev => [data,...prev].slice(0,50));
      // Auto-refresh bookings data when new activity comes in
      fetchData();
    });
    return () => { socket.emit('leaveAdmin'); socket.off('newBookingActivity'); };
  }, [fetchData, fetchAnalytics]);

  const deleteMovie = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    try { await API.delete('/movies/'+id); setMovies(p=>p.filter(m=>m._id!==id)); } catch(e){alert('Failed');}
  };
  const deleteShow = async (id) => {
    if (!window.confirm('Delete this show?')) return;
    try { await API.delete('/admin/show/'+id); setShows(p=>p.filter(s=>s._id!==id)); } catch(e){alert('Failed');}
  };
  const deleteTheatre = async (id) => {
    if (!window.confirm('Delete this theatre?')) return;
    try { await API.delete('/admin/theatre/'+id); setTheatres(p=>p.filter(t=>t._id!==id)); } catch(e){alert('Failed');}
  };

  const totalRevenue = bookings.filter(b=>b.status!=='CANCELLED').reduce((s,b)=>s+(b.totalAmount||0),0);
  const confirmedBookings = bookings.filter(b=>b.status!=='CANCELLED');
  const cancelledBookings = bookings.filter(b=>b.status==='CANCELLED');

  return (
    <>
      <Navbar />
      <div style={{background:colors.bg,minHeight:'100vh',color:colors.text,padding:'30px',transition:'background 0.3s'}}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'30px'}}>
          <div>
            <h1 style={{color:'#ff004f',fontSize:'32px',margin:0,fontWeight:'900'}}>Admin Dashboard</h1>
            <p style={{color:'#64748b',margin:'5px 0 0',fontSize:'14px'}}>CineVerse Management Panel</p>
          </div>
          <button onClick={()=>{fetchData();fetchAnalytics();}} style={refreshBtnStyle} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div style={{display:'flex',gap:'8px',marginBottom:'30px',flexWrap:'wrap'}}>
          {TABS.map(tab => (
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:'9px 18px',borderRadius:'10px',border:activeTab===tab?'none':'1px solid rgba(255,255,255,0.06)',cursor:'pointer',fontWeight:'700',fontSize:'13px',background:activeTab===tab?'#ff004f':'#111827',color:activeTab===tab?'white':'#94a3b8',position:'relative'}}>
              {tab}
              {tab==='Live Feed' && liveActivity.length>0 && <span style={{position:'absolute',top:'-6px',right:'-6px',background:'#10b981',borderRadius:'50%',width:'16px',height:'16px',fontSize:'9px',display:'flex',alignItems:'center',justifyContent:'center',color:'white'}}>{liveActivity.length>9?'9+':liveActivity.length}</span>}
            </button>
          ))}
        </div>
        {activeTab==='Overview' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'20px',marginBottom:'40px'}}>
              <StatCard label='Total Movies' value={movies.length} icon='🎬' color='#6366f1' />
              <StatCard label='Total Shows' value={shows.length} icon='🎭' color='#0ea5e9' />
              <StatCard label='Total Theatres' value={theatres.length} icon='🏛️' color='#10b981' />
              <StatCard label='Confirmed Bookings' value={confirmedBookings.length} icon='🎟️' color='#f59e0b' />
              <StatCard label='Cancelled' value={cancelledBookings.length} icon='✕' color='#ef4444' />
              <StatCard label='Total Revenue' value={'₹'+totalRevenue.toLocaleString()} icon='💰' color='#ff004f' />
            </div>
            <h2 style={{marginBottom:'15px',fontWeight:'800'}}>Quick Actions</h2>
            <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
              <ActionBtn label='Add Movie' onClick={()=>navigate('/admin/add-movie')} />
              <ActionBtn label='Add Show' onClick={()=>navigate('/admin/add-show')} />
              <ActionBtn label='Add Theatre' onClick={()=>navigate('/admin/add-theatre')} />
              <ActionBtn label='Analytics' onClick={()=>setActiveTab('Analytics')} secondary />
              <ActionBtn label='Live Feed' onClick={()=>setActiveTab('Live Feed')} secondary />
            </div>
          </div>
        )}

        {activeTab==='Analytics' && (
          <div>
            {!analytics ? <div style={{textAlign:'center',padding:'60px',color:'#94a3b8'}}><p>Loading analytics...</p></div> : (
              <div style={{display:'flex',flexDirection:'column',gap:'30px'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'16px'}}>
                  <StatCard label='Total Revenue' value={'₹'+(analytics.summary?.totalRevenue||0).toLocaleString()} icon='💰' color='#10b981' />
                  <StatCard label='Tickets Sold' value={analytics.summary?.totalTickets||0} icon='🎟️' color='#6366f1' />
                  <StatCard label='Bookings' value={analytics.summary?.totalBookings||0} icon='📋' color='#0ea5e9' />
                  <StatCard label='Cancelled' value={analytics.summary?.cancelledBookings||0} icon='✕' color='#ef4444' />
                </div>
                <ChartCard title='Bookings Per Movie' subtitle='Tickets sold per movie'>
                  {(analytics.bookingsPerMovie||[]).length===0 ? <p style={{color:'#334155',textAlign:'center',padding:'20px'}}>No data yet</p> : (analytics.bookingsPerMovie||[]).map((item,i)=>{
                    const max=(analytics.bookingsPerMovie[0]?.count)||1;
                    const pct=Math.round((item.count/max)*100);
                    const colors=['#ff004f','#6366f1','#0ea5e9','#10b981','#f59e0b','#ec4899','#8b5cf6','#14b8a6'];
                    return (<div key={i} style={{marginBottom:'14px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                        <span style={{color:'white',fontSize:'13px',fontWeight:'600'}}>{item.movie}</span>
                        <span style={{color:'#94a3b8',fontSize:'13px'}}>{item.count} tickets</span>
                      </div>
                      <div style={{height:'10px',background:'#1e293b',borderRadius:'5px',overflow:'hidden'}}>
                        <div style={{height:'100%',width:pct+'%',background:colors[i%colors.length],borderRadius:'5px'}} />
                      </div>
                    </div>);
                  })}
                </ChartCard>
                <ChartCard title='Revenue Per Theatre' subtitle='Total revenue per theatre'>
                  {(analytics.revenuePerTheatre||[]).length===0 ? <p style={{color:'#334155',textAlign:'center',padding:'20px'}}>No data yet</p> : (analytics.revenuePerTheatre||[]).map((item,i)=>{
                    const max=(analytics.revenuePerTheatre[0]?.revenue)||1;
                    const pct=Math.round((item.revenue/max)*100);
                    const colors=['#10b981','#0ea5e9','#6366f1','#f59e0b','#ff004f'];
                    return (<div key={i} style={{marginBottom:'14px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                        <span style={{color:'white',fontSize:'13px',fontWeight:'600'}}>{item.theatre}</span>
                        <span style={{color:'#10b981',fontSize:'13px',fontWeight:'700'}}>{'₹'+item.revenue?.toLocaleString()}</span>
                      </div>
                      <div style={{height:'10px',background:'#1e293b',borderRadius:'5px',overflow:'hidden'}}>
                        <div style={{height:'100%',width:pct+'%',background:colors[i%colors.length],borderRadius:'5px'}} />
                      </div>
                    </div>);
                  })}
                </ChartCard>
                <ChartCard title='Occupancy Rate' subtitle='Seat fill % per show'>
                  {(analytics.occupancy||[]).length===0 ? <p style={{color:'#334155',textAlign:'center',padding:'20px'}}>No data yet</p> : (analytics.occupancy||[]).map((item,i)=>{
                    const color=item.rate>80?'#ef4444':item.rate>50?'#f59e0b':'#10b981';
                    return (<div key={i} style={{marginBottom:'14px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                        <span style={{color:'white',fontSize:'12px',fontWeight:'600',flex:1,marginRight:'12px'}}>{item.label}</span>
                        <span style={{color:color,fontSize:'13px',fontWeight:'700'}}>{item.rate}%</span>
                      </div>
                      <div style={{height:'10px',background:'#1e293b',borderRadius:'5px',overflow:'hidden'}}>
                        <div style={{height:'100%',width:item.rate+'%',background:color,borderRadius:'5px'}} />
                      </div>
                    </div>);
                  })}
                </ChartCard>
                <ChartCard title='Peak Booking Hours' subtitle='Bookings by hour of day'>
                  <div style={{display:'flex',alignItems:'flex-end',gap:'4px',height:'120px'}}>
                    {(analytics.peakHours||[]).map((item,i)=>{
                      const max=Math.max(...(analytics.peakHours||[]).map(h=>h.count),1);
                      const h=Math.max((item.count/max)*100,4);
                      return (<div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}} title={item.hour+': '+item.count+' bookings'}>
                        <div style={{width:'100%',height:h+'%',background:item.count>0?'#ff004f':'#1e293b',borderRadius:'3px 3px 0 0',minHeight:'4px'}} />
                        {i%4===0 && <span style={{color:'#334155',fontSize:'9px'}}>{i}</span>}
                      </div>);
                    })}
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px'}}>
                    <span style={{color:'#64748b',fontSize:'11px'}}>12 AM</span>
                    <span style={{color:'#64748b',fontSize:'11px'}}>12 PM</span>
                    <span style={{color:'#64748b',fontSize:'11px'}}>11 PM</span>
                  </div>
                </ChartCard>
              </div>
            )}
          </div>
        )}
        {activeTab==='Live Feed' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <div>
                <h2 style={{margin:0,fontWeight:'800'}}>Live Booking Activity</h2>
                <p style={{color:'#64748b',margin:'4px 0 0',fontSize:'13px'}}>Real-time feed via Socket.IO</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px #10b981'}} />
                <span style={{color:'#10b981',fontSize:'13px',fontWeight:'700'}}>LIVE</span>
                {liveActivity.length>0 && <button onClick={()=>setLiveActivity([])} style={{padding:'6px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',color:'#ef4444',cursor:'pointer',fontSize:'12px',fontWeight:'600'}}>Clear</button>}
              </div>
            </div>
            {liveActivity.length===0 ? (
              <div style={{background:'#111827',borderRadius:'20px',padding:'60px',textAlign:'center',border:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontSize:'56px',marginBottom:'16px'}}>📡</div>
                <h3 style={{color:'#94a3b8',fontWeight:'700'}}>Waiting for activity...</h3>
                <p style={{color:'#64748b',fontSize:'14px'}}>Bookings and cancellations will appear here in real-time</p>
              </div>
            ) : (
              <div ref={feedRef} style={{display:'flex',flexDirection:'column',gap:'10px',maxHeight:'600px',overflowY:'auto'}}>
                {liveActivity.map((item,i) => (
                  <div key={i} style={{background:'#111827',borderRadius:'14px',padding:'16px 20px',border:'1px solid '+(item.type==='CANCELLATION'?'rgba(239,68,68,0.2)':'rgba(16,185,129,0.2)'),display:'flex',alignItems:'center',gap:'16px'}}>
                    <div style={{width:'44px',height:'44px',borderRadius:'12px',background:item.type==='CANCELLATION'?'rgba(239,68,68,0.15)':'rgba(16,185,129,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0}}>
                      {item.type==='CANCELLATION'?'✕':'🎟️'}
                    </div>
                    <div style={{flex:1}}>
                      <p style={{margin:0,color:'white',fontSize:'14px',fontWeight:'700'}}>
                        <span style={{color:item.type==='CANCELLATION'?'#ef4444':'#10b981'}}>{item.userName}</span>
                        {item.type==='CANCELLATION'?' cancelled ':' booked '}
                        <span style={{color:'#fbbf24'}}>{(item.seats||[]).join(', ')}</span>
                        {' for '}
                        <span style={{color:'#818cf8'}}>{item.movieTitle}</span>
                        {item.theatreName && <span style={{color:'#64748b'}}> @ {item.theatreName}</span>}
                      </p>
                    </div>
                    <span style={{color:'#334155',fontSize:'11px',whiteSpace:'nowrap',flexShrink:0}}>
                      {new Date(item.timestamp).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab==='Movies' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h2 style={{margin:0}}>Movies ({movies.length})</h2>
              <button onClick={()=>navigate('/admin/add-movie')} style={addBtnStyle}>Add Movie</button>
            </div>
            {movies.length===0 ? <EmptyState message='No movies added yet.' /> : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'20px'}}>
                {movies.map(movie => (
                  <div key={movie._id} style={cardStyle}>
                    <img src={movie.poster||'https://via.placeholder.com/300x200?text=No+Poster'} alt={movie.title} style={{width:'100%',height:'180px',objectFit:'cover',borderRadius:'10px',marginBottom:'12px'}} />
                    <h3 style={{margin:'0 0 6px',color:'white'}}>{movie.title}</h3>
                    <p style={{color:'#94a3b8',margin:'3px 0',fontSize:'13px'}}>{movie.genre} | {movie.language}</p>
                    <p style={{color:'#94a3b8',margin:'3px 0',fontSize:'13px'}}>Rating: {movie.rating} | {movie.duration}</p>
                    <div style={{display:'flex',gap:'10px',marginTop:'14px'}}>
                      <button onClick={()=>navigate('/admin/edit-movie/'+movie._id)} style={editBtnStyle}>Edit</button>
                      <button onClick={()=>deleteMovie(movie._id)} style={deleteBtnStyle}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab==='Shows' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h2 style={{margin:0}}>Shows ({shows.length})</h2>
              <button onClick={()=>navigate('/admin/add-show')} style={addBtnStyle}>Add Show</button>
            </div>
            {shows.length===0 ? <EmptyState message='No shows added yet.' /> : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'20px'}}>
                {shows.map(show => {
                  const booked=show.bookedSeats?.length||0; const total=show.seats?.length||50;
                  const pct=Math.round((booked/total)*100);
                  return (<div key={show._id} style={cardStyle}>
                    <h3 style={{margin:'0 0 8px',color:'#ff004f'}}>{show.movie?.title||'Unknown'}</h3>
                    <p style={{color:'#94a3b8',margin:'4px 0',fontSize:'13px'}}>{show.theatre?.name}</p>
                    <p style={{color:'#94a3b8',margin:'4px 0',fontSize:'13px'}}>{show.showTime}</p>
                    <p style={{color:'#94a3b8',margin:'4px 0',fontSize:'13px'}}>Price: Rs.{show.price}</p>
                    <div style={{margin:'10px 0 4px',display:'flex',justifyContent:'space-between'}}>
                      <span style={{color:'#64748b',fontSize:'12px'}}>Occupancy</span>
                      <span style={{color:pct>80?'#ef4444':'#10b981',fontSize:'12px',fontWeight:'700'}}>{booked}/{total} ({pct}%)</span>
                    </div>
                    <div style={{height:'6px',background:'#0a0f1e',borderRadius:'3px',overflow:'hidden'}}>
                      <div style={{height:'100%',width:pct+'%',background:pct>80?'#ef4444':pct>50?'#f59e0b':'#10b981',borderRadius:'3px'}} />
                    </div>
                    <button onClick={()=>deleteShow(show._id)} style={{...deleteBtnStyle,width:'100%',marginTop:'14px'}}>Delete Show</button>
                  </div>);
                })}
              </div>
            )}
          </div>
        )}

        {activeTab==='Theatres' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h2 style={{margin:0}}>Theatres ({theatres.length})</h2>
              <button onClick={()=>navigate('/admin/add-theatre')} style={addBtnStyle}>Add Theatre</button>
            </div>
            {theatres.length===0 ? <EmptyState message='No theatres added yet.' /> : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'20px'}}>
                {theatres.map(theatre => (
                  <div key={theatre._id} style={cardStyle}>
                    <h3 style={{margin:'0 0 8px',color:'white'}}>{theatre.name}</h3>
                    <p style={{color:'#94a3b8',margin:'4px 0',fontSize:'13px'}}>{theatre.city}</p>
                    <p style={{color:'#94a3b8',margin:'4px 0',fontSize:'13px'}}>{theatre.screens} Screen(s)</p>
                    <button onClick={()=>deleteTheatre(theatre._id)} style={{...deleteBtnStyle,width:'100%',marginTop:'14px'}}>Delete Theatre</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab==='Bookings' && (
          <div>
            <h2 style={{marginBottom:'20px'}}>All Bookings ({bookings.length})</h2>
            {bookings.length===0 ? <EmptyState message='No bookings yet.' /> : (
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'14px'}}>
                  <thead>
                    <tr style={{background:'#111827',color:'#94a3b8'}}>
                      {['Booking ID','User','Movie','Theatre','Seats','Amount','Status'].map(h=>(
                        <th key={h} style={{padding:'12px 16px',textAlign:'left',fontWeight:'600',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b=>(
                      <tr key={b._id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                        <td style={tdStyle}><span style={{fontFamily:'monospace',fontSize:'12px',color:'#64748b'}}>{(b.bookingId||'').slice(0,8)}...</span></td>
                        <td style={tdStyle}>{b.user?.name||'—'}</td>
                        <td style={tdStyle}>{b.movie?.title||'—'}</td>
                        <td style={tdStyle}>{b.theatre?.name||'—'}</td>
                        <td style={tdStyle}>{(b.seats||[]).join(', ')}</td>
                        <td style={tdStyle}><span style={{color:'#10b981',fontWeight:'700'}}>Rs.{b.totalAmount}</span></td>
                        <td style={tdStyle}><span style={{background:b.status==='CANCELLED'?'rgba(239,68,68,0.15)':'rgba(16,185,129,0.15)',border:'1px solid '+(b.status==='CANCELLED'?'rgba(239,68,68,0.4)':'rgba(16,185,129,0.4)'),color:b.status==='CANCELLED'?'#ef4444':'#10b981',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{b.status||'CONFIRMED'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}

function StatCard({label,value,icon,color}) {
  return (<div style={{background:'#111827',padding:'24px',borderRadius:'16px',borderLeft:'4px solid '+color,border:'1px solid rgba(255,255,255,0.06)',borderLeftWidth:'4px',borderLeftColor:color}}>
    <span style={{fontSize:'28px'}}>{icon}</span>
    <p style={{color:'#64748b',fontSize:'12px',margin:'8px 0 4px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'1px'}}>{label}</p>
    <p style={{fontSize:'26px',fontWeight:'900',color:'white',margin:0}}>{value}</p>
  </div>);
}

function ChartCard({title,subtitle,children}) {
  return (<div style={{background:'#111827',borderRadius:'20px',padding:'28px',border:'1px solid rgba(255,255,255,0.06)'}}>
    <h3 style={{margin:'0 0 4px',fontSize:'18px',fontWeight:'800',color:'white'}}>{title}</h3>
    <p style={{color:'#64748b',fontSize:'13px',margin:'0 0 24px'}}>{subtitle}</p>
    {children}
  </div>);
}

function ActionBtn({label,onClick,secondary}) {
  return (<button onClick={onClick} style={{padding:'12px 20px',background:secondary?'#111827':'#ff004f',border:secondary?'1px solid rgba(255,255,255,0.08)':'none',borderRadius:'10px',color:secondary?'#94a3b8':'white',fontSize:'14px',cursor:'pointer',fontWeight:'700'}}>{label}</button>);
}

function EmptyState({message}) {
  return (<div style={{background:'#111827',padding:'40px',borderRadius:'16px',textAlign:'center',color:'#64748b',border:'1px solid rgba(255,255,255,0.06)'}}><p style={{fontSize:'18px'}}>{message}</p></div>);
}

const cardStyle={background:'#111827',padding:'20px',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.06)'};
const addBtnStyle={padding:'10px 20px',background:'#ff004f',border:'none',borderRadius:'10px',color:'white',cursor:'pointer',fontWeight:'700',fontSize:'14px'};
const editBtnStyle={flex:1,padding:'8px',background:'rgba(14,165,233,0.15)',border:'1px solid rgba(14,165,233,0.3)',borderRadius:'8px',color:'#0ea5e9',cursor:'pointer',fontWeight:'700',fontSize:'13px'};
const deleteBtnStyle={flex:1,padding:'8px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',color:'#ef4444',cursor:'pointer',fontWeight:'700',fontSize:'13px'};
const refreshBtnStyle={padding:'10px 20px',background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'white',cursor:'pointer',fontWeight:'700',fontSize:'14px'};
const tdStyle={padding:'12px 16px',color:'white'};

export default AdminDashboard;