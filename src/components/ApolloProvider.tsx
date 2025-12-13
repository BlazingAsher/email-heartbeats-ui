import React, { useEffect, useMemo } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider as BaseApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useConfig } from '../context/ConfigContext';
import type { ReactNode } from 'react';

interface ApolloProviderProps {
  children: ReactNode;
}

export const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
  const { endpoint, apiToken, tokenType, tokenExpiry, disconnectWithNotice } = useConfig();

  // Proactively disconnect if a Google token is expired
  useEffect(() => {
    if (tokenType === 'google' && tokenExpiry) {
      const nowMs = Date.now();
      const expMs = tokenExpiry * 1000;
      if (expMs <= nowMs) {
        disconnectWithNotice('Your Google session expired. Please sign in again.');
      }
    }
  }, [tokenType, tokenExpiry, disconnectWithNotice]);

  const client = useMemo(() => {
    const httpLink = createHttpLink({
      uri: endpoint,
    });

    const authLink = setContext((_, { headers }) => {
      const nowSec = Math.floor(Date.now() / 1000);
      const isExpired = tokenType === 'google' && tokenExpiry != null && tokenExpiry <= nowSec;
      const authHeader = apiToken && !isExpired ? `Bearer ${apiToken}` : '';

      return {
        headers: {
          ...headers,
          authorization: authHeader,
        },
      };
    });

    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          errorPolicy: 'all',
        },
        query: {
          errorPolicy: 'all',
        },
      },
    });
  }, [endpoint, apiToken, tokenType, tokenExpiry]);

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}; 
