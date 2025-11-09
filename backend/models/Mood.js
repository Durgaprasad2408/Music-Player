const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
    unique: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  color: {
    type: String,
    default: '#10b981' // Default emerald color
  },
  icon: {
    type: String,
    default: '🎵'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
moodSchema.index({ name: 1 });

module.exports = mongoose.model('Mood', moodSchema);