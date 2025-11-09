const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Track = require('../models/Track');

// @desc    Get all artists
// @route   GET /api/artists
// @access  Public
const getArtists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    // Add search filter
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Add genre filter
    if (req.query.genre) {
      filter.genres = req.query.genre;
    }

    // Add verified filter
    if (req.query.verified === 'true') {
      filter.isVerified = true;
    }

    const artists = await Artist.find(filter)
      .populate('genres', 'name color')
      .populate('albums', 'title coverUrl releaseDate')
      .sort({ monthlyListeners: -1, name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Artist.countDocuments(filter);

    res.json({
      success: true,
      data: {
        artists,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get artists error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving artists'
    });
  }
};

// @desc    Get single artist
// @route   GET /api/artists/:id
// @access  Public
const getArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id)
      .populate('genres', 'name color')
      .populate('albums', 'title coverUrl releaseDate description')
      .populate({
        path: 'tracks',
        select: 'title album duration playCount',
        populate: { path: 'album', select: 'title' }
      })
      .populate('followers', 'name');

    if (!artist || !artist.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Artist not found'
      });
    }

    res.json({
      success: true,
      data: { artist }
    });
  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving artist'
    });
  }
};

// @desc    Create artist
// @route   POST /api/artists
// @access  Private/Admin
const createArtist = async (req, res) => {
  try {
    const { name, bio, imageUrl, genres } = req.body;

    const artist = await Artist.create({
      name,
      bio,
      imageUrl,
      genres
    });

    const populatedArtist = await Artist.findById(artist._id)
      .populate('genres', 'name');

    res.status(201).json({
      success: true,
      data: { artist: populatedArtist }
    });
  } catch (error) {
    console.error('Create artist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating artist'
    });
  }
};

// @desc    Update artist
// @route   PUT /api/artists/:id
// @access  Private/Admin
const updateArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      return res.status(404).json({
        success: false,
        error: 'Artist not found'
      });
    }

    const { name, bio, imageUrl, genres, isVerified } = req.body;

    artist.name = name || artist.name;
    artist.bio = bio || artist.bio;
    artist.imageUrl = imageUrl || artist.imageUrl;
    artist.genres = genres || artist.genres;
    if (isVerified !== undefined) artist.isVerified = isVerified;

    await artist.save();

    const updatedArtist = await Artist.findById(artist._id)
      .populate('genres', 'name');

    res.json({
      success: true,
      data: { artist: updatedArtist }
    });
  } catch (error) {
    console.error('Update artist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating artist'
    });
  }
};

// @desc    Delete artist
// @route   DELETE /api/artists/:id
// @access  Private/Admin
const deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      return res.status(404).json({
        success: false,
        error: 'Artist not found'
      });
    }

    // Soft delete
    artist.isActive = false;
    await artist.save();

    // Remove artist reference from tracks
    await Track.updateMany({ artist: artist._id }, { $unset: { artist: 1 } });

    // Remove artist reference from albums
    await Album.updateMany({ artist: artist._id }, { $unset: { artist: 1 } });

    res.json({
      success: true,
      message: 'Artist deleted successfully'
    });
  } catch (error) {
    console.error('Delete artist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting artist'
    });
  }
};

// @desc    Follow artist
// @route   POST /api/artists/:id/follow
// @access  Private
const followArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);

    if (!artist || !artist.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Artist not found'
      });
    }

    // Check if already following
    if (artist.followers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'Already following this artist'
      });
    }

    artist.followers.push(req.user._id);
    await artist.save();

    res.json({
      success: true,
      message: 'Artist followed successfully'
    });
  } catch (error) {
    console.error('Follow artist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error following artist'
    });
  }
};

// @desc    Unfollow artist
// @route   DELETE /api/artists/:id/follow
// @access  Private
const unfollowArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      return res.status(404).json({
        success: false,
        error: 'Artist not found'
      });
    }

    artist.followers = artist.followers.filter(
      followerId => followerId.toString() !== req.user._id.toString()
    );

    await artist.save();

    res.json({
      success: true,
      message: 'Artist unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow artist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error unfollowing artist'
    });
  }
};

// @desc    Get followed artists
// @route   GET /api/artists/followed
// @access  Private
const getFollowedArtists = async (req, res) => {
  try {
    const artists = await Artist.find({
      followers: req.user._id,
      isActive: true
    })
      .populate('genres', 'name color')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { artists }
    });
  } catch (error) {
    console.error('Get followed artists error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving followed artists'
    });
  }
};

module.exports = {
  getArtists,
  getArtist,
  createArtist,
  updateArtist,
  deleteArtist,
  followArtist,
  unfollowArtist,
  getFollowedArtists
};