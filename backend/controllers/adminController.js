const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const User = require('../models/User');

// ADD THEATRE
const addTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json(theatre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET THEATRES
const getTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find();
    res.json(theatres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE THEATRE
const deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);

    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' });
    }

    res.json({ message: 'Theatre deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD SHOW WITH AUTO SEATS
const addShow = async (req, res) => {
  try {
    const { movie, theatre, showTime, price } = req.body;

    // AUTO GENERATE SEATS (50 seats)
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];

    for (const row of rows) {
      for (let i = 1; i <= 10; i++) {
        seats.push(`${row}${i}`);
      }
    }

    const show = await Show.create({
      movie,
      theatre,
      showTime,
      price,
      seats,
      bookedSeats: []
    });

    res.status(201).json({
      message: 'Show added successfully',
      show
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL SHOWS
const getShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate('movie')
      .populate('theatre');

    res.json(shows);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE SHOW
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    res.json(show);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE SHOW
const deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);

    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    res.json({ message: 'Show deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MIGRATE EMPTY SEATS
const migrateSeats = async (req, res) => {
  try {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const defaultSeats = [];

    for (const row of rows) {
      for (let i = 1; i <= 10; i++) {
        defaultSeats.push(`${row}${i}`);
      }
    }

    const result = await Show.updateMany(
      { seats: { $size: 0 } },
      { $set: { seats: defaultSeats } }
    );

    res.json({
      message: `Migration complete. ${result.modifiedCount} show(s) updated with 50 seats.`
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ASSIGN THEATRE OWNER (admin only)
const assignTheatreOwner = async (req, res) => {
  try {
    const { theatreId, ownerId, commissionRate } = req.body;

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) return res.status(404).json({ message: 'Theatre not found' });

    if (ownerId) {
      const owner = await User.findById(ownerId);
      if (!owner) return res.status(404).json({ message: 'User not found' });

      // Promote user to theatreOwner role
      owner.role = 'theatreOwner';
      await owner.save();

      theatre.owner = ownerId;
    } else {
      theatre.owner = null;
    }

    if (commissionRate !== undefined) {
      theatre.commissionRate = commissionRate;
    }

    await theatre.save();
    await theatre.populate('owner', 'name email role');

    res.json({ message: 'Theatre owner assigned successfully', theatre });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL USERS (admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EXPORTS
module.exports = {
  addTheatre,
  getTheatres,
  deleteTheatre,
  addShow,
  getShows,
  getShowById,
  deleteShow,
  migrateSeats,
  assignTheatreOwner,
  getUsers
};