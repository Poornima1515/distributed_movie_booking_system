const express = require('express');
const router = express.Router();
const { createPromo, getPromos, validatePromo, togglePromo, deletePromo } = require('../controllers/promoController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/validate', protect, validatePromo);
router.get('/', protect, adminOnly, getPromos);
router.post('/', protect, adminOnly, createPromo);
router.patch('/:id/toggle', protect, adminOnly, togglePromo);
router.delete('/:id', protect, adminOnly, deletePromo);

module.exports = router;
