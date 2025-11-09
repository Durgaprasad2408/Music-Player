const cloudinary = require('../config/cloudinary');

// @desc    Upload track file to Cloudinary
// @route   POST /api/upload/track
// @access  Private/Admin
const uploadTrack = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Upload to Cloudinary with audio-specific settings
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Cloudinary treats audio as video
          folder: 'musicplayer/tracks',
          public_id: `track_${Date.now()}`,
          format: 'mp3', // Force MP3 format
          quality: 'auto',
          audio_codec: 'mp3',
          audio_frequency: 44100,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        duration: result.duration,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (error) {
    console.error('Track upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload track file'
    });
  }
};

// @desc    Upload image file to Cloudinary
// @route   POST /api/upload/image
// @access  Private/Admin
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Upload to Cloudinary with image-specific settings
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'musicplayer/images',
          public_id: `image_${Date.now()}`,
          format: 'jpg', // Force JPG format
          quality: 'auto',
          width: 1000,
          height: 1000,
          crop: 'limit',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image file'
    });
  }
};

// @desc    Delete file from Cloudinary
// @route   DELETE /api/upload/:public_id
// @access  Private/Admin
const deleteFile = async (req, res) => {
  try {
    const { public_id } = req.params;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        error: 'Public ID is required'
      });
    }

    // Determine resource type based on public_id prefix
    let resource_type = 'image';
    if (public_id.startsWith('musicplayer/tracks/')) {
      resource_type = 'video'; // Audio files are treated as video
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type
    });

    if (result.result !== 'ok') {
      return res.status(400).json({
        success: false,
        error: 'Failed to delete file from Cloudinary'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
};

module.exports = {
  uploadTrack,
  uploadImage,
  deleteFile
};