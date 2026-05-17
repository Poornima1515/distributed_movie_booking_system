const express = require('express');
const router = express.Router();
const { addMovie, getMovies, getMovieById, updateMovie, deleteMovie, getRecommendations } = require('../controllers/movieController');

router.post('/add', addMovie);
router.get('/', getMovies);
router.get('/:id', getMovieById);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);
router.get('/:id/recommendations', getRecommendations);

module.exports = router;