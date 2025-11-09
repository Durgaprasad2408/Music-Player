const express = require('express');
const router = express.Router();
const {
  getPlayHistory,
  getRecentTracks,
  clearPlayHistory,
  removePlayHistoryEntry,
  getListeningStats
} = require('../controllers/playHistoryController');

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/', getPlayHistory);
router.get('/recent', getRecentTracks);
router.get('/stats', getListeningStats);
router.delete('/', clearPlayHistory);
router.delete('/:id', removePlayHistoryEntry);

module.exports = router;