import { useState, useCallback } from 'react';

// Custom hook to manage data refresh across components
export const useDataRefresh = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    refreshTrigger,
    triggerRefresh
  };
};

// Global event emitter for cross-component data refresh
export const dataRefreshEmitter = {
  callbacks: new Set(),
  
  subscribe: (callback) => {
    dataRefreshEmitter.callbacks.add(callback);
    return () => {
      dataRefreshEmitter.callbacks.delete(callback);
    };
  },
  
  emit: () => {
    dataRefreshEmitter.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in data refresh callback:', error);
      }
    });
  }
};
