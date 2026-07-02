const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { joinWaitlist, getMyWaitlist, leaveWaitlist } = require('../controllers/waitlistController');

router.use(protect);

router.post('/join', joinWaitlist);
router.get('/mine', getMyWaitlist);
router.delete('/:id', leaveWaitlist);

module.exports = router;
