# Multi-stage Dockerfile for VitaTrack Admin Portal (Vite + React)
FROM node:20-alpine AS builder

WORKDIR /app

# Accept optional build argument for backend API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./

RUN npm install

COPY src ./src

RUN npm run build

# Nginx runner stage to serve static SPA
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx conf for SPA routing fallback
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
RUN printf '#!/bin/sh\nAPI="${VITE_API_URL:-${BACKEND_URL:-}}"\necho "window.__VITATRACK_ENV__ = { apiUrl: \\"${API}\\" };" > /usr/share/nginx/html/env-config.js\n' > /docker-entrypoint.d/40-env-config.sh && \
    chmod +x /docker-entrypoint.d/40-env-config.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
