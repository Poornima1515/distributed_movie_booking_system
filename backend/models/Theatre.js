const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  city: String,

  screens: Number,

  // Theatre owner
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Commission rate admin takes (%)
  commissionRate: {
    type: Number,
    default: 10
  },

  // Revenue tracking
  ownerRevenue: {
    type: Number,
    default: 0
  },

  adminRevenue: {
    type: Number,
    default: 0
  },

  totalRevenue: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

const Theatre = mongoose.model('Theatre', theatreSchema);

module.exports = Theatre;
