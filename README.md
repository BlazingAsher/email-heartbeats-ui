# Email Heartbeats UI

A React-based web interface for managing email heartbeats, Pushover endpoints, and API tokens using GraphQL.

## Features

- **Setup Screen**: Configure GraphQL endpoint and API token with optional local storage persistence
- **Heartbeats Management**: Create, edit, and delete email heartbeat monitors
- **Pushover Endpoints**: Manage notification endpoints for alerts
- **API Tokens**: Create and manage API access tokens
- **Email View**: View and manage received heartbeat emails

## Prerequisites

- Node.js 24 or higher
- A running Email Heartbeats GraphQL server

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Initial Setup**: When you first open the application, you'll see the setup screen where you need to:
   - Enter your GraphQL endpoint URL (e.g., `https://api.example.com/graphql`)
   - Enter your API token for authentication
   - Optionally check "Save to Local Storage" to persist these settings

2. **Managing Heartbeats**: 
   - View all heartbeats in a table format
   - Click "Create Heartbeat" to add a new email monitor
   - Use the "Edit" button to modify existing heartbeats
   - Delete heartbeats with the "Delete" button

3. **Managing Pushover Endpoints**:
   - Create endpoints with user key, timezone, and description
   - Edit existing endpoints
   - Endpoints can be associated with heartbeats for notifications

4. **Managing API Tokens**:
   - Create new API tokens with specific access controls
   - View and copy token IDs
   - Edit or delete existing tokens

5. **Managing Heartbeat Emails**:
   - View past email contents
   - Clear older emails

## Technology Stack

- **React** with TypeScript
- **Vite** for build tooling
- **Apollo Client** for GraphQL
- **Ant Design** for UI components
- **Context API** for state management

## Security Notes

- API tokens are stored in memory by default
- If "Save to Local Storage" is checked, credentials will be persisted in browser storage
- Always use HTTPS for your GraphQL endpoint in production
