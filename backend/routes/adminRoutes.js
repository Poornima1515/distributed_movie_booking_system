const express = require('express');

const router = express.Router();

const {

  addTheatre,

  getTheatres,

  addShow,

  getShows

} = require('../controllers/adminController');

router.post(
  '/theatre',
  addTheatre
);

router.get(
  '/theatres',
  getTheatres
);

router.post(
  '/show',
  addShow
);

router.get(
  '/shows',
  getShows
);

module.exports = router;