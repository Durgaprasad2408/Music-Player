const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: [true, 'Please add an artist']
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: [true, 'Please add an album']
  },
  genre: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre'
  }],
  mood: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mood'
  }],
  duration: {
    type: Number, // in seconds
    required: [true, 'Please add duration']
  },
  fileUrl: {
    type: String,
    required: [true, 'Please add file URL']
  },
  coverUrl: {
    type: String,
    default: ''
  },
  lyrics: {
    type: String,
    default: ''
  },
  playCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
trackSchema.index({ title: 1 });
trackSchema.index({ artist: 1 });
trackSchema.index({ album: 1 });
trackSchema.index({ genre: 1 });
trackSchema.index({ mood: 1 });

module.exports = mongoose.model('Track', trackSchema);