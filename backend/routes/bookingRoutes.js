const express = require('express');
const router = express.Router();
const { lockSeats, unlockSeat, confirmBooking, getBookings, getUserBookings, getLockedSeats, cancelBooking } = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All booking routes require login
router.post('/lock', protect, lockSeats);
router.post('/unlock', protect, unlockSeat);
router.post('/confirm', protect, confirmBooking);
router.get('/locks/:showId', protect, getLockedSeats);
router.get('/user/:userId', protect, getUserBookings);
router.patch('/cancel/:bookingId', protect, cancelBooking);

// Admin only
router.get('/', protect, adminOnly, getBookings);

module.exports = router;
