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

  description: String

}, {
  timestamps: true
});

const Movie = mongoose.model(
  'Movie',
  movieSchema
);

module.exports = Movie;