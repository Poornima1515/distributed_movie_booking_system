const express = require('express');
const router = express.Router();

const {
  addTheatre, getTheatres, deleteTheatre,
  addShow, getShows, getShowById, deleteShow,
  migrateSeats, assignTheatreOwner, getUsers, resetUserRole
} = require('../controllers/adminController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// PUBLIC TO ALL LOGGED-IN USERS (used by theatre owner + user pages too)
router.get('/theatres', protect, getTheatres);
router.get('/shows', protect, getShows);
router.get('/show/:id', protect, getShowById);

// ADMIN ONLY ROUTES
router.post('/theatre', protect, adminOnly, addTheatre);
router.delete('/theatre/:id', protect, adminOnly, deleteTheatre);
router.post('/show', protect, adminOnly, addShow);
router.delete('/show/:id', protect, adminOnly, deleteShow);
router.post('/migrate-seats', protect, adminOnly, migrateSeats);
router.post('/assign-owner', protect, adminOnly, assignTheatreOwner);
router.get('/users', protect, adminOnly, getUsers);
router.post('/reset-role', protect, adminOnly, resetUserRole);

module.exports = router;
