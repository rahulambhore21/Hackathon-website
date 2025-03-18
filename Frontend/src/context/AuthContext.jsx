import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is already logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate a successful login
      if (email && password) {
        // Mock successful login
        const userData = {
          id: 1,
          name: 'Test User',
          email: email,
          role: 'user'
        };
        
        // Store token and user data
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(userData));
        
        setCurrentUser(userData);
        return true;
      } else {
        throw new Error('Please provide email and password');
      }
    } catch (err) {
      setError(err.message || 'Failed to log in');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setLoading(true);
    setError('');
    
    try {
      // In a real app, this would be an API call
      if (name && email && password) {
        // Mock successful registration
        const userData = {
          id: Date.now(), // Generate a random id
          name: name,
          email: email,
          role: 'user'
        };
        
        // Store token and user data
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(userData));
        
        setCurrentUser(userData);
        return true;
      } else {
        throw new Error('Please fill in all required fields');
      }
    } catch (err) {
      setError(err.message || 'Failed to register');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Get current user role
  const getUserRole = () => {
    return currentUser?.role || 'guest';
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
