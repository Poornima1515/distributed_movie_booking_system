const AuditLog = require('../models/AuditLog');

const getLogs = async (req, res) => {
  try {
    const { action, page = 1, limit = 50 } = req.query;
    const filter = action ? { action } : {};
    const logs = await AuditLog.find(filter)
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await AuditLog.countDocuments(filter);
    res.json({ logs, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLogs };
