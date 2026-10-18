# CHANGELOG.md — Project Version History & Modification Ledger

All notable changes to the VitaTrack platform are documented in this file in adherence to the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] — 2026-10-18

### Added
- **Phase 8 Implementation: Smartwatch & Wearable Biometric Ingestion (Android Health Connect):**
  - **Android Health Connect Permissions & Manifest Configuration (`TASK-P8-01`):** Integrated Android permissions (`READ_STEPS`, `READ_HEART_RATE`, `READ_OXYGEN_SATURATION`, `READ_SLEEP`) and `androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE` intent filters in `apps/mobile/app.json`.
  - **Biometric Querying & Normalization Subsystem (`TASK-P8-02`):** Created `validateAndNormalizeBiometrics` in `apps/mobile/src/features/wearables/services/biometricNormalizer.ts` and `HealthConnectBridge` in `apps/mobile/src/features/wearables/services/healthConnectBridge.ts` enforcing physiological boundaries (clamping steps to $[0, 100000]$, heart rate to $[30, 220]\text{ bpm}$, $\text{SpO}_2$ to $[50.0, 100.0]\%$, and sleep to $[0, 1440]\text{ min}$).
  - **Wearable Ingestion REST API & Database Schema (`TASK-P8-03`):** Created Mongoose `WearableMetric` collection in `apps/backend/src/features/wearables/models/wearableMetric.model.ts` with compound unique index `(userId, metricsDate)` for daily deduplication, Zod schema validation in `wearable.validator.ts`, service logic in `wearable.service.ts`, and endpoints `POST /api/v1/wearables/sync`, `GET /api/v1/wearables/latest`, and `GET /api/v1/wearables/history`.
  - **Mobile Wearable Dashboard Screen & Routes (`TASK-P8-04`):** Built `WearableDashboardScreen.tsx` and Expo Router route `apps/mobile/app/wearables.tsx` featuring individual biometric telemetry cards (`BiometricMetricCard.tsx`), real-time Health Connect connection pill with sync trigger (`ConnectionStatusBanner.tsx`), and last-synced timestamp.
  - **Unsupported Device & Hardware Fallback Handling (`TASK-P8-05` / `TC-HARD-01`):** Implemented multi-tier OS detection (Tier 1 Android 14+ System Service, Tier 2 Android 9–13 Standalone Google Play App with direct install prompts, Tier 3 Android $\le 8.1$ graceful fallback to Manual Mode), local offline sync queueing, and sensor absence alerts.
  - **Wearable Correlation Insights Subsystem (`TASK-P8-06`):** Implemented clinical synthesis in `WearableService.getCorrelationInsights` and mobile card `WearableCorrelationCard.tsx` correlating 7-day rolling physical activity ($< 4,000\text{ steps/day}$) and sleep deficit ($< 6\text{ hours/night}$) with user's clinical questionnaire fatigue scores.
  - **7-Day Movement Trend Visualizer:** Created `WearableHistorySparkline.tsx` rendering SVG movement bars with goal benchmark reference line ($10,000\text{ steps}$).
  - **Hardware Ecosystem Companion App Setup Guides:** Built `VendorGuideSection.tsx` with step-by-step setup walkthroughs for Samsung Health, Google Pixel Watch / Fitbit, Garmin Connect, NoiseFit, and Fire-Boltt Health Hub / Da Fit.
  - **Automated Verification Suites (14 Tests, 117 Total):** Created integration test suite `apps/backend/tests/integration/wearables.test.ts` (verifying `TC-WEAR-01`, `TC-WEAR-02`, auth guards, date deduplication, and fatigue correlation) and unit test suite `apps/backend/tests/unit/wearableNormalizer.test.ts` (verifying physiological boundaries and `TC-HARD-01` graceful degradation) with 100% pass rate (117/117 backend tests passing, clean mobile TypeScript verification, and clean production build).

---

## [0.6.0] — 2026-10-17

### Added
- **Phase 5 Implementation: Personalized Nutritional, Solar & Exercise Guidance Hub:**
  - **Nutritional Recommendation Subsystem:** Implemented `NutritionalEngine` in `apps/backend/src/features/guidance/services/nutritionalEngine.ts` generating customized dietary protocols for Omnivore, Vegetarian, and Vegan profiles emphasizing bioavailable Vitamin D (UV-exposed mushrooms, lichen D3, fortified plant/dairy milks, wild cold-water fish), Magnesium & Vitamin K2 (MK-7) bone-axis co-factors, target daily IU calibration ($1,000–4,000\text{ IU}$), and lipid micellar absorption delivery.
  - **Safe Sunlight Exposure Calculator:** Implemented `SolarCalculatorEngine` in `apps/backend/src/features/guidance/services/solarCalculatorEngine.ts` dynamically calculating daily safe exposure windows by Fitzpatrick Phototypes I through VI ($10\text{ min}$ for Type I up to $38\text{ min}$ for Type VI), optimal solar hours ($10:00\text{–}11:30\text{ AM} / 2:30\text{–}3:30\text{ PM}$), conservative $\text{UV Index} \ge 8$ warnings, and sunscreen timing protocols.
  - **Musculoskeletal Exercise Guide Module:** Created `ExerciseGuideModule` in `apps/backend/src/features/guidance/services/exerciseGuideModule.ts` curating weight-bearing outdoor walking with solar synergy, bodyweight squats, resistance band training, stair climbing, and gentle mobility tailored to user symptom severity (joint/bone pain and muscle weakness).
  - **Educational Content Hub Subsystem:** Built `EducationalKnowledgeBase` in `apps/backend/src/features/guidance/services/educationalKnowledgeBase.ts` delivering 5 comprehensive clinical guides with category filtering, reading time estimates, section breakdowns, key clinical takeaways, and peer-reviewed scientific citations.
  - **Recommendations REST API Endpoints:** Implemented `GET /api/v1/recommendations/current` (supporting dynamic query overrides `?diet=...&skinType=...`), `GET /api/v1/recommendations/education`, and `GET /api/v1/recommendations/education/:id` in `guidance.controller.ts` & `guidance.routes.ts`, persisted in Mongoose `Recommendation` collection.
  - **Mobile Personalized Guidance Screen & Route:** Built `PersonalizedGuidanceScreen.tsx` and Expo Router route `apps/mobile/app/guidance.tsx` with top navigation and offline-first fallback capability.
  - **Mobile Segmented Tab Navigation:** Implemented `SegmentedTabSelector.tsx` providing rapid switching between `[Nutrition]`, `[Sunlight]`, `[Exercise]`, and `[Learn]`.
  - **Mobile Diet Guidance Component:** Built `DietGuidanceCard.tsx` featuring diet switcher pills (Omnivore, Vegetarian, Vegan), daily target IU banner, high-bioavailability food cards with IU badges and absorption notes, and bone-mineral co-factor cards.
  - **Mobile Safe Sunlight Exposure Tracker:** Created `SunlightExposureTracker.tsx` featuring phototype pills (Types I–VI), optimal window cards, live animated circular SVG countdown timer (Start, Pause, Reset), and safe exposure completion alert banner advising shade or SPF 30+.
  - **Mobile Exercise Routines Component:** Built `ExerciseRoutinesView.tsx` displaying osteogenic mechanotransduction mechanisms, tailored symptom advisories, and expandable step-by-step instructions.
  - **Mobile Educational Knowledge Hub Component:** Built `EducationalHubView.tsx` with category filters and interactive full-screen reader modal.
  - **Results Screen & Dashboard Wiring:** Added "View Personalized Guidance &rarr;" primary CTA to `AssessmentResultScreen.tsx` and dashboard navigation link in `apps/mobile/app/index.tsx`.
  - **Automated Verification Suites (17 New Tests, 83 Total):** Created unit test suite `tests/unit/guidance.test.ts` (11 tests verifying `TC-REC-01`, `TC-REC-02`, monotonic phototype duration scaling, symptom filtering, and article completeness) and integration test suite `tests/integration/recommendations.test.ts` (6 tests asserting authentication, profile binding, query overrides, and 404 handling) with 100% pass rate (83/83 tests passing, clean mobile TypeScript verification).

---

## [0.5.0] — 2026-10-17

### Added
- **Phase 4 Implementation: Deterministic Risk Scoring & AI Explainer Engine:**
  - **Deterministic Scoring Rules & Weights Config:** Created `apps/backend/src/features/assessment/scoring/scoringRules.config.ts` establishing mathematical weights for symptom severity ($0–45$), solar deficit ($0–25$), dietary deficit ($0–20$), and medical multipliers ($0–10$).
  - **Core Deterministic Scoring Engine:** Implemented `DeterministicScoringEngine` in `apps/backend/src/features/assessment/scoring/deterministicScoring.engine.ts` calculating multi-factor composite risk scores ($0–100$), stratified risk tiers (`low`, `moderate`, `high`), and clinical consultation requirement flags with urgency markers (`routine_monitoring`, `recommended_within_2_weeks`, `urgent_medical_evaluation`).
  - **Risk Scoring Service Façade:** Created `RiskScoringService` in `apps/backend/src/features/assessment/services/riskScoringService.ts` unifying deterministic scoring and sub-score exports.
  - **AI Explainer Service (Google Gemini Flash Proxy):** Implemented `AiExplainerService` in `apps/backend/src/features/assessment/scoring/aiExplainer.service.ts` invoking the Google Gemini API with Zero-PHI sanitized clinical prompt engineering, strict anti-hallucination guardrails, and deterministic clinical rule fallback synthesis for offline resilience.
  - **Integrated Backend Assessment Flow:** Updated `AssessmentService.ts` to seamlessly compute deterministic scores with full demographic context (age, skin phototype, diet, medical conditions) and persist AI explanations.
  - **Mobile Circular SVG Risk Gauge:** Implemented `RiskScoreGauge.tsx` using `react-native-svg` featuring smooth cubic easing arc animation, glowing ambient backdrop, large centered score readout ($0–100$), and subscore progress indicators.
  - **Mobile Stratified Risk Level Badge:** Created `RiskLevelBadge.tsx` displaying glowing pill indicators with distinct icons for Low, Moderate, and High Risk tiers.
  - **Mobile Doctor Consultation Warning Banner:** Built `DoctorAlertBanner.tsx` featuring high-visibility clinical advisories, action timeline pills, serum 25(OH)D reference range education, and non-diagnostic disclaimers.
  - **Mobile AI Insights Synthesis Card:** Implemented `KeyContributorsCard.tsx` presenting synthesized plain-language summaries and structured primary contributor factor badges.
  - **Mobile Assessment Results Screen & Route:** Built `AssessmentResultScreen.tsx` and Expo Router route `apps/mobile/app/results.tsx` with instant transition from assessment completion and dashboard links.
  - **Comprehensive Scoring Engine Test Suite (36 Tests):** Created `apps/backend/tests/unit/scoring.test.ts` validating mandatory test cases `TC-SCORE-01` to `TC-SCORE-04`, PPT Slide 7 user profile ($62/100$, Moderate Risk), boundary transitions ($39 \to 40$, $69 \to 70$), clamping $[0, 100]$, and AI fallback logic with 100% pass rate (66/66 total backend tests passing).

---

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
