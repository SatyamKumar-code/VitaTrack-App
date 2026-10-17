# CHANGELOG.md — Project Version History & Modification Ledger

All notable changes to the VitaTrack platform are documented in this file in adherence to the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] — 2026-10-17

### Added
- **Phase 3 Implementation: Clinical Self-Assessment Questionnaire Engine:**
  - **Backend Assessment Mongoose Model:** Created `apps/backend/src/features/assessment/models/assessment.model.ts` implementing symptoms, solar exposure, dietary habits, preliminary scoring results, AI explanation, and compound descending index `(userId, completedAt)` strictly conforming to `DATABASE_SCHEMA.md`.
  - **Zod Assessment Validator:** Created `apps/backend/src/features/assessment/validators/assessment.validation.ts` validating clinical symptom severities, UV exposure windows, and weekly nutritional frequencies.
  - **Assessment Endpoints:** Implemented `POST /api/v1/assessments`, `GET /api/v1/assessments/latest`, and `GET /api/v1/assessments/history` in `assessment.controller.ts` & `assessment.service.ts` protected by `authenticate` middleware.
  - **Mobile 4-Step Questionnaire Wizard:** Implemented `AssessmentWizardScreen.tsx`, `AssessmentProgressBar.tsx`, and route wrapper in `apps/mobile/app/assessment.tsx`.
  - **Symptom Inventory Input Components:** Implemented `SymptomStep.tsx` with interactive cards for fatigue, bone/back pain, muscle weakness, mood changes, and frequent respiratory infections.
  - **Solar & Dietary Input Components:** Implemented `SolarExposureStep.tsx` (outdoor minutes steppers/presets, time of day cards, clothing coverage visual pickers, sunscreen SPF 30+ toggle) and `DietaryHabitsStep.tsx` (fatty fish, fortified milk, egg yolk counters, UV-exposed mushrooms and supplement toggles).
  - **Offline Auto-Save Persistence Engine:** Implemented `DraftStorage` in `apps/mobile/src/features/assessment/storage/draftStorage.ts` automatically auto-saving questionnaire progress, with a "Resume Draft" banner on app launch and automatic purge upon submission.
  - **Automated Integration Test Suite:** Added 6 comprehensive integration tests in `apps/backend/tests/integration/assessment.test.ts` (30/30 total tests passing).

---

## [0.3.0] — 2026-10-17

### Added
- **Phase 2 Implementation: Authentication Engine, Security Vault & User Profile:**
  - **Backend Mongoose User Model:** Created `apps/backend/src/features/auth/models/user.model.ts` with bcrypt salt factor 12 pre-save hook, email normalization, compound index `(role, isActive)`, and password comparison method.
  - **Single-Use Token Rotation & Vault:** Created `RefreshToken` Mongoose model with MongoDB TTL indexing, 256-bit cryptographic hex strings, family grouping, and automatic token reuse detection (session compromise revocation).
  - **Auth & Profile API Endpoints:** Implemented `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh-token`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/forgot-password`, `GET /api/v1/users/profile`, and `PUT /api/v1/users/profile` with Zod validation.
  - **Security Middleware:** Built `authenticate` middleware with JWT verification (15-minute access token expiry) and `tokenVersion` check for instant session revocation.
  - **Mobile SecureStore Integration:** Implemented hardware-backed KeyStore/Keychain token persistence via `expo-secure-store` in `apps/mobile/src/shared/storage/secureStore.ts`.
  - **Mobile Auth Context & State Provider:** Created `AuthContext` with automatic boot-time token hydration and background refresh.
  - **Mobile Auth Screens & Navigation Flow:** Implemented `OnboardingScreen` (3-slide educational carousel), `LoginScreen`, `RegisterScreen` (demographic baseline, Fitzpatrick skin phototype cards, dietary orientation, medical flags), `ForgotPasswordScreen`, and route group `apps/mobile/app/(auth)/`.
  - **Mobile Profile Management Screen:** Created `ProfileScreen` in `apps/mobile/src/features/profile/screens/ProfileScreen.tsx` with baseline editing, phototype cards, dietary selectors, and secure sign-out.
  - **Automated Test Suites (24 Tests Passing):** Unit tests for bcrypt cost 12 and JWT tokens, integration tests for full auth and profile workflows, and security zero-PHI token audit.

---

## [0.2.0] — 2026-10-17

### Added
- **Phase 1 Implementation: Project Scaffolding & Tooling Setup:**
  - Monorepo workspace orchestration (`package.json`) linking `apps/mobile`, `apps/backend`, and `apps/admin`.
  - Local database containerization with `docker-compose.yml` (MongoDB 7.0 with healthcheck).
  - Backend REST service in `apps/backend` (Express 4.21, TypeScript 5.7, Helmet, CORS, log sanitization, Mongoose connection retry manager, and `/health` endpoints).
  - Mobile client shell in `apps/mobile` (Expo SDK 52, Expo Router v4, TypeScript, Solar Amber theme tokens, RootLayout, and Welcome Screen).
  - Technical administration dashboard in `apps/admin` (React 18, Vite 6, Tailwind CSS 3.4, Zero-PHI operational telemetry UI).
  - Automated Jest integration test suite in `apps/backend/tests/health.test.ts` (100% passing).
- Verified feature-based domain module folders under `src/features/` across all three applications.

---

## [0.1.0] — 2026-10-17

### Added
- **Complete Phase 0 Markdown Documentation System (20 Core Specifications):**
  - [README.md](file:///e:/VitaTrack/README.md): Project overview, academic attribution to VGU Jaipur research (Satyam Kumar, Shilpi Shikha, Dr. Hoshiyar Singh), and documentation directory.
  - [AGENTS.md](file:///e:/VitaTrack/AGENTS.md): Persistent operating mandates, the 12 inviolable agent rules, and phase authorization protocols.
  - [PROJECT_PLAN.md](file:///e:/VitaTrack/PROJECT_PLAN.md): Multi-phase implementation roadmap (Phases 0–10 + Future Phase) with entry/exit acceptance criteria.
  - [REQUIREMENTS.md](file:///e:/VitaTrack/REQUIREMENTS.md): Comprehensive functional (FR) and non-functional (NFR) requirements mapped directly to presentation slides.
  - [ARCHITECTURE.md](file:///e:/VitaTrack/ARCHITECTURE.md): System architecture, C4 container/component models, two-tier risk engine, and Zero-PHI boundary diagrams.
  - [TASKS.md](file:///e:/VitaTrack/TASKS.md): Granular, ordered, trackable implementation task backlog with verification criteria.
  - [TEST_PLAN.md](file:///e:/VitaTrack/TEST_PLAN.md): Testing strategy across unit, integration, UI, wearable, and privacy tiers with master test cases.
  - [TEST_REPORT.md](file:///e:/VitaTrack/TEST_REPORT.md): Baseline quality ledger establishing 100% of tests as `PENDING / NOT RUN`.
  - [API_SPEC.md](file:///e:/VitaTrack/API_SPEC.md): Complete OpenAPI 3.0 REST contracts for Auth, Profile, Assessments, Recommendations, Wearables, and Admin Telemetry.
  - [DATABASE_SCHEMA.md](file:///e:/VitaTrack/DATABASE_SCHEMA.md): MongoDB collections, Mongoose TypeScript schemas, compound/TTL indexes, and ER diagram.
  - [SECURITY_PRIVACY.md](file:///e:/VitaTrack/SECURITY_PRIVACY.md): Authentication security, token rotation, hardware key vaults, and DPDP Act 2023 / HIPAA alignment.
  - [SMARTWATCH_INTEGRATION.md](file:///e:/VitaTrack/SMARTWATCH_INTEGRATION.md): Android Health Connect ingestion architecture, permission flows, and biometric normalization.
  - [DEVICE_COMPATIBILITY.md](file:///e:/VitaTrack/DEVICE_COMPATIBILITY.md): Android OS, Wear OS, and manufacturer compatibility matrix with sensor fallbacks.
  - [ADMIN_DASHBOARD.md](file:///e:/VitaTrack/ADMIN_DASHBOARD.md): Technical operations dashboard specs with strict Zero-PHI privacy barriers ($N \ge 10$).
  - [ADVERTISING_PLAN.md](file:///e:/VitaTrack/ADVERTISING_PLAN.md): Future ethical, non-targeted monetization strategy (deferred and strictly unimplemented).
  - [UI_UX_SPEC.md](file:///e:/VitaTrack/UI_UX_SPEC.md): Design tokens, amber/slate color system, typography, screen wireflows, and state handling.
  - [DEPLOYMENT.md](file:///e:/VitaTrack/DEPLOYMENT.md): Expo EAS Android build workflows (`.apk`/`.aab`), Docker configs, and CI/CD pipelines.
  - [CHANGELOG.md](file:///e:/VitaTrack/CHANGELOG.md): Version history and change tracking.
  - [DECISIONS.md](file:///e:/VitaTrack/DECISIONS.md): Architectural Decision Records (ADR-001 through ADR-009).
  - [AI_PROGRESS.md](file:///e:/VitaTrack/AI_PROGRESS.md): Current phase progress ledger, active blockers, and pending tasks.

### Changed
- Specified **Feature-Based (Vertical Slice) File Structure** in [ARCHITECTURE.md](file:///e:/VitaTrack/ARCHITECTURE.md), [PROJECT_PLAN.md](file:///e:/VitaTrack/PROJECT_PLAN.md), [TASKS.md](file:///e:/VitaTrack/TASKS.md), and codified it in [DECISIONS.md](file:///e:/VitaTrack/DECISIONS.md) as **ADR-009**.

### Deprecated
- None.

### Removed
- None.

### Fixed
- None.

### Security
- Established core architectural invariants: Strict Zero-PHI admin boundary, client-side hardware-backed token storage (`Expo SecureStore`), bcrypt work factor 12+, and server-side log sanitization.
