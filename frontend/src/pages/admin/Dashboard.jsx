import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Music, List, Upload, Disc, Plus, Tag, Smile, User } from 'lucide-react';
import apiClient from '../../lib/apiClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    tracks: 0,
    albums: 0,
    genres: 0,
    moods: 0,
    playlists: 0,
    artists: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/stats');
      const statsData = response.data;

      setStats({
        users: statsData.users || 0,
        tracks: statsData.tracks || 0,
        albums: statsData.albums || 0,
        genres: statsData.genres || 0,
        moods: statsData.moods || 0,
        playlists: statsData.playlists || 0,
        artists: statsData.artists || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: <Users className="text-primary-400" size={24} />,
      link: '/admin/users',
    },
    {
      title: 'Music Tracks',
      value: stats.tracks,
      icon: <Music className="text-secondary-400" size={24} />,
      link: '/admin/tracks',
    },
    {
      title: 'Albums',
      value: stats.albums,
      icon: <Disc className="text-accent-400" size={24} />,
      link: '/admin/albums',
    },
    {
      title: 'Artists',
      value: stats.artists,
      icon: <User className="text-warning-400" size={24} />,
      link: '/admin/artists',
    },
    {
      title: 'Genres',
      value: stats.genres,
      icon: <Tag className="text-success-400" size={24} />,
      link: '/admin/genres',
    },
    {
      title: 'Moods',
      value: stats.moods,
      icon: <Smile className="text-warning-400" size={24} />,
      link: '/admin/moods',
    },
    {
      title: 'Featured Playlists',
      value: stats.playlists,
      icon: <List className="text-primary-400" size={24} />,
      link: '/admin/featured-playlists',
    }
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link 
            key={index} 
            to={stat.link}
            className="card hover:bg-background-light/80 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-background-dark mr-4">
                {stat.icon}
              </div>
              <div>
                <h3 className="text-sm text-neutral-400 font-medium">{stat.title}</h3>
                <p className="text-2xl font-bold">
                  {loading ? (
                    <span className="inline-block w-12 h-8 bg-neutral-800 animate-pulse rounded"></span>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Quick Actions */}
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <Link 
          to="/admin/tracks/upload" 
          className="card hover:bg-background-light/80 transition-colors p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-900/30 mr-4">
              <Upload className="text-primary-400" size={24} />
            </div>
            <div>
              <h3 className="font-medium">Upload New Track</h3>
              <p className="text-sm text-neutral-400">Add music to your library</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/admin/albums/create" 
          className="card hover:bg-background-light/80 transition-colors p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-900/30 mr-4">
              <Disc className="text-secondary-400" size={24} />
            </div>
            <div>
              <h3 className="font-medium">Create New Album</h3>
              <p className="text-sm text-neutral-400">Add a new album</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/featured-playlists/create" 
          className="card hover:bg-background-light/80 transition-colors p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-accent-900/30 mr-4">
              <List className="text-accent-400" size={24} />
            </div>
            <div>
              <h3 className="font-medium">Create Featured Playlist</h3>
              <p className="text-sm text-neutral-400">Add a new featured playlist</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/genres" 
          className="card hover:bg-background-light/80 transition-colors p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-900/30 mr-4">
              <Tag className="text-success-400" size={24} />
            </div>
            <div>
              <h3 className="font-medium">Manage Genres</h3>
              <p className="text-sm text-neutral-400">Create and edit music genres</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/moods" 
          className="card hover:bg-background-light/80 transition-colors p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warning-900/30 mr-4">
              <Smile className="text-warning-400" size={24} />
            </div>
            <div>
              <h3 className="font-medium">Manage Moods</h3>
              <p className="text-sm text-neutral-400">Create and edit music moods</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/artists" 
          className="card hover:bg-background-light/80 transition-colors p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warning-900/30 mr-4">
              <User className="text-warning-400" size={24} />
            </div>
            <div>
              <h3 className="font-medium">Manage Artists</h3>
              <p className="text-sm text-neutral-400">Create and edit artists</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;