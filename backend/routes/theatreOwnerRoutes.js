const express = require('express');
const router = express.Router();
const { protect, theatreOwnerOnly } = require('../middleware/authMiddleware');
const {
  getMyTheatre,
  getMyShows,
  getMyRevenue,
  getMyBookings,
  getMyMeals,
  addMyMeal,
  updateMyMeal,
  deleteMyMeal
} = require('../controllers/theatreOwnerController');

router.use(protect, theatreOwnerOnly);

router.get('/theatre', getMyTheatre);
router.get('/shows', getMyShows);
router.get('/revenue', getMyRevenue);
router.get('/bookings', getMyBookings);
router.get('/meals', getMyMeals);
router.post('/meals', addMyMeal);
router.put('/meals/:id', updateMyMeal);
router.delete('/meals/:id', deleteMyMeal);

module.exports = router;
