const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user']
  },
  track: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: [true, 'Please add a track']
  }
}, {
  timestamps: true
});

// Ensure a user can only favorite a track once
favoriteSchema.index({ user: 1, track: 1 }, { unique: true });

// Indexes
favoriteSchema.index({ user: 1 });
favoriteSchema.index({ track: 1 });

module.exports = mongoose.model('Favorite', favoriteSchema);