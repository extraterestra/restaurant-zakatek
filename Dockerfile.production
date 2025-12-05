# Frontend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Accept NODE_ENV to determine which .env file to use
ARG NODE_ENV=production

# Copy source code
COPY . .

# Copy the appropriate .env file based on NODE_ENV
# For staging/test: use .env.staging
# For production: use .env.production
RUN if [ "$NODE_ENV" = "staging" ]; then \
    cp .env.staging .env.production.local; \
    fi

# Debug: Show which API URL will be used
RUN if [ -f .env.production ]; then cat .env.production; fi
RUN if [ -f .env.production.local ]; then cat .env.production.local; fi

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
