const Booking = require('../models/Booking');
const Show = require('../models/Show');
const redis = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

// LOCK SEATS
const lockSeats = async (req, res) => {
  try {
    const { showId, seats, userId } = req.body;

    const existingShow = await Show.findById(showId);
    if (!existingShow) return res.status(404).json({ message: 'Show not found' });

    for (const seat of seats) {
      if (existingShow.bookedSeats.includes(seat))
        return res.status(400).json({ message: `${seat} already booked` });
    }

    const LOCK_TTL = 120; // seconds
    const expiresAt = Date.now() + LOCK_TTL * 1000;
    const lockedKeys = [];

    try {
      for (const seat of seats) {
        const lockKey = `lock:${showId}:${seat}`;
        const result = await redis.set(
          lockKey,
          JSON.stringify({ userId, expiresAt }),
          'EX', LOCK_TTL,
          'NX'
        );
        if (!result) throw new Error(`${seat} already locked`);
        lockedKeys.push(lockKey);
      }
    } catch (error) {
      // Roll back any keys we already set
      for (const key of lockedKeys) await redis.del(key);
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Seats locked successfully', expiresAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UNLOCK SEAT
const unlockSeat = async (req, res) => {
  try {
    const { showId, seat } = req.body;
    await redis.del(`lock:${showId}:${seat}`);
    res.json({ message: 'Seat unlocked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CONFIRM BOOKING
const confirmBooking = async (req, res) => {
  try {
    const { user, movie, theatre, show, seats, totalAmount } = req.body;

    const existingShow = await Show.findById(show);
    if (!existingShow) return res.status(404).json({ message: 'Show not found' });

    for (const seat of seats) {
      if (existingShow.bookedSeats.includes(seat))
        return res.status(400).json({ message: `${seat} already booked` });
    }

    for (const seat of seats) {
      const lockData = await redis.get(`lock:${show}:${seat}`);
      if (!lockData) return res.status(400).json({ message: `Lock expired for ${seat}` });
    }

    const booking = await Booking.create({
      user, movie, theatre, show, seats, totalAmount,
      bookingId: uuidv4(),
      status: 'CONFIRMED'
    });

    existingShow.bookedSeats.push(...seats);
    await existingShow.save();

    for (const seat of seats) await redis.del(`lock:${show}:${seat}`);

    res.status(201).json({ message: 'Booking Confirmed', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL BOOKINGS (admin)
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('movie').populate('theatre').populate('show')
      .populate('user', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER BOOKINGS
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('movie').populate('theatre').populate('show')
      .sort({ bookedAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET LOCKED SEATS — filters out expired keys
const getLockedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const keys = await redis.keys(`lock:${showId}:*`);
    const lockedSeats = [];
    const seatOwners = {};
    const now = Date.now();

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        // Double-check not expired (Redis TTL should handle this, but be safe)
        if (parsed.expiresAt > now) {
          const seat = key.split(':')[2];
          lockedSeats.push(seat);
          seatOwners[seat] = parsed.userId;
        } else {
          // Clean up stale key
          await redis.del(key);
        }
      }
    }

    res.json({ lockedSeats, seatOwners });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CANCEL BOOKING + REFUND SIMULATION
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate('movie').populate('theatre').populate('show');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'CANCELLED') return res.status(400).json({ message: 'Booking already cancelled' });

    const show = await Show.findById(booking.show._id || booking.show);
    if (show) {
      show.bookedSeats = show.bookedSeats.filter(s => !booking.seats.includes(s));
      await show.save();
    }

    const refundAmount = Math.round(booking.totalAmount * 0.75);

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      refundAmount,
      seats: booking.seats,
      showId: booking.show._id || booking.show
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  lockSeats,
  unlockSeat,
  confirmBooking,
  getBookings,
  getUserBookings,
  getLockedSeats,
  cancelBooking
};
