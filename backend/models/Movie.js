const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  language: String,

  genre: String,

  duration: String,

  rating: String,

  poster: String,

  description: String,

  // Trailer link (Feature 10)
  trailerUrl: String,

  // Aggregate review data (Feature 3)
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }

}, {
  timestamps: true
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
