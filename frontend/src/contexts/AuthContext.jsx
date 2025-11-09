import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for stored token and user data
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAdmin(userData.email === 'hari.2408dt@gmail.com');
      fetchProfile(userData.id);
    }

    setIsLoading(false);
    setIsInitialized(true);

    // Handle visibility change to prevent unnecessary re-loading
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isInitialized) {
        // Check if token is still valid
        const currentToken = localStorage.getItem('token');
        const currentUser = localStorage.getItem('user');

        if (currentToken && currentUser) {
          const userData = JSON.parse(currentUser);
          if (userData?.id !== user?.id) {
            setUser(userData);
            setIsAdmin(userData.email === 'hari.2408dt@gmail.com');
            fetchProfile(userData.id);
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInitialized, user]);

  const fetchProfile = async (userId) => {
    try {
      const response = await apiClient.get(`/auth/profile/${userId}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAdmin(userData.email === 'hari.2408dt@gmail.com');
      fetchProfile(userData.id);

      return { error: null };
    } catch (error) {
      return { error: error.response?.data?.message || error.message };
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        name: displayName
      });

      const { accessToken, user: userData } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAdmin(userData.email === 'hari.2408dt@gmail.com');
      fetchProfile(userData.id);

      return { error: null };
    } catch (error) {
      return { error: error.response?.data?.error || error.message };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state first to ensure consistent UI
      setUser(null);
      setProfile(null);

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Optional: Call logout endpoint to invalidate token on server
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Ignore logout endpoint errors
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      // Always navigate to home page after sign out attempt
      navigate('/');
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('User not authenticated'), data: null };

    try {
      const response = await apiClient.put('/auth/profile', updates);
      const updatedProfile = response.data;

      setProfile(updatedProfile);
      return { error: null, data: updatedProfile };
    } catch (error) {
      return { error: error.response?.data?.message || error.message, data: null };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      await apiClient.put('/auth/password', { password: newPassword });
      return { error: null };
    } catch (error) {
      return { error: error.response?.data?.message || error.message };
    }
  };

  const updateEmail = async (newEmail) => {
    try {
      await apiClient.put('/auth/email', { email: newEmail });
      return { error: null };
    } catch (error) {
      return { error: error.response?.data?.message || error.message };
    }
  };

  const value = {
    user,
    profile,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePassword,
    updateEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};