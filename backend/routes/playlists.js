const express = require('express');
const router = express.Router();
const {
  getPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  getUserPlaylists,
  getFeaturedPlaylists
} = require('../controllers/playlistController');

const { protect } = require('../middleware/auth');

// Public routes (with optional auth for more content)
router.get('/', getPlaylists);
router.get('/featured', getFeaturedPlaylists);
router.get('/user/:userId', getUserPlaylists);
router.get('/:id', getPlaylist);

// Protected routes
router.use(protect);

router.post('/', createPlaylist);
router.put('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);

// Playlist track management
router.post('/:id/tracks', addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', removeTrackFromPlaylist);

module.exports = router;