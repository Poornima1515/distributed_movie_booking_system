const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({

  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  },

  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre'
  },

  showTime: String,

  price: Number,

  seats: {
    type: [String],
    default: []
  },

  bookedSeats: {
    type: [String],
    default: []
  },

  // Seat categories (Gold, Silver, Bronze)
  seatCategories: [{
    name: { type: String }, // 'Gold', 'Silver', 'Bronze'
    seats: [String],
    price: Number,
    color: String // '#ffd700', '#c0c0c0', '#cd7f32'
  }]

}, {
  timestamps: true
});

const Show = mongoose.model('Show', showSchema);

module.exports = Show;
