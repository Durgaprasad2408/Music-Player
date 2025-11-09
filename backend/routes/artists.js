const express = require('express');
const router = express.Router();
const {
  getArtists,
  getArtist,
  createArtist,
  updateArtist,
  deleteArtist,
  followArtist,
  unfollowArtist,
  getFollowedArtists
} = require('../controllers/artistController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getArtists);
router.get('/:id', getArtist);

// Protected routes
router.use(protect);

// User routes
router.post('/:id/follow', followArtist);
router.delete('/:id/follow', unfollowArtist);
router.get('/followed', getFollowedArtists);

// Admin only routes
router.post('/', authorize('admin'), createArtist);
router.put('/:id', authorize('admin'), updateArtist);
router.delete('/:id', authorize('admin'), deleteArtist);

module.exports = router;