const express = require('express');
const router = express.Router();
const {
  getMoods,
  getMood,
  createMood,
  updateMood,
  deleteMood
} = require('../controllers/moodController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getMoods);
router.get('/:id', getMood);

// Protected routes - Admin only
router.use(protect);
router.use(authorize('admin'));

router.post('/', createMood);
router.put('/:id', updateMood);
router.delete('/:id', deleteMood);

module.exports = router;