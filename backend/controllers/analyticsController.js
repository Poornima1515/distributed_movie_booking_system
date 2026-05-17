const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');

// ANALYTICS: bookings per movie, revenue per theatre, occupancy, peak hours
const getAnalytics = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'CONFIRMED' })
      .populate('movie', 'title')
      .populate('theatre', 'name')
      .populate('show', 'seats bookedSeats');

    // 1. Bookings per movie
    const movieMap = {};
    bookings.forEach(b => {
      const title = b.movie?.title || 'Unknown';
      movieMap[title] = (movieMap[title] || 0) + (b.seats?.length || 0);
    });
    const bookingsPerMovie = Object.entries(movieMap)
      .map(([movie, count]) => ({ movie, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 2. Revenue per theatre
    const theatreRevMap = {};
    bookings.forEach(b => {
      const name = b.theatre?.name || 'Unknown';
      theatreRevMap[name] = (theatreRevMap[name] || 0) + (b.totalAmount || 0);
    });
    const revenuePerTheatre = Object.entries(theatreRevMap)
      .map(([theatre, revenue]) => ({ theatre, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // 3. Occupancy rate per show (top 6)
    const shows = await Show.find().populate('movie', 'title').populate('theatre', 'name');
    const occupancy = shows
      .filter(s => s.seats?.length > 0)
      .map(s => ({
        label: `${s.movie?.title || '?'} @ ${s.theatre?.name || '?'}`,
        rate: Math.round(((s.bookedSeats?.length || 0) / (s.seats?.length || 1)) * 100)
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 6);

    // 4. Peak booking hours
    const hourMap = {};
    bookings.forEach(b => {
      const hour = new Date(b.bookedAt).getHours();
      const label = `${hour}:00`;
      hourMap[label] = (hourMap[label] || 0) + 1;
    });
    const peakHours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      count: hourMap[`${i}:00`] || 0
    }));

    // 5. Summary stats
    const totalRevenue = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const totalTickets = bookings.reduce((s, b) => s + (b.seats?.length || 0), 0);
    const cancelledCount = await Booking.countDocuments({ status: 'CANCELLED' });

    res.json({
      bookingsPerMovie,
      revenuePerTheatre,
      occupancy,
      peakHours,
      summary: {
        totalRevenue,
        totalTickets,
        totalBookings: bookings.length,
        cancelledBookings: cancelledCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics };