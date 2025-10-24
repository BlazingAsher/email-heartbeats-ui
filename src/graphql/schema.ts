export const typeDefs = `#graphql
    type ConciseHeartbeat {
        email_name: String!
        last_heartbeat: Int
    }
    
    type Heartbeat {
        email_name: String!
        last_heartbeat: Int
        disabled_until: Int
        max_heartbeat_interval_seconds: Int!
        last_stale_notify: Int
        matching_criteria: String!
        endpoint: PushoverEndpoint,
        forwarding_token: String,
        description: String
    }
    
    type PushoverEndpoint {
        id: Int!
        user_key: String!
        timezone: String!
        description: String
    }
    
    type ApiToken {
        id: String!
        access_controls: String!
        description: String
    }
    
    type Email {
        id: Int!
        received_time: Int!
        to: String!
        from: String!
        subject: String!
        body: String!
        heartbeat: Heartbeat
    }
    
    type Query {
        heartbeat(email_name: String!): Heartbeat
        heartbeats: [Heartbeat]
        staleHeartbeats: [Heartbeat]
        neverTriggeredHeartbeats: [Heartbeat]
        pushoverEndpoints: [PushoverEndpoint]
        pushoverEndpoint(id: Int!): PushoverEndpoint
        apiTokens: [ApiToken]
        apiToken(id: String!): ApiToken
        emails(limit: Int!, newer_than: Int): [Email]
        email(id: Int!): Email
    }
    
    type Mutation {
        createHeartbeat(email_name: String!, max_heartbeat_interval_seconds: Int!, matching_criteria: String!, endpoint_id: Int, forwarding_token: String, description: String, disabled_until: Int): Heartbeat
        recordHeartbeat(email_name: String!): ConciseHeartbeat
        updateHeartbeat(email_name: String!, max_heartbeat_interval_seconds: Int, matching_criteria: String, endpoint_id: Int, forwarding_token: String, description: String, disabled_until: Int): Heartbeat
        deleteHeartbeat(email_name: String!): Boolean
        createPushoverEndpoint(user_key: String!, timezone: String!, description: String): PushoverEndpoint
        updatePushoverEndpoint(id: Int!, user_key: String, timezone: String, description: String): PushoverEndpoint
        deleteEmailsOlderThan(timestamp: Int!): Int
        createApiToken(access_controls: String!, description: String): ApiToken
        updateApiToken(id: String!, access_controls: String, description: String): ApiToken
        deleteApiToken(id: String!): Boolean
    }
`;

// TypeScript interfaces based on the GraphQL schema
export interface ConciseHeartbeat {
  email_name: string;
  last_heartbeat?: number;
}

export interface PushoverEndpoint {
  id: number;
  user_key: string;
  timezone: string;
  description?: string;
}

export interface Heartbeat {
  email_name: string;
  last_heartbeat?: number;
  disabled_until?: number;
  max_heartbeat_interval_seconds: number;
  last_stale_notify?: number;
  matching_criteria: string;
  endpoint?: PushoverEndpoint;
  forwarding_token?: string;
  description?: string;
}

export interface ApiToken {
  id: string;
  access_controls: string;
  description?: string;
}

export interface Email {
  id: number;
  received_time: number;
  to: string;
  from: string;
  subject: string;
  body: string;
  heartbeat?: Heartbeat;
} 
