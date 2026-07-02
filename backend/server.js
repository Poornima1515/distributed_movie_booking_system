require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

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
const seatSocket = require('./sockets/seatSocket');

const app = express();

// Allow multiple origins: local dev + deployed frontend
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow all origins for now — tighten after demo
    callback(null, true);
  },
  credentials: true
};

// SOCKET SERVER
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

// Make io accessible to controllers via app
app.set('io', io);

seatSocket(io);

// DATABASE
connectDB();

// MIDDLEWARES
app.use(cors(corsOptions));
app.use(express.json());

// ROUTES
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

// TEST ROUTE
app.get('/', (req, res) => {
  res.send('Distributed Booking Server Running');
});

// SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
