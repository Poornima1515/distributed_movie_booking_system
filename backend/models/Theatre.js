const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  city: String,

  screens: Number

}, {
  timestamps: true
});

const Theatre = mongoose.model(
  'Theatre',
  theatreSchema
);

module.exports = Theatre;