# TASKS.md — Granular Implementation Task Backlog

> **Project:** VitaTrack — Self-Diagnosis & Guidance Platform for Vitamin D Deficiency  
> **Rule:** Implement ONLY the specific phase authorized by the user. Do not jump ahead.

---

## Task Status Summary

| Phase | Description | Task Count | Status |
|:---:|:---|:---:|:---:|
| **Phase 0** | Requirements, Architecture & Complete Documentation | 6 | **COMPLETED** |
| **Phase 1** | Project Scaffolding & Tooling Setup | 6 | **COMPLETED** |
| **Phase 2** | Authentication, Security Vault & User Profile | 6 | `Planned` |
| **Phase 3** | Clinical Self-Assessment Questionnaire Engine | 6 | `Planned` |
| **Phase 4** | Deterministic Risk Scoring & AI Explainer Engine | 6 | `Planned` |
| **Phase 5** | Personalized Nutritional, Solar & Exercise Guidance | 5 | `Planned` |
| **Phase 6** | History, Trend Analytics & Clinician PDF Reports | 5 | `Planned` |
| **Phase 7** | Context-Aware Reminders & Notification System | 4 | `Planned` |
| **Phase 8** | Smartwatch Integration via Android Health Connect | 6 | `Planned` |
| **Phase 9** | Technical Admin Monitoring Dashboard (Zero-PHI) | 5 | `Planned` |
| **Phase 10** | Security Hardening, E2E Testing & EAS Android Release | 6 | `Planned` |
| **Future** | Privacy-Preserving Ethical Advertising System | 4 | `Planned` |

---

## Phase 0: Requirements, Architecture & Complete Documentation (COMPLETED)

- [x] **TASK-P0-01: Analyze Academic Presentation & Clinical Literature**  
  *Deliverable:* Complete extraction of requirements from 9-slide VGU PPT presentation.  
  *Verification:* Documented in [REQUIREMENTS.md](file:///e:/VitaTrack/REQUIREMENTS.md).
- [x] **TASK-P0-02: Author Core Architecture & Privacy Invariant Specifications**  
  *Deliverable:* [ARCHITECTURE.md](file:///e:/VitaTrack/ARCHITECTURE.md), [SECURITY_PRIVACY.md](file:///e:/VitaTrack/SECURITY_PRIVACY.md).  
  *Verification:* C4 diagrams and Zero-PHI boundary documented.
- [x] **TASK-P0-03: Author Data Contracts & Persistence Schemas**  
  *Deliverable:* [API_SPEC.md](file:///e:/VitaTrack/API_SPEC.md), [DATABASE_SCHEMA.md](file:///e:/VitaTrack/DATABASE_SCHEMA.md).  
  *Verification:* REST endpoints and MongoDB schemas specified.
- [x] **TASK-P0-04: Author Hardware & Wearable Compatibility Specifications**  
  *Deliverable:* [SMARTWATCH_INTEGRATION.md](file:///e:/VitaTrack/SMARTWATCH_INTEGRATION.md), [DEVICE_COMPATIBILITY.md](file:///e:/VitaTrack/DEVICE_COMPATIBILITY.md).  
  *Verification:* Android Health Connect matrix and vendor limits documented.
- [x] **TASK-P0-05: Author Operational, UI/UX & Quality Assurance Frameworks**  
  *Deliverable:* [UI_UX_SPEC.md](file:///e:/VitaTrack/UI_UX_SPEC.md), [ADMIN_DASHBOARD.md](file:///e:/VitaTrack/ADMIN_DASHBOARD.md), [TEST_PLAN.md](file:///e:/VitaTrack/TEST_PLAN.md), [TEST_REPORT.md](file:///e:/VitaTrack/TEST_REPORT.md).  
  *Verification:* Test cases mapped, baseline marked pending.
- [x] **TASK-P0-06: Author Roadmap, Decision Records & AI Tracking Framework**  
  *Deliverable:* [PROJECT_PLAN.md](file:///e:/VitaTrack/PROJECT_PLAN.md), [TASKS.md](file:///e:/VitaTrack/TASKS.md), [DEPLOYMENT.md](file:///e:/VitaTrack/DEPLOYMENT.md), [CHANGELOG.md](file:///e:/VitaTrack/CHANGELOG.md), [DECISIONS.md](file:///e:/VitaTrack/DECISIONS.md), [AI_PROGRESS.md](file:///e:/VitaTrack/AI_PROGRESS.md), [ADVERTISING_PLAN.md](file:///e:/VitaTrack/ADVERTISING_PLAN.md), [AGENTS.md](file:///e:/VitaTrack/AGENTS.md), [README.md](file:///e:/VitaTrack/README.md).  
  *Verification:* All 20 Markdown files cross-referenced.

---

## Phase 1: Project Scaffolding & Tooling Setup (COMPLETED)

- [x] **TASK-P1-01: Initialize Monorepo Structure & Workspaces**  
  *Description:* Set up root workspace with npm workspaces for `apps/mobile`, `apps/backend`, and `apps/admin` following feature-based directory conventions.  
  *Verification:* Root `package.json` with npm workspaces configured, `.gitignore`, `.env.example`, and builds verified.  
  *Status:* `Completed` (2026-10-17)
- [x] **TASK-P1-02: Scaffold Express Backend with Feature-Based Architecture**  
  *Description:* Initialize `apps/backend` with TypeScript, nodemon/ts-node-dev, Jest, and feature-based structure under `src/features/` plus `src/core/` (config, database, logger, middleware).  
  *Verification:* `apps/backend` compiles cleanly via `npm run build` with 0 errors; `/health` endpoints functional.  
  *Status:* `Completed` (2026-10-17)
- [x] **TASK-P1-03: Configure Database Connection & Local Docker Compose**  
  *Description:* Set up `docker-compose.yml` for local MongoDB instance and Mongoose connection helper with retry logic.  
  *Verification:* `docker-compose.yml` created with MongoDB 7.0 healthcheck; `DatabaseManager` in `src/core/database/mongooseConnection.ts` implements exponential backoff retry.  
  *Status:* `Completed` (2026-10-17)
- [x] **TASK-P1-04: Scaffold React Native Expo Mobile App with Feature-Based Architecture**  
  *Description:* Initialize `apps/mobile` with Expo SDK 52+, Expo Router, TypeScript, and feature-based directory layout under `src/features/` with thin route wrappers in `app/`.  
  *Verification:* TypeScript check `npx tsc --noEmit` passed with 0 errors; RootLayout & Welcome screen configured.  
  *Status:* `Completed` (2026-10-17)
- [x] **TASK-P1-05: Scaffold Admin Dashboard Shell with Feature-Based Layout**  
  *Description:* Initialize `apps/admin` with React, Vite, Tailwind CSS, and feature modules under `src/features/` (`auth`, `health`, `telemetry`, `analytics`, `audit`).  
  *Verification:* `apps/admin` Vite production build `npm run build` succeeds with 0 errors.  
  *Status:* `Completed` (2026-10-17)
- [x] **TASK-P1-06: Setup Monorepo Scripts & Verification Automation**  
  *Description:* Configure root npm scripts for building and testing across all workspaces.  
  *Verification:* Root `npm run build` and `npm run test` execute across workspaces and exit with code 0.  
  *Status:* `Completed` (2026-10-17)

---

## Phase 2: Authentication, Security Vault & User Profile (`Planned`)

- [ ] **TASK-P2-01: Backend User Model & Password Hashing**  
  *Description:* Create Mongoose User schema with bcrypt pre-save hook, email normalization, and indexing.  
  *Status:* `Planned`
- [ ] **TASK-P2-02: JWT Auth Service & Token Rotation**  
  *Description:* Implement login, signup, refresh token rotation, and logout endpoints with token invalidation.  
  *Status:* `Planned`
- [ ] **TASK-P2-03: Mobile Secure Storage Integration**  
  *Description:* Integrate `expo-secure-store` for storing access and refresh tokens securely on iOS/Android.  
  *Status:* `Planned`
- [ ] **TASK-P2-04: Mobile Auth Screens & Navigation Flow**  
  *Description:* Implement Onboarding Carousel, Login, Register, and Forgot Password screens using React Native.  
  *Status:* `Planned`
- [ ] **TASK-P2-05: User Profile Data API & Schema**  
  *Description:* Implement profile endpoints for age, biological sex, Fitzpatrick skin type, and medical history flags.  
  *Status:* `Planned`
- [ ] **TASK-P2-06: Mobile Profile Management Screen**  
  *Description:* Create UI allowing users to view and update baseline demographic and clinical profile information.  
  *Status:* `Planned`

---

## Phase 3: Clinical Self-Assessment Questionnaire Engine (`Planned`)

- [ ] **TASK-P3-01: Assessment Data Schema & Validation**  
  *Description:* Build Mongoose schema for assessments and Zod validation schema matching PPT Step 1 parameters.  
  *Status:* `Planned`
- [ ] **TASK-P3-02: Assessment Submission Endpoint**  
  *Description:* Implement `POST /api/v1/assessments` with authentication middleware and input validation.  
  *Status:* `Planned`
- [ ] **TASK-P3-03: Mobile Multi-Step Questionnaire UI Flow**  
  *Description:* Build multi-screen survey wizard with animated progress bar and slide transitions.  
  *Status:* `Planned`
- [ ] **TASK-P3-04: Symptom Input Components**  
  *Description:* Implement interactive rating cards for fatigue, bone pain, muscle weakness, mood, and infections.  
  *Status:* `Planned`
- [ ] **TASK-P3-05: Sunlight Exposure & Dietary Habits Components**  
  *Description:* Implement UI selectors for daily outdoor exposure, clothing coverage, and nutritional frequencies.  
  *Status:* `Planned`
- [ ] **TASK-P3-06: Offline Draft Auto-Save Feature**  
  *Description:* Save partial survey progress to local device storage, allowing resume on app reload.  
  *Status:* `Planned`

---

## Phase 4: Deterministic Risk Scoring & AI Explainer Engine (`Planned`)

- [ ] **TASK-P4-01: Implement Core Deterministic Scoring Algorithm**  
  *Description:* Code the weighted multi-factor scoring formula ($0–100$) in backend `services/riskScoringService.ts`.  
  *Status:* `Planned`
- [ ] **TASK-P4-02: Risk Stratification & Clinical Consultation Alert Logic**  
  *Description:* Implement logic classifying scores into Low, Moderate, High, and triggering mandatory doctor alerts.  
  *Status:* `Planned`
- [ ] **TASK-P4-03: AI Explainer Service Integration**  
  *Description:* Implement backend proxy calling Google Gemini API to synthesize patient-friendly risk explanations.  
  *Status:* `Planned`
- [ ] **TASK-P4-04: Mobile Assessment Results Screen**  
  *Description:* Build interactive results view with circular SVG gauge, risk level badge, and primary contributors breakdown.  
  *Status:* `Planned`
- [ ] **TASK-P4-05: Doctor Consultation Warning Banner**  
  *Description:* Render high-visibility clinical consultation advisory banner with educational guidance on lab testing.  
  *Status:* `Planned`
- [ ] **TASK-P4-06: Comprehensive Unit Tests for Scoring Engine**  
  *Description:* Author Jest test vectors asserting deterministic score calculation across 20+ clinical edge cases.  
  *Status:* `Planned`

---

## Phase 5: Personalized Nutritional, Solar & Exercise Guidance (`Planned`)

- [ ] **TASK-P5-01: Nutritional Recommendation Engine**  
  *Description:* Generate customized diet suggestions (Omnivore, Vegetarian, Vegan) emphasizing bioavailable Vitamin D.  
  *Status:* `Planned`
- [ ] **TASK-P5-02: Safe Sunlight Exposure Calculator**  
  *Description:* Implement solar guidance based on user skin phototype and conservative UV exposure guidelines.  
  *Status:* `Planned`
- [ ] **TASK-P5-03: Musculoskeletal Exercise Guide Module**  
  *Description:* Curate weight-bearing and outdoor exercise routines designed to support bone mineral density.  
  *Status:* `Planned`
- [ ] **TASK-P5-04: Mobile Guidance & Diet Tabs UI**  
  *Description:* Build rich mobile screens displaying meal cards, sunlight timers, and exercise walkthroughs.  
  *Status:* `Planned`
- [ ] **TASK-P5-05: Educational Content Hub**  
  *Description:* Create in-app educational reading cards explaining Vitamin D synthesis, testing, and health benefits.  
  *Status:* `Planned`

---

## Phase 6: Assessment History, Trend Analytics & Health Reports (`Planned`)

- [ ] **TASK-P6-01: Assessment History API**  
  *Description:* Implement `GET /api/v1/assessments/history` with pagination, date filters, and summary metrics.  
  *Status:* `Planned`
- [ ] **TASK-P6-02: Mobile Assessment History Screen**  
  *Description:* Build list view showing past completed assessments with date, score, risk badge, and quick details.  
  *Status:* `Planned`
- [ ] **TASK-P6-03: Visual Health Trend Charts**  
  *Description:* Integrate charting library (`victory-native` or `react-native-gifted-charts`) to render score trajectories.  
  *Status:* `Planned`
- [ ] **TASK-P6-04: Clinician PDF Report Generator (Client-Side)**  
  *Description:* Use `expo-print` to render an HTML/CSS template into a clean, printable medical summary PDF.  
  *Status:* `Planned`
- [ ] **TASK-P6-05: Native Document Sharing Integration**  
  *Description:* Integrate `expo-sharing` to allow users to save or share their generated PDF report via the OS share sheet.  
  *Status:* `Planned`

---

## Phase 7: Context-Aware Reminders & Notification System (`Planned`)

- [ ] **TASK-P7-01: Notification Configuration & Permissions Handler**  
  *Description:* Set up `expo-notifications` with Android notification channels and user permission prompts.  
  *Status:* `Planned`
- [ ] **TASK-P7-02: Daily Sunlight Local Notification Scheduler**  
  *Description:* Allow users to configure daily notification times for optimal sun exposure reminders.  
  *Status:* `Planned`
- [ ] **TASK-P7-03: Dietary Habit & Supplement Reminders**  
  *Description:* Implement scheduled alerts for nutrient-rich meals and doctor-recommended supplements.  
  *Status:* `Planned`
- [ ] **TASK-P7-04: Periodic Re-Assessment Scheduler**  
  *Description:* Automatically schedule bi-weekly or monthly notifications nudging users to re-evaluate their symptoms.  
  *Status:* `Planned`

---

## Phase 8: Smartwatch & Wearable Ingestion (Android Health Connect) (`Planned`)

- [ ] **TASK-P8-01: Health Connect Native Module Integration**  
  *Description:* Integrate `react-native-health-connect` with Android permissions configuration and manifest tags.  
  *Status:* `Planned`
- [ ] **TASK-P8-02: Biometric Querying Subsystem**  
  *Description:* Query Daily Steps, Resting Heart Rate, SpO₂ (Oxygen Saturation), and Sleep Duration/Stages.  
  *Status:* `Planned`
- [ ] **TASK-P8-03: Wearable Ingestion Backend API**  
  *Description:* Implement `POST /api/v1/wearables/sync` and Mongoose `WearableMetric` collection schema.  
  *Status:* `Planned`
- [ ] **TASK-P8-04: Mobile Wearable Dashboard UI**  
  *Description:* Display synced biometric cards, connection status indicator, and last-synced timestamp.  
  *Status:* `Planned`
- [ ] **TASK-P8-05: Unsupported Device & Graceful Fallback Handling**  
  *Description:* Implement graceful UI states for devices lacking Health Connect or specific hardware sensors.  
  *Status:* `Planned`
- [ ] **TASK-P8-06: Wearable Correlation Insights**  
  *Description:* Correlate low physical activity or disrupted sleep patterns with fatigue scores in progress views.  
  *Status:* `Planned`

---

## Phase 9: Technical Admin Monitoring Dashboard (Zero-PHI) (`Planned`)

- [ ] **TASK-P9-01: Admin Telemetry Ingestion API**  
  *Description:* Build `GET /api/v1/admin/health` and `GET /api/v1/admin/metrics` with strict Zero-PHI constraints.  
  *Status:* `Planned`
- [ ] **TASK-P9-02: Admin Role Authentication & RBAC**  
  *Description:* Implement secure admin login endpoint, JWT verification with `role: admin`, and session expiry.  
  *Status:* `Planned`
- [ ] **TASK-P9-03: Infrastructure Performance Visualizers**  
  *Description:* Build admin UI cards showing API latency, 5xx error spikes, memory usage, and DB pool status.  
  *Status:* `Planned`
- [ ] **TASK-P9-04: Aggregate Macro App Analytics**  
  *Description:* Display aggregate metrics only (Total Users, DAU, Total Assessments Completed) with $N \ge 10$ rule.  
  *Status:* `Planned`
- [ ] **TASK-P9-05: Zero-PHI Privacy Verification Automated Test**  
  *Description:* Author test asserting no individual patient records or biometric traces exist in admin API responses.  
  *Status:* `Planned`

---

## Phase 10: Security Hardening, E2E Testing & EAS Android Release (`Planned`)

- [ ] **TASK-P10-01: API Security Hardening & Rate Limiting**  
  *Description:* Configure Express rate limiters, Helmet HTTP security headers, CORS policies, and input sanitizers.  
  *Status:* `Planned`
- [ ] **TASK-P10-02: Comprehensive Integration Test Suite Execution**  
  *Description:* Run end-to-end integration tests using Supertest across all user and assessment flows.  
  *Status:* `Planned`
- [ ] **TASK-P10-03: Mobile UI Automated Flow Tests**  
  *Description:* Implement and run mobile flow tests with Maestro / Jest Native testing suite.  
  *Status:* `Planned`
- [ ] **TASK-P10-04: Expo EAS Android Build Configuration**  
  *Description:* Configure `eas.json` with development, preview (APK), and production (AAB) build profiles.  
  *Status:* `Planned`
- [ ] **TASK-P10-05: Android Keystore & Code Signing Setup**  
  *Description:* Configure secure Android release signing keys within EAS Credentials manager.  
  *Status:* `Planned`
- [ ] **TASK-P10-06: Release Verification & Documentation Freeze**  
  *Description:* Generate test report, verify package hashes, and tag v1.0.0 release.  
  *Status:* `Planned`

---

## Future Phase: Privacy-Preserving Ethical Advertising (DEFERRED)

- [ ] **TASK-FUT-01: Ethical Advertising Policy & Compliance Document**  
  *Description:* Draft privacy-first ad policy barring behavioral tracking and PII/PHI sharing.  
  *Status:* `Planned`
- [ ] **TASK-FUT-02: Non-Targeted Contextual Ad Mediation Service**  
  *Description:* Implement privacy-preserving backend proxy for vetted healthcare/supplement sponsors.  
  *Status:* `Planned`
- [ ] **TASK-FUT-03: User Consent & Opt-Out Management UI**  
  *Description:* Build explicit user consent toggle and privacy controls in Mobile Settings.  
  *Status:* `Planned`
- [ ] **TASK-FUT-04: Ad-Free Premium Subscription Verification**  
  *Description:* Implement ad-free entitlement verification for users supporting the platform.  
  *Status:* `Planned`
