const express = require('express');

const router = express.Router();

const {

  addMovie,

  getMovies

} = require('../controllers/movieController');

router.post(
  '/add',
  addMovie
);

router.get(
  '/',
  getMovies
);

module.exports = router;