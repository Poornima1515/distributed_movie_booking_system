const User = require('../models/User');
const Booking = require('../models/Booking');

// GET MY LOYALTY POINTS
const getPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email loyaltyPoints totalSpent');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const recentBookings = await Booking.find({ user: req.user.id, status: 'CONFIRMED' })
      .select('bookingId totalAmount loyaltyPointsEarned bookedAt')
      .populate('movie', 'title')
      .sort({ bookedAt: -1 })
      .limit(10);

    res.json({
      loyaltyPoints: user.loyaltyPoints,
      totalSpent: user.totalSpent,
      pointsValue: Math.floor(user.loyaltyPoints / 100) * 50,
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PREVIEW REDEMPTION - returns discount amount without deducting
// Used at booking time to show how much discount user will get
const previewRedemption = async (req, res) => {
  try {
    const { pointsToRedeem } = req.body;
    const pts = Number(pointsToRedeem);
    if (!pts || pts < 100) return res.status(400).json({ message: 'Minimum 100 points required' });
    if (pts % 100 !== 0) return res.status(400).json({ message: 'Must be in multiples of 100' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.loyaltyPoints < pts) return res.status(400).json({ message: `You only have ${user.loyaltyPoints} points` });

    const discount = Math.floor(pts / 100) * 50;
    res.json({ valid: true, pointsToRedeem: pts, discount, remainingPoints: user.loyaltyPoints - pts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// APPLY REDEMPTION AT BOOKING - deducts points, called from payment flow
const applyRedemption = async (userId, pointsToRedeem) => {
  if (!pointsToRedeem || pointsToRedeem < 100) return 0;
  const pts = Math.floor(pointsToRedeem / 100) * 100; // round down to nearest 100
  const user = await User.findById(userId);
  if (!user || user.loyaltyPoints < pts) return 0;
  const discount = Math.floor(pts / 100) * 50;
  user.loyaltyPoints -= pts;
  await user.save();
  return discount;
};

// STANDALONE REDEEM (for Bookings page - just converts points to discount info)
const redeemPoints = async (req, res) => {
  try {
    const { pointsToRedeem } = req.body;
    const pts = Number(pointsToRedeem);
    if (!pts || pts < 100) return res.status(400).json({ message: 'Minimum 100 points required' });
    if (pts % 100 !== 0) return res.status(400).json({ message: 'Points must be in multiples of 100' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.loyaltyPoints < pts) return res.status(400).json({ message: `Insufficient points. You have ${user.loyaltyPoints} points.` });

    const discount = Math.floor(pts / 100) * 50;
    user.loyaltyPoints -= pts;
    await user.save();

    res.json({
      message: `${pts} points redeemed! ₹${discount} will be deducted from your next booking. Apply points during seat selection at checkout.`,
      discount,
      remainingPoints: user.loyaltyPoints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPoints, redeemPoints, previewRedemption, applyRedemption };
