const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
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
  genre: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre'
  }],
  releaseDate: {
    type: Date,
    required: [true, 'Please add release date']
  },
  coverUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }],
  totalDuration: {
    type: Number, // in seconds
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
albumSchema.index({ title: 1 });
albumSchema.index({ artist: 1 });
albumSchema.index({ genre: 1 });
albumSchema.index({ releaseDate: -1 });

module.exports = mongoose.model('Album', albumSchema);