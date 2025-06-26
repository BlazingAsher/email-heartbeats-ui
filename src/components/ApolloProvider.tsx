import React, { useMemo } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider as BaseApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useConfig } from '../context/ConfigContext';
import type { ReactNode } from 'react';

interface ApolloProviderProps {
  children: ReactNode;
}

export const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
  const { endpoint, apiToken } = useConfig();

  const client = useMemo(() => {
    const httpLink = createHttpLink({
      uri: endpoint,
    });

    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          authorization: apiToken ? `Bearer ${apiToken}` : '',
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
  }, [endpoint, apiToken]);

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}; 