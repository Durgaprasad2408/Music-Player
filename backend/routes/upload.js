const express = require('express');
const router = express.Router();
const {
  uploadTrack,
  uploadImage,
  deleteFile
} = require('../controllers/uploadController');

const { protect, authorize } = require('../middleware/auth');
const { uploadTrack: uploadTrackMiddleware, uploadImage: uploadImageMiddleware } = require('../middleware/upload');

// All routes require authentication and admin authorization
router.use(protect);
router.use(authorize('admin'));

// @route   POST /api/upload/track
// @desc    Upload track file
// @access  Private/Admin
router.post('/track', uploadTrackMiddleware, uploadTrack);

// @route   POST /api/upload/image
// @desc    Upload image file
// @access  Private/Admin
router.post('/image', uploadImageMiddleware, uploadImage);

// @route   DELETE /api/upload/:public_id
// @desc    Delete file from Cloudinary
// @access  Private/Admin
router.delete('/:public_id', deleteFile);

module.exports = router;