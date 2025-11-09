const express = require('express');
const router = express.Router();
const {
  getTracks,
  getTrack,
  createTrack,
  updateTrack,
  deleteTrack,
  recordPlay,
  searchTracks
} = require('../controllers/trackController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/search', searchTracks);
router.get('/', getTracks);
router.get('/:id', getTrack);

// Protected routes
router.use(protect);

// Admin only routes
router.post('/', authorize('admin'), createTrack);
router.put('/:id', authorize('admin'), updateTrack);
router.delete('/:id', authorize('admin'), deleteTrack);

// User routes
router.post('/:id/play', recordPlay);

module.exports = router;