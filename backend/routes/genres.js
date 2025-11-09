const express = require('express');
const router = express.Router();
const {
  getGenres,
  getGenre,
  createGenre,
  updateGenre,
  deleteGenre
} = require('../controllers/genreController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getGenres);
router.get('/:id', getGenre);

// Protected routes - Admin only
router.use(protect);
router.use(authorize('admin'));

router.post('/', createGenre);
router.put('/:id', updateGenre);
router.delete('/:id', deleteGenre);

module.exports = router;