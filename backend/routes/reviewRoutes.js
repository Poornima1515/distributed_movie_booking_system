const express = require('express');
const router = express.Router();
const { addReview, getMovieReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addReview);
router.get('/movie/:movieId', protect, getMovieReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
