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
  bookedAt: { type: Date, default: Date.now },

  // Meal add-ons
  meals: [{
    meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 }
  }],
  mealsTotal: { type: Number, default: 0 },

  // Loyalty points earned from this booking
  loyaltyPointsEarned: { type: Number, default: 0 }
});

module.exports = mongoose.model('Booking', bookingSchema);
