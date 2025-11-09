const mongoose = require('mongoose');

const playHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user']
  },
  track: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: [true, 'Please add a track']
  },
  playedAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // How long the track was played in seconds
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
playHistorySchema.index({ user: 1, playedAt: -1 });
playHistorySchema.index({ track: 1 });
playHistorySchema.index({ user: 1, track: 1 });

module.exports = mongoose.model('PlayHistory', playHistorySchema);