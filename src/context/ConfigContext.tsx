import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface ConfigContextType {
  endpoint: string;
  apiToken: string;
  isConnected: boolean;
  saveToLocalStorage: boolean;
  setConfig: (endpoint: string, apiToken: string, saveToLocalStorage: boolean) => void;
  disconnect: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [endpoint, setEndpoint] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [saveToLocalStorage, setSaveToLocalStorage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedEndpoint = localStorage.getItem('graphql_endpoint');
    const savedToken = localStorage.getItem('graphql_token');
    const savedPersist = localStorage.getItem('persist_config') === 'true';
    
    if (savedEndpoint && savedToken) {
      setEndpoint(savedEndpoint);
      setApiToken(savedToken);
      setSaveToLocalStorage(savedPersist);
      setIsConnected(true);
    }
  }, []);

  const setConfig = (newEndpoint: string, newApiToken: string, persist: boolean) => {
    setEndpoint(newEndpoint);
    setApiToken(newApiToken);
    setSaveToLocalStorage(persist);
    setIsConnected(true);

    if (persist) {
      localStorage.setItem('graphql_endpoint', newEndpoint);
      localStorage.setItem('graphql_token', newApiToken);
      localStorage.setItem('persist_config', 'true');
    } else {
      localStorage.removeItem('graphql_endpoint');
      localStorage.removeItem('graphql_token');
      localStorage.removeItem('persist_config');
    }
  };

  const disconnect = () => {
    setEndpoint('');
    setApiToken('');
    setIsConnected(false);
    setSaveToLocalStorage(false);
    localStorage.removeItem('graphql_endpoint');
    localStorage.removeItem('graphql_token');
    localStorage.removeItem('persist_config');
  };

  return (
    <ConfigContext.Provider
      value={{
        endpoint,
        apiToken,
        isConnected,
        saveToLocalStorage,
        setConfig,
        disconnect,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}; 