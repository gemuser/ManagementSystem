import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus = ({ variant = 'light' }) => {
  const [isConnected, setIsConnected] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkConnection = async () => {
    try {
      const response = await axios.get('/health', { timeout: 5000 });
      setIsConnected(response.status === 200);
      setLastChecked(new Date());
    } catch {
      setIsConnected(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check connection immediately
    checkConnection();

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStyles = () => {
    if (variant === 'dark') {
      return {
        container: isConnected 
          ? 'bg-green-900/30 border border-green-500/30 text-green-400' 
          : 'bg-red-900/30 border border-red-500/30 text-red-400',
        loading: 'bg-gray-700 border border-gray-500 text-gray-300',
        icon: isConnected ? 'text-green-400' : 'text-red-400',
        time: 'opacity-60'
      };
    }
    
    return {
      container: isConnected 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800',
      loading: 'bg-gray-100 text-gray-600',
      icon: isConnected ? 'text-green-600' : 'text-red-600',
      time: 'opacity-75'
    };
  };

  const styles = getStyles();

  if (isConnected === null) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${styles.loading}`}>
        <div className="w-3 h-3 bg-current rounded-full animate-pulse opacity-50"></div>
        <span className="text-sm">Checking...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300 ${styles.container}`}>
      {isConnected ? (
        <Wifi size={16} className={styles.icon} />
      ) : (
        <WifiOff size={16} className={styles.icon} />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {lastChecked && (
          <span className={`text-xs ${styles.time}`}>
            {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
