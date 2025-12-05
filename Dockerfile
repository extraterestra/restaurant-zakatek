# Frontend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Accept build argument for API URL with default fallback
ARG VITE_API_URL=http://localhost:5001
ARG GEMINI_API_KEY=""

# Set as environment variables for Vite build
ENV VITE_API_URL=$VITE_API_URL
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Debug: Print the API URL being used
RUN echo "Building with VITE_API_URL: $VITE_API_URL"

# Copy source code
COPY . .

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
