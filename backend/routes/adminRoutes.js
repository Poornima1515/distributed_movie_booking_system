const express = require('express');
const router = express.Router();
const {
  addTheatre,
  getTheatres,
  deleteTheatre,
  addShow,
  getShows,
  deleteShow
} = require('../controllers/adminController');

router.post('/theatre', addTheatre);
router.get('/theatres', getTheatres);
router.delete('/theatre/:id', deleteTheatre);

router.post('/show', addShow);
router.get('/shows', getShows);
router.delete('/show/:id', deleteShow);

module.exports = router;
