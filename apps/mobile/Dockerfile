# Multi-stage Dockerfile for VitaTrack Mobile Web App (Expo React Native Web)
FROM node:20-alpine AS builder

WORKDIR /app

# Accept optional build argument for backend API URL
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

# Copy package and config files
COPY package*.json ./
COPY tsconfig*.json ./
COPY app.json ./

# Install dependencies
RUN npm install

# Copy source code and assets
COPY app ./app
COPY src ./src
COPY assets ./assets

# Export static Progressive Web App bundle and inject env-config.js into head
RUN npx expo export -p web && \
    sed -i 's/<head>/<head><script src="\/env-config.js"><\/script>/' /app/dist/index.html

# Nginx runner stage to serve static mobile web application
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx conf for React Native Web SPA routing fallback
RUN echo 'server { \
    listen 80; \
    server_name _; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Dynamic runtime environment injection script for Nginx container startup
RUN printf '#!/bin/sh\nAPI="${EXPO_PUBLIC_API_URL:-${BACKEND_URL:-}}"\necho "window.__VITATRACK_ENV__ = { apiUrl: \\"${API}\\" };" > /usr/share/nginx/html/env-config.js\n' > /docker-entrypoint.d/40-env-config.sh && \
    chmod +x /docker-entrypoint.d/40-env-config.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
