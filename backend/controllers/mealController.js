const Meal = require('../models/Meal');

// GET ALL AVAILABLE MEALS (public — optionally filter by theatre)
const getMeals = async (req, res) => {
  try {
    const filter = { isAvailable: true };
    if (req.query.theatre) filter.theatre = req.query.theatre;
    const meals = await Meal.find(filter).populate('theatre', 'name');
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD MEAL (admin only)
const addMeal = async (req, res) => {
  try {
    const meal = await Meal.create(req.body);
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE MEAL (admin only)
const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE MEAL (admin only)
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMeals, addMeal, updateMeal, deleteMeal };
