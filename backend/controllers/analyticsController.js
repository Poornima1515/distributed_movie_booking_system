const Booking = require('../models/Booking');
const Show = require('../models/Show');

const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = { status: 'CONFIRMED' };
    if (startDate || endDate) {
      dateFilter.bookedAt = {};
      if (startDate) dateFilter.bookedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.bookedAt.$lte = new Date(new Date(endDate).setHours(23,59,59,999));
    }

    const bookings = await Booking.find(dateFilter)
      .populate('movie', 'title').populate('theatre', 'name').populate('show', 'seats bookedSeats');

    const movieMap = {};
    bookings.forEach(b => {
      const title = b.movie?.title || 'Unknown';
      movieMap[title] = (movieMap[title] || 0) + (b.seats?.length || 0);
    });
    const bookingsPerMovie = Object.entries(movieMap)
      .map(([movie, count]) => ({ movie, count })).sort((a,b) => b.count - a.count).slice(0,8);

    const theatreRevMap = {};
    bookings.forEach(b => {
      const name = b.theatre?.name || 'Unknown';
      theatreRevMap[name] = (theatreRevMap[name] || 0) + (b.totalAmount || 0);
    });
    const revenuePerTheatre = Object.entries(theatreRevMap)
      .map(([theatre, revenue]) => ({ theatre, revenue })).sort((a,b) => b.revenue - a.revenue);

    const shows = await Show.find().populate('movie','title').populate('theatre','name');
    const occupancy = shows.filter(s => s.seats?.length > 0).map(s => ({
      label: `${s.movie?.title||'?'} @ ${s.theatre?.name||'?'}`,
      rate: Math.round(((s.bookedSeats?.length||0) / (s.seats?.length||1)) * 100)
    })).sort((a,b) => b.rate - a.rate).slice(0,6);

    const hourMap = {};
    bookings.forEach(b => {
      const hour = new Date(b.bookedAt).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    const peakHours = Array.from({length:24},(_,i) => ({ hour:`${i}:00`, count: hourMap[i]||0 }));

    const totalRevenue = bookings.reduce((s,b) => s + (b.totalAmount||0), 0);
    const totalTickets = bookings.reduce((s,b) => s + (b.seats?.length||0), 0);
    const cancelledCount = await Booking.countDocuments({ status:'CANCELLED' });

    res.json({ bookingsPerMovie, revenuePerTheatre, occupancy, peakHours,
      summary: { totalRevenue, totalTickets, totalBookings: bookings.length, cancelledBookings: cancelledCount },
      dateRange: { startDate: startDate || null, endDate: endDate || null }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics };
