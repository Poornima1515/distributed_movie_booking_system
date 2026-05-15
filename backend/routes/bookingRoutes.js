const express = require('express');
const router = express.Router();
const {
  lockSeats,
  unlockSeat,
  confirmBooking,
  getBookings,
  getUserBookings,
  getLockedSeats
} = require('../controllers/bookingController');

router.post('/lock', lockSeats);
router.post('/unlock', unlockSeat);
router.post('/confirm', confirmBooking);
router.get('/', getBookings);
router.get('/user/:userId', getUserBookings);
router.get('/locks/:showId', getLockedSeats);

module.exports = router;
