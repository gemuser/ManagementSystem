import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import { AlertTriangle, Clock } from 'lucide-react';

const SessionTimeoutWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSessionTimeout = () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        // Decode JWT to get expiration time
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeRemaining = expTime - currentTime;

        // Show warning 5 minutes before expiration
        const warningThreshold = 5 * 60 * 1000; // 5 minutes

        if (timeRemaining <= warningThreshold && timeRemaining > 0) {
          setTimeLeft(Math.ceil(timeRemaining / 1000 / 60)); // Convert to minutes
          setShowWarning(true);
        } else if (timeRemaining <= 0) {
          // Token expired
          logout();
          setShowWarning(false);
        } else {
          setShowWarning(false);
        }
      } catch (error) {
        console.error('Error checking session timeout:', error);
      }
    };

    // Check immediately
    checkSessionTimeout();

    // Check every 30 seconds
    const interval = setInterval(checkSessionTimeout, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  const handleExtendSession = async () => {
    try {
      // Call the refresh token endpoint
      const response = await axios.post('/auth/refresh');
      
      if (response.data.success) {
        // Update the token in localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        
        // Update axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        setShowWarning(false);
        console.log('Session extended successfully');
      }
    } catch (error) {
      console.error('Error extending session:', error);
      // If refresh fails, logout
      logout();
    }
  };

  const handleLogoutNow = () => {
    logout();
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800">
              Session Expiring Soon
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Your session will expire in {timeLeft} minute{timeLeft !== 1 ? 's' : ''}. 
              Would you like to extend your session?
            </p>
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={handleExtendSession}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 border border-amber-300 rounded hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <Clock className="h-3 w-3 mr-1" />
                Extend Session
              </button>
              <button
                onClick={handleLogoutNow}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
