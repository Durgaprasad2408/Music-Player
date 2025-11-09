const express = require('express');
const router = express.Router();
const {
  getAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getAlbumsByArtist
} = require('../controllers/albumController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAlbums);
router.get('/:id', getAlbum);
router.get('/artist/:artistId', getAlbumsByArtist);

// Protected routes - Admin only
router.use(protect);
router.use(authorize('admin'));

router.post('/', createAlbum);
router.put('/:id', updateAlbum);
router.delete('/:id', deleteAlbum);

module.exports = router;