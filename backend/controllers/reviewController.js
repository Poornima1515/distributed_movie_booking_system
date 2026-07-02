const Review = require('../models/Review');
const Movie = require('../models/Movie');
const Booking = require('../models/Booking');

// ADD OR UPDATE REVIEW
const addReview = async (req, res) => {
  try {
    const { movieId, rating, review } = req.body;
    if (!movieId || !rating) return res.status(400).json({ message: 'movieId and rating are required' });

    // Check user has a confirmed booking for this movie
    const booking = await Booking.findOne({ user: req.user.id, movie: movieId, status: 'CONFIRMED' });
    if (!booking) return res.status(403).json({ message: 'You can only review movies you have watched' });

    // Upsert review
    const existing = await Review.findOne({ user: req.user.id, movie: movieId });
    let savedReview;
    if (existing) {
      existing.rating = rating;
      existing.review = review || '';
      savedReview = await existing.save();
    } else {
      savedReview = await Review.create({ user: req.user.id, movie: movieId, rating, review: review || '' });
    }

    // Recalculate average rating on Movie
    const allReviews = await Review.find({ movie: movieId });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: allReviews.length
    });

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET REVIEWS FOR A MOVIE
const getMovieReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE OWN REVIEW
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user.id });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.deleteOne();

    // Recalculate
    const allReviews = await Review.find({ movie: review.movie });
    const avg = allReviews.length > 0
      ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      : 0;
    await Movie.findByIdAndUpdate(review.movie, {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: allReviews.length
    });

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addReview, getMovieReviews, deleteReview };
