# Multi-stage Dockerfile for VitaTrack Mobile Web App (Expo React Native Web)
FROM node:20-alpine AS builder

WORKDIR /app

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
COPY expo-env.d.ts ./

# Export static Progressive Web App bundle
RUN npx expo export -p web

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

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
