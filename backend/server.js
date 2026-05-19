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
const seatSocket = require('./sockets/seatSocket');

const app = express();

// Allow multiple origins: local dev + deployed frontend
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin) return callback(null, true);
    // Allow exact match or any Vercel preview URL for this project
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^https:\/\/distributed-movie-booking-system.*\.vercel\.app$/.test(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// SOCKET SERVER
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

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

// TEST ROUTE
app.get('/', (req, res) => {
  res.send('Distributed Booking Server Running');
});

// SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
