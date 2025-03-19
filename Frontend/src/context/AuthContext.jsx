import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext); // Ensure this hook is correctly defined
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_URL = 'http://localhost:5000/api';
  
  // Memoize value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    currentUser,
    loading,
    error,
    login: async (email, password) => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setCurrentUser(user);
        return true;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to log in');
        return false;
      } finally {
        setLoading(false);
      }
    },
    register: async (userData) => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setCurrentUser(user);
        return true;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to register');
        return false;
      } finally {
        setLoading(false);
      }
    },
    logout: () => {
      localStorage.removeItem('token');
      setCurrentUser(null);
    },
    isAuthenticated: () => !!currentUser,
    getUserRole: () => currentUser?.role || 'guest',
  }), [currentUser, loading, error, API_URL]);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setCurrentUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [API_URL]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
