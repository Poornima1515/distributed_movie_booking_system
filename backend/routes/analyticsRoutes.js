const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Admin only — analytics should not be public
router.get('/', protect, adminOnly, getAnalytics);

module.exports = router;
