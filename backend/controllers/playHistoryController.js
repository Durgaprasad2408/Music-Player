const PlayHistory = require('../models/PlayHistory');
const Track = require('../models/Track');

// @desc    Get user's play history
// @route   GET /api/play-history
// @access  Private
const getPlayHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const playHistory = await PlayHistory.find({ user: req.user._id })
      .populate({
        path: 'track',
        select: 'title artist album duration coverUrl playCount',
        populate: [
          { path: 'artist', select: 'name' },
          { path: 'album', select: 'title coverUrl' }
        ]
      })
      .sort({ playedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PlayHistory.countDocuments({ user: req.user._id });

    // Filter out any history where track might be null (soft deleted)
    const validHistory = playHistory.filter(history => history.track);

    res.json({
      success: true,
      data: {
        playHistory: validHistory,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get play history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving play history'
    });
  }
};

// @desc    Get recently played tracks
// @route   GET /api/play-history/recent
// @access  Private
const getRecentTracks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get distinct tracks ordered by most recent play
    const recentTracks = await PlayHistory.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$track',
          playedAt: { $max: '$playedAt' },
          playCount: { $sum: 1 }
        }
      },
      { $sort: { playedAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'tracks',
          localField: '_id',
          foreignField: '_id',
          as: 'track'
        }
      },
      { $unwind: '$track' },
      {
        $match: { 'track.isActive': true }
      },
      {
        $lookup: {
          from: 'artists',
          localField: 'track.artist',
          foreignField: '_id',
          as: 'track.artist'
        }
      },
      {
        $lookup: {
          from: 'albums',
          localField: 'track.album',
          foreignField: '_id',
          as: 'track.album'
        }
      },
      {
        $project: {
          'track.artist': { $arrayElemAt: ['$track.artist', 0] },
          'track.album': { $arrayElemAt: ['$track.album', 0] },
          playedAt: 1,
          playCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: { recentTracks }
    });
  } catch (error) {
    console.error('Get recent tracks error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving recent tracks'
    });
  }
};

// @desc    Clear play history
// @route   DELETE /api/play-history
// @access  Private
const clearPlayHistory = async (req, res) => {
  try {
    await PlayHistory.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: 'Play history cleared successfully'
    });
  } catch (error) {
    console.error('Clear play history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error clearing play history'
    });
  }
};

// @desc    Remove single play history entry
// @route   DELETE /api/play-history/:id
// @access  Private
const removePlayHistoryEntry = async (req, res) => {
  try {
    const historyEntry = await PlayHistory.findById(req.params.id);

    if (!historyEntry) {
      return res.status(404).json({
        success: false,
        error: 'Play history entry not found'
      });
    }

    // Check ownership
    if (historyEntry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this entry'
      });
    }

    await PlayHistory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Play history entry removed successfully'
    });
  } catch (error) {
    console.error('Remove play history entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error removing play history entry'
    });
  }
};

// @desc    Get user's listening stats
// @route   GET /api/play-history/stats
// @access  Private
const getListeningStats = async (req, res) => {
  try {
    const stats = await PlayHistory.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalPlays: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          uniqueTracks: { $addToSet: '$track' }
        }
      },
      {
        $project: {
          totalPlays: 1,
          totalDuration: 1,
          uniqueTracksCount: { $size: '$uniqueTracks' }
        }
      }
    ]);

    const result = stats[0] || {
      totalPlays: 0,
      totalDuration: 0,
      uniqueTracksCount: 0
    };

    res.json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    console.error('Get listening stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving listening stats'
    });
  }
};

module.exports = {
  getPlayHistory,
  getRecentTracks,
  clearPlayHistory,
  removePlayHistoryEntry,
  getListeningStats
};