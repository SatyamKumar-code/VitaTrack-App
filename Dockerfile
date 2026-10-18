# ==============================================================================
# VitaTrack Unified Multi-Tier Docker Image
# Packages Backend API, Admin Operations Portal, and Mobile Web into ONE container
# Designed for 100% Free Render Deployment (Single Web Service, 0 Credit Card)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Mobile Web SPA (Expo React Native Web)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS mobile-builder
WORKDIR /app/apps/mobile

# Copy mobile package files & install
COPY apps/mobile/package*.json ./
COPY apps/mobile/tsconfig*.json ./
RUN npm install

# Copy source and export static web bundle
COPY apps/mobile/ ./
RUN npx expo export -p web

# ------------------------------------------------------------------------------
# Stage 2: Build Admin Operations Portal (Vite + React)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS admin-builder
WORKDIR /app/apps/admin

# Copy admin package files & install
COPY apps/admin/package*.json ./
COPY apps/admin/tsconfig*.json ./
COPY apps/admin/vite.config.ts ./
COPY apps/admin/tailwind.config.js ./
COPY apps/admin/postcss.config.js ./
COPY apps/admin/index.html ./
RUN npm install

# Copy source and compile Vite bundle
COPY apps/admin/src ./src
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Build Backend REST API (Node.js + TypeScript)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS backend-builder
WORKDIR /app/apps/backend

COPY apps/backend/package*.json ./
COPY apps/backend/tsconfig*.json ./
RUN npm install

COPY apps/backend/src ./src
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 4: Production Runner Stage (Single Unified High-Performance Container)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies for the backend
COPY apps/backend/package*.json ./
RUN npm install --omit=dev

# Copy compiled backend server code
COPY --from=backend-builder /app/apps/backend/dist ./dist

# Copy Admin SPA bundle into public/admin
COPY --from=admin-builder /app/apps/admin/dist ./public/admin

# Copy Mobile Web SPA bundle into public/mobile
COPY --from=mobile-builder /app/apps/mobile/dist ./public/mobile

# Default internal container port
EXPOSE 4000

# Start unified Node.js server
CMD ["node", "dist/server.js"]
