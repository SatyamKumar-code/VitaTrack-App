# DEPLOYMENT.md — Deployment Architecture, CI/CD & Release Engineering

> **Project:** VitaTrack — Self-Diagnosis & Guidance Platform for Vitamin D Deficiency  
> **Status:** Specification Tier (Phase 0)  
> **Target Release Environment:** Google Android (Google Play Store) & Cloud Production Services

---

## 1. Deployment Topology & Infrastructure Architecture

```mermaid
graph TB
    subgraph ClientDist ["Mobile Client Distribution"]
        EAS["Expo Application Services EAS Build"]
        PLAY["Google Play Console / Store"]
        TEST_APK["Internal Testing Standalone APK"]
        DEVICE["User Android Smartphones"]
    end

    subgraph CloudInfra ["Backend Cloud Tier"]
        LB["Nginx Load Balancer / TLS 1.3 Termination"]
        API1["Express API Container 1"]
        API2["Express API Container 2"]
        DB[("MongoDB Atlas Replica Set")]
        ADMIN_WEB["Admin Dashboard - Static SPA on CDN"]
    end

    EAS -->|"Signed .aab"| PLAY
    EAS -->|"Debug .apk"| TEST_APK
    PLAY --> DEVICE
    TEST_APK --> DEVICE

    DEVICE -->|"HTTPS TLS 1.3"| LB
    ADMIN_WEB -->|"HTTPS TLS 1.3"| LB
    LB --> API1
    LB --> API2
    API1 --> DB
    API2 --> DB
```

---

## 2. Mobile Build & EAS Workflow (Android)

VitaTrack utilizes **Expo Application Services (EAS)** for building and signing Android binaries.

### 2.1 EAS Configuration (`eas.json`)
```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services-key.json",
        "track": "internal"
      }
    }
  }
}
```

### 2.2 Android Build Artifacts
- **Preview / Internal QA:** Builds standalone signed `.apk` files for direct sideloading and rapid manual verification across test devices.
- **Production:** Builds signed Android App Bundles (`.aab`) optimized for dynamic feature delivery and Google Play distribution.

---

## 3. Backend Containerization & Deployment

### 3.1 Dockerfile Specification (`apps/backend/Dockerfile`)
```dockerfile
# Multi-stage production build for Node.js Express API
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

### 3.2 Docker Compose for Local & Staging Environments (`docker-compose.yml`)
```yaml
version: '3.8'
services:
  backend:
    build:
      context: ./apps/backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - MONGO_URI=mongodb://mongo:27017/vitatrack
      - JWT_ACCESS_SECRET=changeme_in_prod
      - JWT_REFRESH_SECRET=changeme_in_prod
    depends_on:
      - mongo

  mongo:
    image: mongo:7.0
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## 4. Environment Variables Schema

| Variable Name | Required In | Description / Security Boundary | Sample Value (Sanitized) |
|:---|:---:|:---|:---|
| `NODE_ENV` | All | Runtime environment (`development`, `staging`, `production`) | `production` |
| `PORT` | Backend | HTTP listening port | `4000` |
| `MONGO_URI` | Backend | Connection string to MongoDB database / cluster | `mongodb+srv://app_user:***@cluster0.mongodb.net/vitatrack` |
| `JWT_ACCESS_SECRET` | Backend | High-entropy secret for signing 15-minute access tokens | `256-bit cryptographically secure string` |
| `JWT_REFRESH_SECRET`| Backend | High-entropy secret for signing 7-day refresh tokens | `256-bit cryptographically secure string` |
| `GEMINI_API_KEY` | Backend | Server-side API key for Google Gemini AI risk explanations | `AIzaSy...` |
| `EXPO_PUBLIC_API_URL`| Mobile | Base endpoint URL for mobile REST client | `https://api.vitatrack.internal/api/v1` |
| `ADMIN_JWT_SECRET` | Backend | Dedicated secret for signing technical admin tokens | `256-bit cryptographically secure string` |

---

## 5. Automated CI/CD Pipeline (GitHub Actions)

```mermaid
sequenceDiagram
    participant Dev as Developer / AI Agent
    participant Repo as GitHub Repository
    participant CI as GitHub Actions CI
    participant EAS as Expo EAS Cloud
    participant Cloud as Production Cluster

    Dev->>Repo: Push commit to main branch
    Repo->>CI: Trigger CI Workflow
    CI->>CI: Run Linters & TypeScript Typecheck
    CI->>CI: Run Jest Unit & Integration Test Suites
    CI->>CI: Run Zero-PHI Privacy Verification Test
    alt Any Test Fails
        CI-->>Dev: Build Failed Notification & Test Logs
    else All Tests Pass
        CI->>EAS: Trigger EAS Android Build (Production .aab)
        CI->>Cloud: Build & Deploy Backend Docker Image
        Cloud-->>CI: Deploy Verified (Healthcheck 200 OK)
        CI-->>Dev: Deployment Succeeded
    end
```

---

## 6. Disaster Recovery & Rollback Strategy

1. **Database Automated Backups:** Continuous point-in-time recovery (PITR) with daily snapshot retention on MongoDB Atlas.
2. **Blue/Green Backend Deployments:** Zero-downtime rolling updates; traffic is diverted to new backend containers only after `/health` responds with `200 OK`.
3. **Instant Mobile Feature Flags:** Critical features (such as AI explainer or wearable sync) can be toggled off remotely via runtime configuration without requiring an emergency Play Store update if an external API degrades.
