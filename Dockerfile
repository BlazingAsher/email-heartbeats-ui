# Multi-stage build for React app
# Stage 1: Build the React application
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Set build-time env for Vite (passed via build args)
ARG VITE_GRAPHQL_ENDPOINT
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GRAPHQL_ENDPOINT=${VITE_GRAPHQL_ENDPOINT}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Use dumb-init to run nginx
CMD ["dumb-init", "nginx", "-g", "daemon off;"] 
