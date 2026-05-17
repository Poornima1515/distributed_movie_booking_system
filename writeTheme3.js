const fs = require('fs');
const base = 'D:/DS Project/distributed_movie_booking_system/frontend/src/pages/';
function w(file, lines) { fs.writeFileSync(base+file, lines.join('\n'), 'utf8'); console.log(file+' done ('+lines.length+' lines)'); }

// Patch Bookings - just change the outer div background
let bookings = fs.readFileSync(base+'Bookings.js','utf8');
bookings = bookings.replace(
  "import { io } from 'socket.io-client';",
  "import { io } from 'socket.io-client';\nimport { useTheme } from '../context/ThemeContext';"
);
bookings = bookings.replace(
  "  const user = JSON.parse(localStorage.getItem('user'));",
  "  const { colors } = useTheme();\n  const user = JSON.parse(localStorage.getItem('user'));"
);
bookings = bookings.replace(
  "style={{ minHeight: '100vh', background: '#0a0f1e', color: 'white', padding: '30px' }}",
  "style={{ minHeight: '100vh', background: colors.bg, color: colors.text, padding: '30px', transition: 'background 0.3s' }}"
);
bookings = bookings.replace(
  "style={{ margin: 0, fontSize: '28px', fontWeight: '900' }}",
  "style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: colors.text }}"
);
fs.writeFileSync(base+'Bookings.js', bookings, 'utf8');
console.log('Bookings.js patched');

// Patch Success
let success = fs.readFileSync(base+'Success.js','utf8');
success = success.replace(
  "import Navbar from '../components/Navbar';",
  "import Navbar from '../components/Navbar';\nimport { useTheme } from '../context/ThemeContext';"
);
success = success.replace(
  "function Success() {",
  "function Success() {\n  const { colors } = useTheme();"
);
success = success.replace(
  "style={{ background: '#0a0f1e', minHeight: '100vh', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px' }}",
  "style={{ background: colors.bg, minHeight: '100vh', color: colors.text, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px', transition: 'background 0.3s' }}"
);
success = success.replace(
  "style={{ background: '#111827', padding: '40px', borderRadius: '24px'",
  "style={{ background: colors.bg2, padding: '40px', borderRadius: '24px'"
);
success = success.replace(
  "style={{ background: '#0a0f1e', borderRadius: '16px', padding: '20px', textAlign: 'left', marginBottom: '28px', border: '1px solid rgba(255,255,255,0.06)' }}",
  "style={{ background: colors.bg3, borderRadius: '16px', padding: '20px', textAlign: 'left', marginBottom: '28px', border: '1px solid '+colors.border }}"
);
fs.writeFileSync(base+'Success.js', success, 'utf8');
console.log('Success.js patched');

// Patch Seats - just the outer wrapper
let seats = fs.readFileSync(base+'Seats.js','utf8');
seats = seats.replace(
  "import { io } from 'socket.io-client';",
  "import { io } from 'socket.io-client';\nimport { useTheme } from '../context/ThemeContext';"
);
seats = seats.replace(
  "  const user = JSON.parse(localStorage.getItem('user'));",
  "  const { colors } = useTheme();\n  const user = JSON.parse(localStorage.getItem('user'));"
);
seats = seats.replace(
  "style={{ background: '#0a0f1e', minHeight: '100vh' }}",
  "style={{ background: colors.bg, minHeight: '100vh', transition: 'background 0.3s' }}"
);
// Fix loading screen
seats = seats.replace(
  "style={{ background: '#0a0f1e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}",
  "style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}"
);
fs.writeFileSync(base+'Seats.js', seats, 'utf8');
console.log('Seats.js patched');

// Patch AdminDashboard
let admin = fs.readFileSync(base+'AdminDashboard.js','utf8');
admin = admin.replace(
  "import { io } from 'socket.io-client';",
  "import { io } from 'socket.io-client';\nimport { useTheme } from '../context/ThemeContext';"
);
admin = admin.replace(
  "  const feedRef = useRef(null);",
  "  const { colors } = useTheme();\n  const feedRef = useRef(null);"
);
admin = admin.replace(
  "style={{background:'#0a0f1e',minHeight:'100vh',color:'white',padding:'30px'}}",
  "style={{background:colors.bg,minHeight:'100vh',color:colors.text,padding:'30px',transition:'background 0.3s'}}"
);
admin = admin.replace(
  "style={{color:'#ff004f',fontSize:'32px',margin:0,fontWeight:'900'}}",
  "style={{color:'#ff004f',fontSize:'32px',margin:0,fontWeight:'900'}}"
);
fs.writeFileSync(base+'AdminDashboard.js', admin, 'utf8');
console.log('AdminDashboard.js patched');

// Patch MovieDetails
let md = fs.readFileSync(base+'MovieDetails.js','utf8');
md = md.replace(
  "import API from '../api';",
  "import API from '../api';\nimport { useTheme } from '../context/ThemeContext';"
);
md = md.replace(
  "  const [imgError, setImgError] = useState(false);",
  "  const { colors } = useTheme();\n  const [imgError, setImgError] = useState(false);"
);
md = md.replace(
  "style={{ background: '#0a0f1e', minHeight: '100vh' }}",
  "style={{ background: colors.bg, minHeight: '100vh', transition: 'background 0.3s' }}"
);
// loading screen
md = md.replace(
  "style={{ background: '#0a0f1e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}",
  "style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}"
);
fs.writeFileSync(base+'MovieDetails.js', md, 'utf8');
console.log('MovieDetails.js patched');

// Patch Revenue
let rev = fs.readFileSync(base+'Revenue.js','utf8');
rev = rev.replace(
  "import API from '../api';",
  "import API from '../api';\nimport { useTheme } from '../context/ThemeContext';"
);
rev = rev.replace(
  "function Revenue() {",
  "function Revenue() {\n  const { colors } = useTheme();"
);
rev = rev.replace(
  "style={{ background: '#0a0f1e', minHeight: '100vh', color: 'white', padding: '30px' }}",
  "style={{ background: colors.bg, minHeight: '100vh', color: colors.text, padding: '30px', transition: 'background 0.3s' }}"
);
fs.writeFileSync(base+'Revenue.js', rev, 'utf8');
console.log('Revenue.js patched');