const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");
const User = require("../models/User");
const redis = require("../config/redis");
const { v4: uuidv4 } = require("uuid");
const { sendTicketEmail } = require("../utils/emailService");

// CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY PAYMENT + SAVE BOOKING + SEND EMAIL
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, seats, showId, userId } = req.body;

    // VERIFY SIGNATURE
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const existingShow = await Show.findById(showId).populate('movie').populate('theatre');
    if (!existingShow) return res.status(404).json({ message: "Show not found" });

    const user = await User.findById(userId);

    // SAVE BOOKING
    const booking = await Booking.create({
      user: userId,
      movie: existingShow.movie._id,
      theatre: existingShow.theatre._id,
      show: showId,
      seats,
      totalAmount: seats.length * (existingShow.price || 200),
      bookingId: uuidv4(),
      userEmail: user?.email || '',
      status: 'CONFIRMED'
    });

    // UPDATE BOOKED SEATS (prevent duplicates)
    existingShow.bookedSeats = [...new Set([...existingShow.bookedSeats, ...seats])];
    await existingShow.save();

    // REMOVE REDIS LOCKS
    for (const seat of seats) {
      await redis.del(`lock:${showId}:${seat}`);
    }

    // EMIT SOCKET EVENTS FROM BACKEND — reliable regardless of frontend state
    const io = req.app.get('io');
    if (io) {
      // Notify seat page users that seats are now booked
      io.to(showId).emit('bookingConfirmed', { showId, seats });
      // Notify admin live feed
      io.to('admin-room').emit('newBookingActivity', {
        type: 'BOOKING',
        userName: user?.name || 'A user',
        seats,
        movieTitle: existingShow.movie?.title || 'a movie',
        theatreName: existingShow.theatre?.name || '',
        timestamp: new Date().toISOString()
      });
    }

    // SEND EMAIL TICKET (non-blocking)
    if (user?.email) {
      sendTicketEmail({
        to: user.email,
        booking,
        movie: existingShow.movie,
        theatre: existingShow.theatre,
        show: existingShow
      }).catch(err => console.log('Email error:', err.message));
    }

    res.status(200).json({ success: true, message: "Booking Confirmed", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// DOWNLOAD PDF TICKET
exports.downloadTicket = async (req, res) => {
  try {
    const { generateTicketPDF } = require('../utils/pdfTicket');
    const booking = await Booking.findById(req.params.bookingId)
      .populate('movie').populate('theatre').populate('show');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const pdfBuffer = await generateTicketPDF(booking, booking.movie, booking.theatre, booking.show);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CineVerse-Ticket-${booking.bookingId?.slice(0,8)}.pdf"`,
      'Content-Length': pdfBuffer.length,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Content-Disposition'
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.log('PDF error:', error.message);
    res.status(500).json({ message: error.message });
  }
};