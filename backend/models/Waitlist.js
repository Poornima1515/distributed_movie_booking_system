const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  seats: Number,
  status: {
    type: String,
    enum: ['waiting', 'notified', 'booked', 'expired'],
    default: 'waiting'
  },
  notifiedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
