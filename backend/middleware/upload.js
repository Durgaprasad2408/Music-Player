const multer = require('multer');
const path = require('path');

// Memory storage for multer (files stored in memory for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedAudioTypes = /mp3|wav|flac|aac|ogg|m4a/;
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;

  // Check mimetype
  const mimetype = file.mimetype;
  const extname = allowedAudioTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedImageTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype.startsWith('audio/') || mimetype.startsWith('image/') || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio and image files are allowed.'), false);
  }
};

// Multer configuration for tracks (audio files)
const uploadTrack = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for audio files
  },
}).single('track');

// Multer configuration for images
const uploadImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
}).single('image');

// Middleware wrapper to handle multer errors
const handleMulterError = (uploadFunction) => {
  return (req, res, next) => {
    uploadFunction(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File too large. Please upload a smaller file.'
          });
        }
        return res.status(400).json({
          success: false,
          error: 'File upload error: ' + err.message
        });
      } else if (err) {
        // Other errors
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      next();
    });
  };
};

module.exports = {
  uploadTrack: handleMulterError(uploadTrack),
  uploadImage: handleMulterError(uploadImage),
};