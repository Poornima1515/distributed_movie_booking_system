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
  }

}, {
  timestamps: true
});

const Show = mongoose.model(
  'Show',
  showSchema
);

module.exports = Show;