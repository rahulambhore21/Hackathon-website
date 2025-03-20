import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Function to get user data from token
  const loadUserFromToken = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      setAuthInitialized(true);
      return;
    }
    
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Ensure we're setting the correct user structure with id property
      const userData = response.data;
      setCurrentUser({
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        // Include other user properties as needed
        ...userData
      });
    } catch (err) {
      console.error('Error loading user:', err);
      // Don't remove token on network errors, only on auth failures
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
      }
      setCurrentUser(null);
    } finally {
      setLoading(false);
      setAuthInitialized(true);
    }
  };

  // Load user data on initial render
  useEffect(() => {
    loadUserFromToken();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { 
        email, 
        password 
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setAuthInitialized(true);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setAuthInitialized(true);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    // Make sure authInitialized remains true after logout
    setAuthInitialized(true);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser && !!localStorage.getItem('token');
  };

  const value = {
    currentUser,
    loading,
    error,
    authInitialized,
    login,
    register,
    logout,
    isAuthenticated,
    loadUserFromToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
