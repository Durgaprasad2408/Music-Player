const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
} = require('../controllers/favoriteController');

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:trackId', removeFavorite);
router.get('/check/:trackId', checkFavorite);

module.exports = router;