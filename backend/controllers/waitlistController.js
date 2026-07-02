const Waitlist = require('../models/Waitlist');
const Show = require('../models/Show');

// JOIN WAITLIST
const joinWaitlist = async (req, res) => {
  try {
    const { showId, seats } = req.body;

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: 'Show not found' });

    // Check if already on waitlist for this show
    const existing = await Waitlist.findOne({
      user: req.user.id,
      show: showId,
      status: { $in: ['waiting', 'notified'] }
    });
    if (existing) {
      return res.status(400).json({ message: 'You are already on the waitlist for this show' });
    }

    const entry = await Waitlist.create({
      user: req.user.id,
      show: showId,
      seats: seats || 1
    });

    await entry.populate([
      { path: 'show', populate: [{ path: 'movie' }, { path: 'theatre' }] }
    ]);

    res.status(201).json({ message: 'Added to waitlist successfully', entry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY WAITLIST
const getMyWaitlist = async (req, res) => {
  try {
    const entries = await Waitlist.find({ user: req.user.id })
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title poster' },
          { path: 'theatre', select: 'name city' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LEAVE WAITLIST
const leaveWaitlist = async (req, res) => {
  try {
    const entry = await Waitlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!entry) return res.status(404).json({ message: 'Waitlist entry not found' });
    res.json({ message: 'Removed from waitlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { joinWaitlist, getMyWaitlist, leaveWaitlist };
