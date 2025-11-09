import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Library from './pages/Library';
import Playlist from './pages/Playlist';
import EditPlaylist from './pages/EditPlaylist';
import AddTracks from './pages/AddTracks';
import Search from './pages/Search';
import Genre from './pages/Genre';
import Albums from './pages/Albums';
import Album from './pages/Album';
import Artists from './pages/Artists';
import Artist from './pages/Artist';
import Mood from './pages/Mood';
import RecentlyPlayed from './pages/RecentlyPlayed';
import FeaturedPlaylists from './pages/FeaturedPlaylists';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminTracks from './pages/admin/Tracks';
import AdminAlbums from './pages/admin/Albums';
import AdminAlbum from './pages/admin/Album';
import AdminArtists from './pages/admin/Artists';
import ArtistDetails from './pages/admin/ArtistDetails';
import EditAlbum from './pages/admin/EditAlbum';
import CreateAlbum from './pages/admin/CreateAlbum';
import UploadTrack from './pages/admin/UploadTrack';
import EditTrack from './pages/admin/EditTrack';
import CreateFeaturedPlaylist from './pages/admin/CreateFeaturedPlaylist';
import AdminFeaturedPlaylists from './pages/admin/FeaturedPlaylists';
import AdminGenres from './pages/admin/Genres';
import AdminMoods from './pages/admin/Moods';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import CreatePlaylist from './pages/CreatePlaylist';

function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simple app ready check - no backend connection needed for frontend
    setIsAppReady(true);
  }, []);

  if (!isAppReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="animate-pulse text-primary-400">
          <p className="text-xl font-medium">Loading Harmony...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Main app routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
              <Route path="/playlist/create" element={<ProtectedRoute><CreatePlaylist /></ProtectedRoute>} />
              <Route path="/playlist/:id" element={<Playlist />} />
              <Route path="/playlist/:id/edit" element={<ProtectedRoute><EditPlaylist /></ProtectedRoute>} />
              <Route path="/playlist/:id/add-tracks" element={<ProtectedRoute><AddTracks /></ProtectedRoute>} />
              <Route path="/search" element={<Search />} />
              <Route path="/genre/:genre" element={<Genre />} />
              <Route path="/mood/:mood" element={<Mood />} />
              <Route path="/albums" element={<Albums />} />
              <Route path="/album/:id" element={<Album />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/artist/:id" element={<Artist />} />
              <Route path="/recently-played" element={<RecentlyPlayed />} />
              <Route path="/featured-playlists" element={<FeaturedPlaylists />} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/tracks" element={<AdminRoute><AdminTracks /></AdminRoute>} />
              <Route path="/admin/tracks/upload" element={<AdminRoute><UploadTrack /></AdminRoute>} />
              <Route path="/admin/tracks/:id/edit" element={<AdminRoute><EditTrack /></AdminRoute>} />
              <Route path="/admin/albums" element={<AdminRoute><AdminAlbums /></AdminRoute>} />
              <Route path="/admin/albums/:id" element={<AdminRoute><AdminAlbum /></AdminRoute>} />
              <Route path="/admin/albums/:id/edit" element={<AdminRoute><EditAlbum /></AdminRoute>} />
              <Route path="/admin/albums/create" element={<AdminRoute><CreateAlbum /></AdminRoute>} />
              <Route path="/admin/artists" element={<AdminRoute><AdminArtists /></AdminRoute>} />
              <Route path="/admin/artists/:id" element={<AdminRoute><ArtistDetails /></AdminRoute>} />
              <Route path="/admin/featured-playlists" element={<AdminRoute><AdminFeaturedPlaylists /></AdminRoute>} />
              <Route path="/admin/featured-playlists/create" element={<AdminRoute><CreateFeaturedPlaylist /></AdminRoute>} />
              <Route path="/admin/genres" element={<AdminRoute><AdminGenres /></AdminRoute>} />
              <Route path="/admin/moods" element={<AdminRoute><AdminMoods /></AdminRoute>} />
            </Route>

            {/* 404 and fallbacks */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404\" replace />} />
          </Routes>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;