import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type TokenType = 'api' | 'google' | null;

interface ConfigContextType {
  endpoint: string;
  apiToken: string;
  tokenType: TokenType;
  tokenExpiry: number | null; // seconds since epoch for Google tokens; null for API tokens
  isConnected: boolean;
  saveToLocalStorage: boolean;
  sessionNotice: string | null;
  setConfig: (endpoint: string, apiToken: string, saveToLocalStorage: boolean) => void;
  setGoogleAuth: (
    endpoint: string,
    idToken: string,
    tokenExpirySeconds: number,
    saveToLocalStorage: boolean
  ) => void;
  disconnect: () => void;
  disconnectWithNotice: (notice: string) => void;
  clearSessionNotice: () => void;
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
  const [tokenType, setTokenType] = useState<TokenType>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null); // seconds since epoch
  const [saveToLocalStorage, setSaveToLocalStorage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  // Load from localStorage on mount (support legacy persisted state)
  useEffect(() => {
    const savedEndpoint = localStorage.getItem('graphql_endpoint');
    const savedToken = localStorage.getItem('graphql_token');
    const savedPersist = localStorage.getItem('persist_config') === 'true';
    const savedTokenTypeRaw = localStorage.getItem('graphql_token_type');
    const savedTokenType: TokenType =
      savedTokenTypeRaw === 'google' ? 'google' : savedToken ? 'api' : null;
    const savedTokenExp = localStorage.getItem('graphql_token_exp');

    if (savedEndpoint && savedToken && savedTokenType) {
      let valid = true;

      if (savedTokenType === 'google') {
        const expSec = savedTokenExp ? parseInt(savedTokenExp, 10) : 0;
        const nowSec = Math.floor(Date.now() / 1000);
        if (!expSec || expSec <= nowSec) {
          valid = false;
        }
        setTokenExpiry(expSec || null);
      } else {
        setTokenExpiry(null);
      }

      if (valid) {
        setEndpoint(savedEndpoint);
        setApiToken(savedToken);
        setTokenType(savedTokenType);
        setSaveToLocalStorage(savedPersist);
        setIsConnected(true);
      } else {
        // Token expired: clear persisted state and show a notice
        setSessionNotice('Your Google session expired. Please sign in again.');
        localStorage.removeItem('graphql_endpoint');
        localStorage.removeItem('graphql_token');
        localStorage.removeItem('persist_config');
        localStorage.removeItem('graphql_token_type');
        localStorage.removeItem('graphql_token_exp');
      }
    }
  }, []);

  const persistCommon = (
    persist: boolean,
    data: { endpoint: string; token: string; tokenType: TokenType; tokenExp?: number | null }
  ) => {
    if (persist) {
      localStorage.setItem('graphql_endpoint', data.endpoint);
      localStorage.setItem('graphql_token', data.token);
      localStorage.setItem('persist_config', 'true');
      if (data.tokenType) {
        localStorage.setItem('graphql_token_type', data.tokenType);
      }
      if (data.tokenType === 'google') {
        localStorage.setItem('graphql_token_exp', data.tokenExp ? String(data.tokenExp) : '');
      } else {
        localStorage.removeItem('graphql_token_exp');
      }
    } else {
      localStorage.removeItem('graphql_endpoint');
      localStorage.removeItem('graphql_token');
      localStorage.removeItem('persist_config');
      localStorage.removeItem('graphql_token_type');
      localStorage.removeItem('graphql_token_exp');
    }
  };

  const setConfig = (newEndpoint: string, newApiToken: string, persist: boolean) => {
    setEndpoint(newEndpoint);
    setApiToken(newApiToken);
    setTokenType('api');
    setTokenExpiry(null);
    setSaveToLocalStorage(persist);
    setIsConnected(true);
    setSessionNotice(null);

    persistCommon(persist, {
      endpoint: newEndpoint,
      token: newApiToken,
      tokenType: 'api',
      tokenExp: null,
    });
  };

  const setGoogleAuth = (
    newEndpoint: string,
    idToken: string,
    tokenExpirySeconds: number,
    persist: boolean
  ) => {
    setEndpoint(newEndpoint);
    setApiToken(idToken);
    setTokenType('google');
    setTokenExpiry(tokenExpirySeconds || null);
    setSaveToLocalStorage(persist);
    setIsConnected(true);
    setSessionNotice(null);

    persistCommon(persist, {
      endpoint: newEndpoint,
      token: idToken,
      tokenType: 'google',
      tokenExp: tokenExpirySeconds || null,
    });
  };

  const disconnect = () => {
    setEndpoint('');
    setApiToken('');
    setTokenType(null);
    setTokenExpiry(null);
    setIsConnected(false);
    setSaveToLocalStorage(false);
    localStorage.removeItem('graphql_endpoint');
    localStorage.removeItem('graphql_token');
    localStorage.removeItem('persist_config');
    localStorage.removeItem('graphql_token_type');
    localStorage.removeItem('graphql_token_exp');
  };

  const disconnectWithNotice = (notice: string) => {
    setSessionNotice(notice);
    // Clear connection state but keep the notice
    setEndpoint('');
    setApiToken('');
    setTokenType(null);
    setTokenExpiry(null);
    setIsConnected(false);
    setSaveToLocalStorage(false);
    localStorage.removeItem('graphql_endpoint');
    localStorage.removeItem('graphql_token');
    localStorage.removeItem('persist_config');
    localStorage.removeItem('graphql_token_type');
    localStorage.removeItem('graphql_token_exp');
  };

  const clearSessionNotice = () => setSessionNotice(null);

  return (
    <ConfigContext.Provider
      value={{
        endpoint,
        apiToken,
        tokenType,
        tokenExpiry,
        isConnected,
        saveToLocalStorage,
        sessionNotice,
        setConfig,
        setGoogleAuth,
        disconnect,
        disconnectWithNotice,
        clearSessionNotice,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}; 
