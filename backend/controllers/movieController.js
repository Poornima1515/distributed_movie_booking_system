const Movie = require('../models/Movie');

const addMovie = async (req, res) => {

  try {

    const movie =
      await Movie.create(req.body);

    res.status(201).json(movie);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

};

const getMovies = async (req, res) => {

  try {

    const movies =
      await Movie.find();

    res.json(movies);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

};

module.exports = {

  addMovie,

  getMovies

};