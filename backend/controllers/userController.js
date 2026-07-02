const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Booking = require('../models/Booking');

// GET MY PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const recentBookings = await Booking.find({ user: req.user.id, status: 'CONFIRMED' })
      .populate('movie', 'title poster').populate('theatre', 'name')
      .sort({ bookedAt: -1 }).limit(5);
    res.json({ user, recentBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE NAME
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2)
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    const user = await User.findByIdAndUpdate(
      req.user.id, { name: name.trim() }, { new: true }
    ).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: 'Old and new password required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
