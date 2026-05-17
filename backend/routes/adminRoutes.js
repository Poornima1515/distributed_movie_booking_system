const express = require('express');
const router = express.Router();
const {
  addTheatre,
  getTheatres,
  deleteTheatre,
  addShow,
  getShows,
  getShowById,
  deleteShow,
  migrateSeats
} = require('../controllers/adminController');

router.post('/theatre', addTheatre);
router.get('/theatres', getTheatres);
router.delete('/theatre/:id', deleteTheatre);

router.post('/show', addShow);
router.get('/shows', getShows);
router.get('/show/:id', getShowById);
router.delete('/show/:id', deleteShow);
router.post('/migrate-seats', migrateSeats);

module.exports = router;