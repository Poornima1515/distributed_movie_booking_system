const express = require('express');
const router = express.Router();
const { addMovie, getMovies, getMovieById, updateMovie, deleteMovie, getRecommendations } = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public to all logged-in users
router.get('/', protect, getMovies);
router.get('/:id', protect, getMovieById);
router.get('/:id/recommendations', protect, getRecommendations);

// Admin only
router.post('/add', protect, adminOnly, addMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
