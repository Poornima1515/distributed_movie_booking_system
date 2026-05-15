const Booking = require('../models/Booking');

const Show = require('../models/Show');

const redis = require('../config/redis');

const { v4: uuidv4 } = require('uuid');

const lockSeats = async (req, res) => {

  try {

    const {

      showId,

      seats,

      userId

    } = req.body;

    const existingShow =
      await Show.findById(showId);

    if (!existingShow) {

      return res.status(404).json({

        message:
          'Show not found'

      });

    }

    // CHECK ALREADY BOOKED
    for (const seat of seats) {

      if (
        existingShow.bookedSeats.includes(seat)
      ) {

        return res.status(400).json({

          message:
            `${seat} already booked`

        });

      }

    }

    // LOCK EXPIRY TIME
    const expiresAt =
      Date.now() + 120000;

    const lockedKeys = [];

    try {

      for (const seat of seats) {

        const lockKey =
          `lock:${showId}:${seat}`;

        const result =
          await redis.set(

            lockKey,

            JSON.stringify({

              userId,

              expiresAt

            }),

            'EX',

            120,

            'NX'

          );

        if (!result) {

          throw new Error(
            `${seat} already locked`
          );

        }

        lockedKeys.push(lockKey);

      }

    } catch (error) {

      // ROLLBACK PREVIOUS LOCKS
      for (const key of lockedKeys) {

        await redis.del(key);

      }

      return res.status(400).json({

        message: error.message

      });

    }

    res.json({

      message:
        'Seats locked successfully',

      expiresAt

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};

const confirmBooking = async (req, res) => {

  try {

    const {

      user,

      movie,

      theatre,

      show,

      seats,

      totalAmount

    } = req.body;

    const existingShow =
      await Show.findById(show);

    if (!existingShow) {

      return res.status(404).json({

        message:
        'Show not found'

      });

    }

    for (const seat of seats) {

      if (
        existingShow.bookedSeats.includes(seat)
      ) {

        return res.status(400).json({

          message:
          `${seat} already booked`

        });

      }

    }

    for (const seat of seats) {

      const lockKey =
        `lock:${show}:${seat}`;

      const lockData =
        await redis.get(lockKey);

      if (!lockData) {

        return res.status(400).json({

          message:
          `Lock expired for ${seat}`

        });

      }

    }

    const booking =
      await Booking.create({

        user,

        movie,

        theatre,

        show,

        seats,

        totalAmount,

        bookingId: uuidv4()

      });

    existingShow.bookedSeats.push(
      ...seats
    );

    await existingShow.save();

    for (const seat of seats) {

      const lockKey =
        `lock:${show}:${seat}`;

      await redis.del(lockKey);

    }

    res.status(201).json({

      message:
      'Booking Confirmed',

      booking

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};
const unlockSeat = async (req, res) => {

  try {

    const {

      showId,

      seat

    } = req.body;

    const lockKey =
      `lock:${showId}:${seat}`;

    await redis.del(lockKey);

    res.json({

      message:
      'Seat unlocked'

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('movie')
      .populate('theatre')
      .populate('show');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('movie')
      .populate('theatre')
      .populate('show');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getLockedSeats = async (req, res) => {

  try {

    const { showId } = req.params;

    const keys =
      await redis.keys(
        `lock:${showId}:*`
      );

    const lockedSeats = [];

    const seatOwners = {};

    for (const key of keys) {

      const seat =
        key.split(':')[2];

      const data =
        await redis.get(key);

      if (data) {

        const parsed =
          JSON.parse(data);

        lockedSeats.push(seat);

        seatOwners[seat] =
          parsed.userId;

      }

    }

    res.json({

      lockedSeats,

      seatOwners

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};

module.exports = {
  lockSeats,
  unlockSeat,
  confirmBooking,
  getBookings,
  getUserBookings,
  getLockedSeats
};