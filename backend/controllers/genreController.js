const Genre = require('../models/Genre');

// @desc    Get all genres
// @route   GET /api/genres
// @access  Public
const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { genres }
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving genres'
    });
  }
};

// @desc    Get single genre
// @route   GET /api/genres/:id
// @access  Public
const getGenre = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre || !genre.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Genre not found'
      });
    }

    res.json({
      success: true,
      data: { genre }
    });
  } catch (error) {
    console.error('Get genre error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving genre'
    });
  }
};

// @desc    Create genre
// @route   POST /api/genres
// @access  Private/Admin
const createGenre = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const genre = await Genre.create({
      name,
      description,
      color
    });

    res.status(201).json({
      success: true,
      data: { genre }
    });
  } catch (error) {
    console.error('Create genre error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Genre name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error creating genre'
    });
  }
};

// @desc    Update genre
// @route   PUT /api/genres/:id
// @access  Private/Admin
const updateGenre = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        error: 'Genre not found'
      });
    }

    const { name, description, color } = req.body;

    genre.name = name || genre.name;
    genre.description = description || genre.description;
    genre.color = color || genre.color;

    await genre.save();

    res.json({
      success: true,
      data: { genre }
    });
  } catch (error) {
    console.error('Update genre error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Genre name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error updating genre'
    });
  }
};

// @desc    Delete genre
// @route   DELETE /api/genres/:id
// @access  Private/Admin
const deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        error: 'Genre not found'
      });
    }

    // Soft delete
    genre.isActive = false;
    await genre.save();

    res.json({
      success: true,
      message: 'Genre deleted successfully'
    });
  } catch (error) {
    console.error('Delete genre error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting genre'
    });
  }
};

module.exports = {
  getGenres,
  getGenre,
  createGenre,
  updateGenre,
  deleteGenre
};