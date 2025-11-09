const Track = require('../models/Track');
const Album = require('../models/Album');
const Artist = require('../models/Artist');
const PlayHistory = require('../models/PlayHistory');

// @desc    Get all tracks
// @route   GET /api/tracks
// @access  Public
const getTracks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    // Add search filter
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Add genre filter
    if (req.query.genre) {
      filter.genre = req.query.genre;
    }

    // Add mood filter
    if (req.query.mood) {
      filter.mood = req.query.mood;
    }

    // Add artist filter
    if (req.query.artist) {
      filter.artist = req.query.artist;
    }

    const tracks = await Track.find(filter)
      .populate('artist', 'name')
      .populate('album', 'title coverUrl')
      .populate('genre', 'name color')
      .populate('mood', 'name color icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Track.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tracks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get tracks error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving tracks'
    });
  }
};

// @desc    Get single track
// @route   GET /api/tracks/:id
// @access  Public
const getTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id)
      .populate('artist', 'name bio imageUrl')
      .populate('album', 'title coverUrl releaseDate')
      .populate('genre', 'name color')
      .populate('mood', 'name color icon');

    if (!track || !track.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }

    res.json({
      success: true,
      data: { track }
    });
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving track'
    });
  }
};

// @desc    Create track
// @route   POST /api/tracks
// @access  Private/Admin
const createTrack = async (req, res) => {
  try {
    const { title, artist, album, genre, mood, duration, fileUrl, coverUrl, lyrics } = req.body;

    // Verify artist exists
    const artistExists = await Artist.findById(artist);
    if (!artistExists) {
      return res.status(400).json({
        success: false,
        error: 'Artist not found'
      });
    }

    // Verify album exists
    const albumExists = await Album.findById(album);
    if (!albumExists) {
      return res.status(400).json({
        success: false,
        error: 'Album not found'
      });
    }

    const track = await Track.create({
      title,
      artist,
      album,
      genre,
      mood,
      duration,
      fileUrl,
      coverUrl,
      lyrics
    });

    // Add track to album's tracks array
    await Album.findByIdAndUpdate(album, { $push: { tracks: track._id } });

    // Add track to artist's tracks array
    await Artist.findByIdAndUpdate(artist, { $push: { tracks: track._id } });

    const populatedTrack = await Track.findById(track._id)
      .populate('artist', 'name')
      .populate('album', 'title')
      .populate('genre', 'name')
      .populate('mood', 'name');

    res.status(201).json({
      success: true,
      data: { track: populatedTrack }
    });
  } catch (error) {
    console.error('Create track error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating track'
    });
  }
};

// @desc    Update track
// @route   PUT /api/tracks/:id
// @access  Private/Admin
const updateTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);

    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }

    const { title, genre, mood, duration, fileUrl, coverUrl, lyrics } = req.body;

    track.title = title || track.title;
    track.genre = genre || track.genre;
    track.mood = mood || track.mood;
    track.duration = duration || track.duration;
    track.fileUrl = fileUrl || track.fileUrl;
    track.coverUrl = coverUrl || track.coverUrl;
    track.lyrics = lyrics || track.lyrics;

    await track.save();

    const updatedTrack = await Track.findById(track._id)
      .populate('artist', 'name')
      .populate('album', 'title')
      .populate('genre', 'name')
      .populate('mood', 'name');

    res.json({
      success: true,
      data: { track: updatedTrack }
    });
  } catch (error) {
    console.error('Update track error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating track'
    });
  }
};

// @desc    Delete track
// @route   DELETE /api/tracks/:id
// @access  Private/Admin
const deleteTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);

    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }

    // Soft delete
    track.isActive = false;
    await track.save();

    // Remove from album's tracks array
    await Album.findByIdAndUpdate(track.album, { $pull: { tracks: track._id } });

    // Remove from artist's tracks array
    await Artist.findByIdAndUpdate(track.artist, { $pull: { tracks: track._id } });

    res.json({
      success: true,
      message: 'Track deleted successfully'
    });
  } catch (error) {
    console.error('Delete track error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting track'
    });
  }
};

// @desc    Record play history
// @route   POST /api/tracks/:id/play
// @access  Private
const recordPlay = async (req, res) => {
  try {
    const { duration, completed } = req.body;

    const playHistory = await PlayHistory.create({
      user: req.user._id,
      track: req.params.id,
      duration,
      completed
    });

    // Increment track play count
    await Track.findByIdAndUpdate(req.params.id, { $inc: { playCount: 1 } });

    res.status(201).json({
      success: true,
      data: { playHistory }
    });
  } catch (error) {
    console.error('Record play error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error recording play'
    });
  }
};

// @desc    Search tracks
// @route   GET /api/tracks/search
// @access  Public
const searchTracks = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const tracks = await Track.find({
      isActive: true,
      $or: [
        { title: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('artist', 'name')
      .populate('album', 'title')
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { tracks }
    });
  } catch (error) {
    console.error('Search tracks error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error searching tracks'
    });
  }
};

module.exports = {
  getTracks,
  getTrack,
  createTrack,
  updateTrack,
  deleteTrack,
  recordPlay,
  searchTracks
};