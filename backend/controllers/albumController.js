const Album = require('../models/Album');
const Artist = require('../models/Artist');
const Track = require('../models/Track');

// @desc    Get all albums
// @route   GET /api/albums
// @access  Public
const getAlbums = async (req, res) => {
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

    // Add artist filter
    if (req.query.artist) {
      filter.artist = req.query.artist;
    }

    // Add genre filter
    if (req.query.genre) {
      filter.genre = req.query.genre;
    }

    const albums = await Album.find(filter)
      .populate('artist', 'name imageUrl')
      .populate('genre', 'name color')
      .populate({
        path: 'tracks',
        select: 'title duration',
        populate: { path: 'artist', select: 'name' }
      })
      .sort({ releaseDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Album.countDocuments(filter);

    res.json({
      success: true,
      data: {
        albums,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving albums'
    });
  }
};

// @desc    Get single album
// @route   GET /api/albums/:id
// @access  Public
const getAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('artist', 'name bio imageUrl followers')
      .populate('genre', 'name color')
      .populate({
        path: 'tracks',
        select: 'title duration fileUrl coverUrl lyrics playCount',
        populate: { path: 'artist', select: 'name' }
      });

    if (!album || !album.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Album not found'
      });
    }

    res.json({
      success: true,
      data: { album }
    });
  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving album'
    });
  }
};

// @desc    Create album
// @route   POST /api/albums
// @access  Private/Admin
const createAlbum = async (req, res) => {
  try {
    const { title, artist, genre, releaseDate, coverUrl, description } = req.body;

    // Verify artist exists
    const artistExists = await Artist.findById(artist);
    if (!artistExists) {
      return res.status(400).json({
        success: false,
        error: 'Artist not found'
      });
    }

    const album = await Album.create({
      title,
      artist,
      genre,
      releaseDate,
      coverUrl,
      description
    });

    // Add album to artist's albums array
    await Artist.findByIdAndUpdate(artist, { $push: { albums: album._id } });

    const populatedAlbum = await Album.findById(album._id)
      .populate('artist', 'name')
      .populate('genre', 'name');

    res.status(201).json({
      success: true,
      data: { album: populatedAlbum }
    });
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating album'
    });
  }
};

// @desc    Update album
// @route   PUT /api/albums/:id
// @access  Private/Admin
const updateAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album not found'
      });
    }

    const { title, genre, releaseDate, coverUrl, description } = req.body;

    album.title = title || album.title;
    album.genre = genre || album.genre;
    album.releaseDate = releaseDate || album.releaseDate;
    album.coverUrl = coverUrl || album.coverUrl;
    album.description = description || album.description;

    await album.save();

    const updatedAlbum = await Album.findById(album._id)
      .populate('artist', 'name')
      .populate('genre', 'name');

    res.json({
      success: true,
      data: { album: updatedAlbum }
    });
  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating album'
    });
  }
};

// @desc    Delete album
// @route   DELETE /api/albums/:id
// @access  Private/Admin
const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album not found'
      });
    }

    // Soft delete
    album.isActive = false;
    await album.save();

    // Remove from artist's albums array
    await Artist.findByIdAndUpdate(album.artist, { $pull: { albums: album._id } });

    // Remove album reference from tracks
    await Track.updateMany({ album: album._id }, { $unset: { album: 1 } });

    res.json({
      success: true,
      message: 'Album deleted successfully'
    });
  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting album'
    });
  }
};

// @desc    Get albums by artist
// @route   GET /api/albums/artist/:artistId
// @access  Public
const getAlbumsByArtist = async (req, res) => {
  try {
    const albums = await Album.find({
      artist: req.params.artistId,
      isActive: true
    })
      .populate('genre', 'name color')
      .populate({
        path: 'tracks',
        select: 'title duration',
        populate: { path: 'artist', select: 'name' }
      })
      .sort({ releaseDate: -1 });

    res.json({
      success: true,
      data: { albums }
    });
  } catch (error) {
    console.error('Get albums by artist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving albums by artist'
    });
  }
};

module.exports = {
  getAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getAlbumsByArtist
};