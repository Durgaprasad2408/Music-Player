const Playlist = require('../models/Playlist');
const Track = require('../models/Track');

// @desc    Get all playlists
// @route   GET /api/playlists
// @access  Public/Private
const getPlaylists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let filter = {};

    // If user is authenticated, show their playlists + public playlists
    if (req.user) {
      filter = {
        $or: [
          { user: req.user._id },
          { isPublic: true }
        ]
      };
    } else {
      // If not authenticated, only show public playlists
      filter = { isPublic: true };
    }

    // Add search filter
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // Add featured filter
    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    const playlists = await Playlist.find(filter)
      .populate('user', 'name')
      .populate({
        path: 'tracks',
        select: 'title artist album duration',
        populate: [
          { path: 'artist', select: 'name' },
          { path: 'album', select: 'title' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Playlist.countDocuments(filter);

    res.json({
      success: true,
      data: {
        playlists,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving playlists'
    });
  }
};

// @desc    Get single playlist
// @route   GET /api/playlists/:id
// @access  Public/Private
const getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('user', 'name')
      .populate({
        path: 'tracks',
        select: 'title artist album duration coverUrl',
        populate: [
          { path: 'artist', select: 'name' },
          { path: 'album', select: 'title coverUrl' }
        ]
      });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Check if user can access this playlist
    if (!playlist.isPublic && (!req.user || req.user._id.toString() !== playlist.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { playlist }
    });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving playlist'
    });
  }
};

// @desc    Create playlist
// @route   POST /api/playlists
// @access  Private
const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, coverUrl, tracks } = req.body;

    const playlist = await Playlist.create({
      name,
      description,
      user: req.user._id,
      isPublic: isPublic !== undefined ? isPublic : false,
      coverUrl,
      tracks: tracks || []
    });

    const populatedPlaylist = await Playlist.findById(playlist._id)
      .populate('user', 'name')
      .populate({
        path: 'tracks',
        select: 'title artist album duration',
        populate: [
          { path: 'artist', select: 'name' },
          { path: 'album', select: 'title' }
        ]
      });

    res.status(201).json({
      success: true,
      data: { playlist: populatedPlaylist }
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating playlist'
    });
  }
};

// @desc    Update playlist
// @route   PUT /api/playlists/:id
// @access  Private
const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this playlist'
      });
    }

    const { name, description, isPublic, coverUrl } = req.body;

    playlist.name = name || playlist.name;
    playlist.description = description || playlist.description;
    playlist.isPublic = isPublic !== undefined ? isPublic : playlist.isPublic;
    playlist.coverUrl = coverUrl || playlist.coverUrl;

    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlist._id)
      .populate('user', 'name')
      .populate({
        path: 'tracks',
        select: 'title artist album duration',
        populate: [
          { path: 'artist', select: 'name' },
          { path: 'album', select: 'title' }
        ]
      });

    res.json({
      success: true,
      data: { playlist: updatedPlaylist }
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating playlist'
    });
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private
const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this playlist'
      });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting playlist'
    });
  }
};

// @desc    Add track to playlist
// @route   POST /api/playlists/:id/tracks
// @access  Private
const addTrackToPlaylist = async (req, res) => {
  try {
    const { trackId } = req.body;

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this playlist'
      });
    }

    // Check if track exists
    const track = await Track.findById(trackId);
    if (!track || !track.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }

    // Check if track is already in playlist
    if (playlist.tracks.includes(trackId)) {
      return res.status(400).json({
        success: false,
        error: 'Track already in playlist'
      });
    }

    playlist.tracks.push(trackId);
    await playlist.save();

    res.json({
      success: true,
      message: 'Track added to playlist successfully'
    });
  } catch (error) {
    console.error('Add track to playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding track to playlist'
    });
  }
};

// @desc    Remove track from playlist
// @route   DELETE /api/playlists/:id/tracks/:trackId
// @access  Private
const removeTrackFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this playlist'
      });
    }

    playlist.tracks = playlist.tracks.filter(
      trackId => trackId.toString() !== req.params.trackId
    );

    await playlist.save();

    res.json({
      success: true,
      message: 'Track removed from playlist successfully'
    });
  } catch (error) {
    console.error('Remove track from playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error removing track from playlist'
    });
  }
};

// @desc    Get user's playlists
// @route   GET /api/playlists/user/:userId
// @access  Public/Private
const getUserPlaylists = async (req, res) => {
  try {
    const filter = { user: req.params.userId };

    // If not the owner, only show public playlists
    if (!req.user || req.user._id.toString() !== req.params.userId) {
      filter.isPublic = true;
    }

    const playlists = await Playlist.find(filter)
      .populate('user', 'name')
      .populate({
        path: 'tracks',
        select: 'title artist album duration',
        populate: [
          { path: 'artist', select: 'name' },
          { path: 'album', select: 'title' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { playlists }
    });
  } catch (error) {
    console.error('Get user playlists error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving user playlists'
    });
  }
};

module.exports = {
  getPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  getUserPlaylists
};