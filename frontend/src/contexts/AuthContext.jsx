import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to decode JWT and check if it's expired
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // Consider invalid tokens as expired
    }
  };

  // Function to check token validity with backend
  const checkTokenValidity = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        logout();
        return false;
      }

      // Check if token is expired locally first
      if (isTokenExpired(token)) {
        console.log('Token expired locally');
        logout();
        return false;
      }

      // Verify with backend
      const response = await axios.get('/auth/verify');
      if (response.data.success) {
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
      return false;
    }
  };

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';

    if (token && userInfo) {
      try {
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.log('Token expired on app start');
          logout();
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Set axios default header for authenticated requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token with backend
        checkTokenValidity();
      } catch (error) {
        console.error('Error parsing user info:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  // Set up periodic token validation
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check token validity every 5 minutes
    const interval = setInterval(() => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token && isTokenExpired(token)) {
        console.log('Token expired during session');
        logout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = (userData, token, rememberMe = false) => {
    // Store token based on rememberMe preference
    if (rememberMe) {
      // Store in localStorage for persistent login
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      localStorage.setItem('loginTime', Date.now().toString());
      localStorage.setItem('rememberMe', 'true');
      // Clear sessionStorage to avoid conflicts
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userInfo');
    } else {
      // Store in sessionStorage for session-only login
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userInfo', JSON.stringify(userData));
      sessionStorage.setItem('loginTime', Date.now().toString());
      // Clear localStorage to avoid conflicts
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('rememberMe');
    }
    
    setUser(userData);
    setIsAuthenticated(true);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('loginTime');
    
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
