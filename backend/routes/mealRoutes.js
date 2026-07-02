const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getMeals, addMeal, updateMeal, deleteMeal } = require('../controllers/mealController');

// Public — get available meals (optionally ?theatre=id)
router.get('/', getMeals);

// Admin only
router.post('/', protect, adminOnly, addMeal);
router.put('/:id', protect, adminOnly, updateMeal);
router.delete('/:id', protect, adminOnly, deleteMeal);

module.exports = router;
