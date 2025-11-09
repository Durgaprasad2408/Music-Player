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

  // Function to fetch the currently authenticated user's data
  const fetchCurrentUser = async () => {
    try {
      // Assuming the backend has an endpoint to get the current user's data based on the cookie
      const response = await apiClient.get('/auth/me'); 
      const userData = response.data.user; // Assuming response structure { user: {...} }
      
      if (!userData) throw new Error('User data missing from /auth/me response');

      setUser(userData);
      setIsAdmin(userData.email === 'hari.2408dt@gmail.com');
      
      // Fetch full profile data using the ID from the /auth/me response
      const profileResponse = await apiClient.get(`/auth/profile/${userData.id}`);
      setProfile(profileResponse.data);
      
      return userData;
    } catch (error) {
      // 401 or other error means no active session
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      return null;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      await fetchCurrentUser();
      setIsLoading(false);
    };
    
    checkAuthStatus();
  }, []); // Run only once on mount

  const signIn = async (email, password) => {
    try {
      // Backend sets HTTP-only cookie upon successful login
      await apiClient.post('/auth/login', { email, password });
      
      // Fetch user data immediately after successful login
      const userData = await fetchCurrentUser();

      if (!userData) {
        throw new Error('Login successful but user data could not be retrieved.');
      }

      return { error: null };
    } catch (error) {
      return { error: error.response?.data?.message || error.message };
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      // Backend sets HTTP-only cookie upon successful registration
      await apiClient.post('/auth/register', {
        email,
        password,
        name: displayName
      });

      // Fetch user data immediately after successful registration
      const userData = await fetchCurrentUser();

      if (!userData) {
        throw new Error('Registration successful but user data could not be retrieved.');
      }

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

      // Call logout endpoint to clear cookie on server
      await apiClient.post('/auth/logout');
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