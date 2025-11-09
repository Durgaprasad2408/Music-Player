const Mood = require('../models/Mood');

// @desc    Get all moods
// @route   GET /api/moods
// @access  Public
const getMoods = async (req, res) => {
  try {
    const moods = await Mood.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { moods }
    });
  } catch (error) {
    console.error('Get moods error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving moods'
    });
  }
};

// @desc    Get single mood
// @route   GET /api/moods/:id
// @access  Public
const getMood = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood || !mood.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Mood not found'
      });
    }

    res.json({
      success: true,
      data: { mood }
    });
  } catch (error) {
    console.error('Get mood error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving mood'
    });
  }
};

// @desc    Create mood
// @route   POST /api/moods
// @access  Private/Admin
const createMood = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    const mood = await Mood.create({
      name,
      description,
      color,
      icon
    });

    res.status(201).json({
      success: true,
      data: { mood }
    });
  } catch (error) {
    console.error('Create mood error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Mood name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error creating mood'
    });
  }
};

// @desc    Update mood
// @route   PUT /api/moods/:id
// @access  Private/Admin
const updateMood = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({
        success: false,
        error: 'Mood not found'
      });
    }

    const { name, description, color, icon } = req.body;

    mood.name = name || mood.name;
    mood.description = description || mood.description;
    mood.color = color || mood.color;
    mood.icon = icon || mood.icon;

    await mood.save();

    res.json({
      success: true,
      data: { mood }
    });
  } catch (error) {
    console.error('Update mood error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Mood name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error updating mood'
    });
  }
};

// @desc    Delete mood
// @route   DELETE /api/moods/:id
// @access  Private/Admin
const deleteMood = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({
        success: false,
        error: 'Mood not found'
      });
    }

    // Soft delete
    mood.isActive = false;
    await mood.save();

    res.json({
      success: true,
      message: 'Mood deleted successfully'
    });
  } catch (error) {
    console.error('Delete mood error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting mood'
    });
  }
};

module.exports = {
  getMoods,
  getMood,
  createMood,
  updateMood,
  deleteMood
};