const Movie = require('../models/Movie');

const addMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getMovies = async (req, res) => {
  try {
    const { search, genre, language, minRating, sort } = req.query;
    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (genre) filter.genre = { $regex: genre, $options: 'i' };
    if (language) filter.language = { $regex: language, $options: 'i' };
    if (minRating) filter.rating = { $gte: minRating };
    const sortMap = { rating: { rating: -1 }, title: { title: 1 }, newest: { createdAt: -1 } };
    const sortBy = sortMap[sort] || { createdAt: -1 };
    const movies = await Movie.find(filter).sort(sortBy);
    res.json(movies);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie updated successfully', movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// MOVIE RECOMMENDATIONS (genre + collaborative)
const getRecommendations = async (req, res) => {
  try {
    const { movieId } = req.params;
    const Booking = require('../models/Booking');

    const targetMovie = await Movie.findById(movieId);
    if (!targetMovie) return res.status(404).json({ message: 'Movie not found' });

    // 1. Find users who booked this movie
    const bookingsForMovie = await Booking.find({ movie: movieId }).distinct('user');

    // 2. Find what else those users booked
    const coBookings = await Booking.find({
      user: { $in: bookingsForMovie },
      movie: { $ne: movieId }
    }).distinct('movie');

    // 3. Genre-based fallback
    const genreMovies = await Movie.find({
      _id: { $ne: movieId },
      genre: { $regex: targetMovie.genre?.split(' ')[0] || '', $options: 'i' }
    }).limit(6);

    // 4. Merge: collaborative first, then genre
    const collabMovies = coBookings.length > 0
      ? await Movie.find({ _id: { $in: coBookings, $ne: movieId } }).limit(4)
      : [];

    const seen = new Set(collabMovies.map(m => m._id.toString()));
    const combined = [
      ...collabMovies,
      ...genreMovies.filter(m => !seen.has(m._id.toString()))
    ].slice(0, 6);

    res.json({ recommendations: combined, basedOn: collabMovies.length > 0 ? 'collaborative' : 'genre' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addMovie, getMovies, getMovieById, updateMovie, deleteMovie, getRecommendations };