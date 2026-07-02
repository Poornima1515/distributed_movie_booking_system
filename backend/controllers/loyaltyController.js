const User = require('../models/User');
const Booking = require('../models/Booking');

// GET MY LOYALTY POINTS
const getPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email loyaltyPoints totalSpent');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Also get recent bookings to show points earned per booking
    const recentBookings = await Booking.find({ user: req.user.id, status: 'CONFIRMED' })
      .select('bookingId totalAmount loyaltyPointsEarned bookedAt')
      .populate('movie', 'title')
      .sort({ bookedAt: -1 })
      .limit(10);

    res.json({
      loyaltyPoints: user.loyaltyPoints,
      totalSpent: user.totalSpent,
      pointsValue: Math.floor(user.loyaltyPoints / 100) * 50, // ₹50 per 100 points
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REDEEM POINTS (100 points = ₹50 off)
const redeemPoints = async (req, res) => {
  try {
    const { pointsToRedeem } = req.body;

    if (!pointsToRedeem || pointsToRedeem < 100) {
      return res.status(400).json({ message: 'Minimum 100 points required to redeem' });
    }

    if (pointsToRedeem % 100 !== 0) {
      return res.status(400).json({ message: 'Points must be in multiples of 100' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.loyaltyPoints < pointsToRedeem) {
      return res.status(400).json({
        message: `Insufficient points. You have ${user.loyaltyPoints} points.`
      });
    }

    const discount = Math.floor(pointsToRedeem / 100) * 50; // ₹50 per 100 points

    user.loyaltyPoints -= pointsToRedeem;
    await user.save();

    res.json({
      message: `Successfully redeemed ${pointsToRedeem} points for ₹${discount} discount`,
      discount,
      remainingPoints: user.loyaltyPoints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPoints, redeemPoints };
