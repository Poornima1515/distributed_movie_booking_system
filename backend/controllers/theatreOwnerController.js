const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Meal = require('../models/Meal');
const User = require('../models/User');

// GET MY THEATRE
const getMyTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findOne({ owner: req.user.id }).populate('owner', 'name email');
    if (!theatre) return res.status(404).json({ message: 'No theatre assigned to your account' });
    res.json(theatre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY SHOWS
const getMyShows = async (req, res) => {
  try {
    const theatre = await Theatre.findOne({ owner: req.user.id });
    if (!theatre) return res.status(404).json({ message: 'No theatre found' });

    const shows = await Show.find({ theatre: theatre._id })
      .populate('movie')
      .populate('theatre')
      .sort({ createdAt: -1 });

    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY REVENUE
const getMyRevenue = async (req, res) => {
  try {
    const theatre = await Theatre.findOne({ owner: req.user.id });
    if (!theatre) return res.status(404).json({ message: 'No theatre found' });

    const bookings = await Booking.find({ theatre: theatre._id, status: 'CONFIRMED' })
      .populate('movie', 'title');

    const totalRevenue = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const ownerRevenue = totalRevenue * (1 - (theatre.commissionRate || 10) / 100);
    const adminRevenue = totalRevenue * ((theatre.commissionRate || 10) / 100);

    // Per-movie breakdown
    const movieMap = {};
    bookings.forEach(b => {
      const title = b.movie?.title || 'Unknown';
      if (!movieMap[title]) movieMap[title] = { tickets: 0, revenue: 0 };
      movieMap[title].tickets += (b.seats || []).length;
      movieMap[title].revenue += b.totalAmount || 0;
    });

    res.json({
      theatre: {
        name: theatre.name,
        commissionRate: theatre.commissionRate,
        ownerRevenue: theatre.ownerRevenue,
        adminRevenue: theatre.adminRevenue,
        totalRevenue: theatre.totalRevenue
      },
      computed: {
        totalRevenue,
        ownerRevenue: Math.round(ownerRevenue),
        adminRevenue: Math.round(adminRevenue)
      },
      totalBookings: bookings.length,
      movieBreakdown: Object.entries(movieMap).map(([movie, data]) => ({ movie, ...data }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY BOOKINGS
const getMyBookings = async (req, res) => {
  try {
    const theatre = await Theatre.findOne({ owner: req.user.id });
    if (!theatre) return res.status(404).json({ message: 'No theatre found' });

    const bookings = await Booking.find({ theatre: theatre._id })
      .populate('movie', 'title')
      .populate('user', 'name email')
      .populate('show', 'showTime')
      .sort({ bookedAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY MEALS
const getMyMeals = async (req, res) => {
  try {
    const theatre = await Theatre.findOne({ owner: req.user.id });
    if (!theatre) return res.status(404).json({ message: 'No theatre found' });

    const meals = await Meal.find({ theatre: theatre._id });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD MY MEAL
const addMyMeal = async (req, res) => {
  try {
    const theatre = await Theatre.findOne({ owner: req.user.id });
    if (!theatre) return res.status(404).json({ message: 'No theatre found' });

    const meal = await Meal.create({ ...req.body, theatre: theatre._id });
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE MY MEAL
const updateMyMeal = async (req, res) => {
  try {
    const theatre = await Theatre.findOne({ owner: req.user.id });
    if (!theatre) return res.status(404).json({ message: 'No theatre found' });

    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, theatre: theatre._id },
      req.body,
      { new: true }
    );
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE MY MEAL
const deleteMyMeal = async (req, res) => {
  try {
    const theatre = await Theatre.findOne({ owner: req.user.id });
    if (!theatre) return res.status(404).json({ message: 'No theatre found' });

    const meal = await Meal.findOneAndDelete({ _id: req.params.id, theatre: theatre._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ message: 'Meal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyTheatre,
  getMyShows,
  getMyRevenue,
  getMyBookings,
  getMyMeals,
  addMyMeal,
  updateMyMeal,
  deleteMyMeal
};
