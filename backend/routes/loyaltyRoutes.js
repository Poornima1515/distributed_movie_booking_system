const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPoints, redeemPoints, previewRedemption } = require('../controllers/loyaltyController');

router.use(protect);
router.get('/points', getPoints);
router.post('/redeem', redeemPoints);
router.post('/preview', previewRedemption);

module.exports = router;
