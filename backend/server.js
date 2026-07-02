require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
require('./config/redis');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const theatreOwnerRoutes = require('./routes/theatreOwnerRoutes');
const mealRoutes = require('./routes/mealRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const promoRoutes = require('./routes/promoRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const auditRoutes = require('./routes/auditRoutes');
const userRoutes = require('./routes/userRoutes');
const seatSocket = require('./sockets/seatSocket');

const app = express();

const corsOptions = {
  origin: (origin, callback) => { callback(null, true); },
  credentials: true
};

// SOCKET SERVER
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });
app.set('io', io);
seatSocket(io);

// DATABASE
connectDB();

// MIDDLEWARES
app.use(cors(corsOptions));
app.use(express.json());

// ── RATE LIMITERS ────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 15,
  message: { message: 'Too many login attempts. Try again in 1 hour.' },
  standardHeaders: true, legacyHeaders: false
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  message: { message: 'Too many booking attempts. Try again in 1 hour.' },
  standardHeaders: true, legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: { message: 'Too many requests. Try again in 15 minutes.' },
  standardHeaders: true, legacyHeaders: false
});

app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/bookings/confirm', bookingLimiter);
app.use('/api/payment/verify', bookingLimiter);

// ── ROUTES ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/theatre-owner', theatreOwnerRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.send('Distributed Booking Server Running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
