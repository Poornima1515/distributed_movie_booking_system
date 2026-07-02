const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['user', 'admin', 'theatreOwner'],
    default: 'user'
  },

  // Loyalty program
  loyaltyPoints: {
    type: Number,
    default: 0
  },

  totalSpent: {
    type: Number,
    default: 0
  },

  // Referral system (Feature 9)
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 }

}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
