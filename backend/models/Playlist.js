const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user']
  },
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }],
  coverUrl: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  playCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
playlistSchema.index({ user: 1 });
playlistSchema.index({ isPublic: 1 });
playlistSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Playlist', playlistSchema);