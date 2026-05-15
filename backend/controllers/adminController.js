const Theatre =
require('../models/Theatre');

const Show =
require('../models/Show');



// ADD THEATRE
const addTheatre =
async (req, res) => {

  try {

    const theatre =
      await Theatre.create(
        req.body
      );

    res.status(201).json(
      theatre
    );

  } catch (error) {

    res.status(500).json({

      message:
        error.message

    });

  }

};



// GET THEATRES
const getTheatres =
async (req, res) => {

  try {

    const theatres =
      await Theatre.find();

    res.json(theatres);

  } catch (error) {

    res.status(500).json({

      message:
        error.message

    });

  }

};



// ADD SHOW WITH AUTO SEATS
const addShow =
async (req, res) => {

  try {

    const {

      movie,

      theatre,

      showTime,

      price

    } = req.body;

    // AUTO GENERATE SEATS
    const seats = [];

    const rows = [

      'A',

      'B',

      'C',

      'D',

      'E'

    ];

    for (const row of rows) {

      for (

        let i = 1;

        i <= 10;

        i++

      ) {

        seats.push(

          `${row}${i}`

        );

      }

    }

    // CREATE SHOW
    const show =
      await Show.create({

        movie,

        theatre,

        showTime,

        price,

        seats,

        bookedSeats: []

      });

    res.status(201).json({

      message:
        'Show added successfully',

      show

    });

  } catch (error) {

    res.status(500).json({

      message:
        error.message

    });

  }

};



// GET SHOWS
const getShows =
async (req, res) => {

  try {

    const shows =
      await Show.find()

      .populate('movie')

      .populate('theatre');

    res.json(shows);

  } catch (error) {

    res.status(500).json({

      message:
        error.message

    });

  }

};



// EXPORTS
module.exports = {

  addTheatre,

  getTheatres,

  addShow,

  getShows

};