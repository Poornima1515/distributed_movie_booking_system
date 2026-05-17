const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show' },
  seats: [String],
  totalAmount: Number,
  paymentStatus: { type: String, default: 'SUCCESS' },
  bookingId: String,
  userEmail: String,
  status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' },
  cancelledAt: { type: Date },
  refundAmount: { type: Number, default: 0 },
  bookedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);