const Favorite = require('../models/Favorite');
const Track = require('../models/Track');

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'track',
        select: 'title artist album duration coverUrl playCount',
        populate: [
          { path: 'artist', select: 'name' },
          { path: 'album', select: 'title coverUrl' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Favorite.countDocuments({ user: req.user._id });

    // Filter out any favorites where track might be null (soft deleted)
    const validFavorites = favorites.filter(fav => fav.track);

    res.json({
      success: true,
      data: {
        favorites: validFavorites,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving favorites'
    });
  }
};

// @desc    Add track to favorites
// @route   POST /api/favorites
// @access  Private
const addFavorite = async (req, res) => {
  try {
    const { trackId } = req.body;

    // Check if track exists and is active
    const track = await Track.findById(trackId);
    if (!track || !track.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      track: trackId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: 'Track already in favorites'
      });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      track: trackId
    });

    const populatedFavorite = await Favorite.findById(favorite._id)
      .populate({
        path: 'track',
        select: 'title artist album duration coverUrl',
        populate: [
          { path: 'artist', select: 'name' },
          { path: 'album', select: 'title' }
        ]
      });

    res.status(201).json({
      success: true,
      data: { favorite: populatedFavorite }
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding favorite'
    });
  }
};

// @desc    Remove track from favorites
// @route   DELETE /api/favorites/:trackId
// @access  Private
const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      track: req.params.trackId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Track removed from favorites successfully'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error removing favorite'
    });
  }
};

// @desc    Check if track is favorited
// @route   GET /api/favorites/check/:trackId
// @access  Private
const checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user._id,
      track: req.params.trackId
    });

    res.json({
      success: true,
      data: {
        isFavorited: !!favorite
      }
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error checking favorite status'
    });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
};