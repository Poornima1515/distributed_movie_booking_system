const express = require('express');

const router = express.Router();

const {
  addTheatre,
  getTheatres,
  deleteTheatre,
  addShow,
  getShows,
  getShowById,
  deleteShow,
  migrateSeats,
  assignTheatreOwner,
  getUsers,
  resetUserRole
} = require('../controllers/adminController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// THEATRE ROUTES
router.post('/theatre', addTheatre);
router.get('/theatres', getTheatres);
router.delete('/theatre/:id', deleteTheatre);

// SHOW ROUTES
router.post('/show', addShow);
router.get('/shows', getShows);
router.get('/show/:id', getShowById);
router.delete('/show/:id', deleteShow);

// MIGRATION ROUTE
router.post('/migrate-seats', migrateSeats);

// THEATRE OWNER ASSIGNMENT (admin only)
router.post('/assign-owner', protect, adminOnly, assignTheatreOwner);

// GET ALL USERS (admin only)
router.get('/users', protect, adminOnly, getUsers);

// RESET USER ROLE (admin only)
router.post('/reset-role', protect, adminOnly, resetUserRole);

module.exports = router;