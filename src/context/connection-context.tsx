import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface ConnectionContextType {
  isOnline: boolean;
  checkConnection: () => Promise<boolean>;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isOnline: true,
  checkConnection: async () => true,
});

const PING_URL = 'https://clients3.google.com/generate_204';
const PING_INTERVAL = 10000; // Check every 10 seconds

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const checkConnection = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(PING_URL, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      });
      
      clearTimeout(timeoutId);
      const online = response.ok || response.status === 204;
      setIsOnline(online);
      return online;
    } catch (e) {
      setIsOnline(false);
      return false;
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Periodic check
    const interval = setInterval(checkConnection, PING_INTERVAL);

    // Check on app state active
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkConnection();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ isOnline, checkConnection }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => useContext(ConnectionContext);
