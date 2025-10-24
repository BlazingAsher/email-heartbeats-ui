import { gql } from '@apollo/client';

// Queries
export const GET_HEARTBEATS = gql`
  query GetHeartbeats {
    heartbeats {
      email_name
      last_heartbeat
      disabled_until
      max_heartbeat_interval_seconds
      matching_criteria
      last_stale_notify
      endpoint {
        id
        user_key
        timezone
        description
      }
      forwarding_token
      description
    }
  }
`;

export const GET_HEARTBEAT = gql`
  query GetHeartbeat($email_name: String!) {
    heartbeat(email_name: $email_name) {
      email_name
      last_heartbeat
      disabled_until
      max_heartbeat_interval_seconds
      matching_criteria
      last_stale_notify
      endpoint {
        id
        user_key
        timezone
        description
      }
      forwarding_token
      description
    }
  }
`;

export const GET_PUSHOVER_ENDPOINTS = gql`
  query GetPushoverEndpoints {
    pushoverEndpoints {
      id
      user_key
      timezone
      description
    }
  }
`;

export const GET_API_TOKENS = gql`
  query GetApiTokens {
    apiTokens {
      id
      access_controls
      description
    }
  }
`;

// Mutations
export const CREATE_HEARTBEAT = gql`
  mutation CreateHeartbeat(
    $email_name: String!
    $max_heartbeat_interval_seconds: Int!
    $matching_criteria: String!
    $endpoint_id: Int
    $forwarding_token: String
    $description: String
    $disabled_until: Int
  ) {
    createHeartbeat(
      email_name: $email_name
      max_heartbeat_interval_seconds: $max_heartbeat_interval_seconds
      matching_criteria: $matching_criteria
      endpoint_id: $endpoint_id
      forwarding_token: $forwarding_token
      description: $description
      disabled_until: $disabled_until
    ) {
      email_name
      last_heartbeat
      disabled_until
      max_heartbeat_interval_seconds
      last_stale_notify
      matching_criteria
      endpoint {
        id
        user_key
        timezone
        description
      }
      forwarding_token
      description
    }
  }
`;

export const UPDATE_HEARTBEAT = gql`
  mutation UpdateHeartbeat(
    $email_name: String!
    $max_heartbeat_interval_seconds: Int
    $matching_criteria: String
    $endpoint_id: Int
    $forwarding_token: String
    $description: String
    $disabled_until: Int
  ) {
    updateHeartbeat(
      email_name: $email_name
      max_heartbeat_interval_seconds: $max_heartbeat_interval_seconds
      matching_criteria: $matching_criteria
      endpoint_id: $endpoint_id
      forwarding_token: $forwarding_token
      description: $description
      disabled_until: $disabled_until
    ) {
      email_name
      last_heartbeat
      disabled_until
      max_heartbeat_interval_seconds
      last_stale_notify
      matching_criteria
      endpoint {
        id
        user_key
        timezone
        description
      }
      forwarding_token
      description
    }
  }
`;

export const DELETE_HEARTBEAT = gql`
  mutation DeleteHeartbeat($email_name: String!) {
    deleteHeartbeat(email_name: $email_name)
  }
`;

export const RECORD_HEARTBEAT = gql`
  mutation RecordHeartbeat($email_name: String!) {
    recordHeartbeat(email_name: $email_name) {
      email_name
      last_heartbeat
    }
  }
`;

export const CREATE_PUSHOVER_ENDPOINT = gql`
  mutation CreatePushoverEndpoint(
    $user_key: String!
    $timezone: String!
    $description: String
  ) {
    createPushoverEndpoint(
      user_key: $user_key
      timezone: $timezone
      description: $description
    ) {
      id
      user_key
      timezone
      description
    }
  }
`;

export const UPDATE_PUSHOVER_ENDPOINT = gql`
  mutation UpdatePushoverEndpoint(
    $id: Int!
    $user_key: String
    $timezone: String
    $description: String
  ) {
    updatePushoverEndpoint(
      id: $id
      user_key: $user_key
      timezone: $timezone
      description: $description
    ) {
      id
      user_key
      timezone
      description
    }
  }
`;

export const CREATE_API_TOKEN = gql`
  mutation CreateApiToken($access_controls: String!, $description: String) {
    createApiToken(access_controls: $access_controls, description: $description) {
      id
      access_controls
      description
    }
  }
`;

export const UPDATE_API_TOKEN = gql`
  mutation UpdateApiToken(
    $id: String!
    $access_controls: String
    $description: String
  ) {
    updateApiToken(
      id: $id
      access_controls: $access_controls
      description: $description
    ) {
      id
      access_controls
      description
    }
  }
`;

export const DELETE_API_TOKEN = gql`
  mutation DeleteApiToken($id: String!) {
    deleteApiToken(id: $id)
  }
`;

export const GET_EMAILS = gql`
  query GetEmails($limit: Int!, $newer_than: Int) {
    emails(limit: $limit, newer_than: $newer_than) {
      id
      received_time
      to
      from
      subject
      body
      heartbeat {
        email_name
        last_heartbeat
        max_heartbeat_interval_seconds
      }
    }
  }
`;

export const DELETE_EMAILS_OLDER_THAN = gql`
  mutation DeleteEmailsOlderThan($timestamp: Int!) {
    deleteEmailsOlderThan(timestamp: $timestamp)
  }
`; 
