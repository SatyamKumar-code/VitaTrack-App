# PROJECT_PLAN.md — Multi-Phase Implementation Roadmap & Engineering Strategy

> **Project:** VitaTrack — Self-Diagnosis & Guidance Platform for Vitamin D Deficiency  
> **Methodology:** Multi-Phase Spec-First Incremental Delivery  
> **Status:** Phase 0 Completed | Phases 1–10 + Future Phase Pending Authorization

---

## 1. Project Phase Breakdown & Roadmap

```mermaid
gantt
    title VitaTrack Multi-Phase Engineering Roadmap
    dateFormat  YYYY-MM-DD
    section Specification
    Phase 0: Architecture & Complete Documentation :done, p0, 2026-10-17, 1d
    section Core Infrastructure
    Phase 1: Project Foundation & Tooling Setup   :active, p1, after p0, 3d
    Phase 2: Authentication, Security & Profiles  :p2, after p1, 4d
    section Assessment Engine
    Phase 3: Clinical Questionnaire Engine       :p3, after p2, 4d
    Phase 4: Risk Scoring & AI Evaluation Engine  :p4, after p3, 4d
    section Health Guidance
    Phase 5: Diet, Sunlight & Exercise Guidance  :p5, after p4, 3d
    Phase 6: Progress Tracking & PDF Reports     :p6, after p5, 4d
    Phase 7: Reminders & Notification System     :p7, after p6, 3d
    section Wearable & Admin
    Phase 8: Smartwatch Integration (Health Connect):p8, after p7, 5d
    Phase 9: Technical Admin Dashboard (Zero-PHI) :p9, after p8, 4d
    section Hardening & Release
    Phase 10: Hardening, Security, E2E & EAS Android Release :p10, after p9, 5d
    section Future Horizons
    Future: Privacy-Preserving Advertising System :p11, after p10, 5d
```

---

## 2. Detailed Phase Specifications

### Phase 0: Requirements, Clinical Mapping & System Documentation
- **Objective:** Establish an exhaustive, AI-readable, clinically sound, and architecturally verified Markdown specification framework before a single line of application source code is written.
- **Key Deliverables:** All 20 designated `.md` files covering architecture, database schemas, REST APIs, UI/UX specs, security rules, and test plans.
- **Entry Criteria:** Presentation deck analyzed; academic literature and WHO guidance digested.
- **Exit Criteria:** All 20 `.md` files created, reviewed, verified for internal consistency, and committed.
- **Current Status:** **COMPLETED** (October 17, 2026).

---

### Phase 1: Project Foundation, Tooling & Environment Configuration
- **Objective:** Scaffold the monorepo structure containing the React Native (Expo) mobile client, Node.js/Express backend service, and React admin dashboard shell using a **strict feature-based (vertical slice) folder structure**, including linting, TypeScript configurations, and containerization.
- **Scope & Deliverables:**
  - `apps/mobile`: Expo project initialized with TypeScript, Expo Router, and feature-based folders under `src/features/` (`auth`, `assessment`, `scoring`, `guidance`, `wearables`, `reports`, `reminders`).
  - `apps/backend`: Express application initialized with TypeScript, nodemon, Jest, and feature-based modules under `src/features/` (`auth`, `assessment`, `guidance`, `wearables`, `reminders`, `admin`) plus `src/core/`.
  - `apps/admin`: React + Vite + Tailwind CSS shell structured under `src/features/` (`auth`, `health`, `telemetry`, `analytics`, `audit`).
  - Root `package.json` with npm workspaces or turbo pipeline.
  - Docker Compose configuration for local MongoDB replica set.
  - Environment variable schema templates (`.env.example`).
- **Prerequisites:** Phase 0 approved.
- **Exit Criteria:** Mobile app launches to splash screen in Expo Go; backend responds to `/health` endpoint; MongoDB connects successfully; admin shell renders; feature-based directory layouts verified.

---

### Phase 2: Authentication Engine, Security Vault & User Profile
- **Objective:** Deliver secure, JWT-based user authentication, role separation, profile attributes (age, biological sex, baseline lifestyle, Fitzpatrick skin type, medical history flags), and encrypted local token storage.
- **Scope & Deliverables:**
  - Backend: Registration, login, password reset, token refresh rotation, and profile CRUD endpoints.
  - Database: User collection with bcrypt password hashing and field indexing.
  - Mobile UI: Onboarding carousel, Login, Sign Up, Forgot Password, and Profile Setup screens.
  - Storage: Integration with `expo-secure-store` for access and refresh tokens.
- **Prerequisites:** Phase 1 complete.
- **Exit Criteria:** User can register, log in, persist session securely across app reboots, and manage baseline profile data.

---

### Phase 3: Clinical Self-Assessment Questionnaire & Interactive Engine
- **Objective:** Build the interactive, multi-step clinical assessment questionnaire capturing symptoms, solar habits, diet patterns, and risk factors as defined in the VGU study methodology.
- **Scope & Deliverables:**
  - Multi-step wizard UI with intuitive sliders, cards, and micro-animations.
  - Symptom tracking: Fatigue, bone pain, muscle weakness, mood changes, recurrent infections.
  - Sunlight input: Average daily outdoor minutes, clothing coverage, sunscreen use, time of day.
  - Diet input: Intake of fatty fish, fortified milk, egg yolks, mushrooms, vegetarian/vegan lifestyle.
  - Draft state saving in SQLite / AsyncStorage for interrupted assessments.
- **Prerequisites:** Phase 2 complete.
- **Exit Criteria:** Assessment flow navigates smoothly across all question steps, validates inputs, and submits completed survey to the backend API.

---

### Phase 4: Risk Scoring Engine & AI Insight Synthesis
- **Objective:** Implement the transparent, deterministic clinical risk-scoring algorithm alongside an AI-assisted diagnostic evaluation service for plain-language explanations.
- **Scope & Deliverables:**
  - Deterministic Scoring Algorithm: Weighted multi-parameter matrix calculating a numerical score (0–100) and stratified risk level (`Low`, `Moderate`, `High`).
  - Clinical Consultation Trigger: Mandatory doctor evaluation alert triggered for `Moderate` and `High` outcomes.
  - AI Explainer Service: Secure backend LLM integration summarizing risk drivers without hallucinating medical claims.
  - Mobile Results Screen: Circular animated risk gauge, breakdown of primary risk contributors, and clear disclaimer banners.
- **Prerequisites:** Phase 3 complete.
- **Exit Criteria:** Test suite validates all deterministic score calculations against reference test vectors; mobile displays clear risk stratification and medical consultation alerts.

---

### Phase 5: Personalized Nutritional, Solar Exposure & Exercise Guidance
- **Objective:** Deliver tailored lifestyle recommendations based on the user's specific assessment profile, dietary restrictions, and geographic/seasonal factors.
- **Scope & Deliverables:**
  - Dietary Recommendation Subsystem: Dynamic meal suggestions for omnivore, vegetarian, and vegan users highlighting bioavailable Vitamin D and co-factors (Magnesium, Vitamin K2).
  - Safe Sunlight Calculator: Personalized outdoor duration recommendation calculated using UV index principles and skin phototype to prevent sunburn.
  - Exercise Subsystem: Weight-bearing and outdoor physical activity guides supporting bone density.
  - Educational Knowledge Base: In-app articles explaining Vitamin D synthesis and physiological functions.
- **Prerequisites:** Phase 4 complete.
- **Exit Criteria:** Tailored guidance correctly adapts to user dietary preferences and risk levels; safe sunlight advisory clearly prevents hazardous midday overexposure.

---

### Phase 6: Longitudinal Assessment History, Trend Analytics & PDF Health Reports
- **Objective:** Enable users to visualize their health progression over time and generate clinician-ready PDF summaries to share with their healthcare provider.
- **Scope & Deliverables:**
  - Assessment History Dashboard: Chronological list and interactive trend charts of past scores.
  - Progress Tracking: Visual comparison between historical assessments and symptom changes.
  - PDF Generation Engine: Clean, printable PDF health report containing assessment breakdown, wearable summary, disclaimer, and note for attending physician.
  - Mobile Export: Integration with `expo-sharing` and `expo-print` for saving/sharing PDFs.
- **Prerequisites:** Phase 5 complete.
- **Exit Criteria:** User can inspect previous assessment records, view trend graphs, and export/share an accurate PDF report.

---

### Phase 7: Context-Aware Reminders & Notification System (Completed)
- **Objective:** Implement a proactive notification and scheduling system that keeps users engaged with safe sunlight exposure, nutrient intake, and periodic reassessments.
- **Scope & Deliverables:**
  - Daily Sunlight Alerts: Time-scheduled notifications prompting optimal morning/afternoon sun exposure.
  - Dietary Reminders: Notifications for balanced nutrient intake and physician-prescribed supplements.
  - Re-assessment Prompts: Bi-weekly or monthly prompts to evaluate symptom changes.
  - Technology: `expo-notifications` for scheduled local notifications and backend push triggers via Expo Push Service.
- **Prerequisites:** Phase 6 complete.
- **Exit Criteria:** Notifications schedule locally on the device, fire reliably at specified times, and respect user notification preferences.

---

### Phase 8: Smartwatch & Wearable Ingestion (Android Health Connect)
- **Objective:** Integrate with Android Health Connect to ingest supported biometric metrics (resting heart rate, SpO₂, sleep duration/stages, steps) to enrich lifestyle analysis.
- **Scope & Deliverables:**
  - Android Health Connect permission flow and data sync client.
  - Biometric ingestion pipeline: Resting Heart Rate, SpO₂, Sleep Duration, Step Count.
  - Wearable Sync Status UI: Connection indicators, last synced timestamp, metric cards.
  - Fallback mechanisms for devices lacking Health Connect or specific sensors.
- **Prerequisites:** Phase 7 complete.
- **Exit Criteria:** App requests only authorized Health Connect permissions, safely pulls available data, and gracefully handles devices where wearable data is unavailable.

---

### Phase 9: Technical Admin Monitoring Dashboard (Zero-PHI Operations Portal)
- **Objective:** Build a web-based administration and telemetry portal for infrastructure health, API performance, error tracking, and macro-level aggregate usage.
- **Scope & Deliverables:**
  - React + Tailwind CSS dashboard with role-based authentication.
  - System Telemetry: API latency, 4xx/5xx error rates, database connection pool status, server CPU/memory.
  - Aggregate Analytics: Total registered users, Daily Active Users (DAU), aggregate assessment count ($N \ge 10$).
  - Strict Zero-PHI Boundary: Absolute exclusion of individual user records, symptoms, risk results, or health data.
- **Prerequisites:** Phase 8 complete.
- **Exit Criteria:** Admin dashboard renders technical performance graphs and aggregate stats; security audit confirms zero individual health records are accessible via admin APIs.

---

### Phase 10: Security Audit, Hardening, E2E Testing & EAS Android Release
- **Objective:** Finalize production hardening, conduct privacy audits, execute end-to-end regression tests, and assemble the release build using EAS for Android.
- **Scope & Deliverables:**
  - Security hardening: Rate limiting, OWASP Top 10 mitigations, helmet headers, input sanitation.
  - Complete E2E test runs across mobile workflows.
  - Expo EAS Build configuration for signed Android `.aab` (Google Play production) and standalone `.apk` (testing).
  - Production deployment documentation and disaster recovery checklist.
- **Prerequisites:** Phase 9 complete.
- **Exit Criteria:** 100% test pass rate across unit and integration suites; security scan reports zero high/critical vulnerabilities; EAS build generates valid Android installable bundle.

---

### Future Phase: Privacy-Preserving Ethical Advertising (Deferred)
- **Objective:** Formulate an ethical, privacy-preserving monetization framework strictly adhering to medical app standards.
- **Scope & Deliverables:**
  - Non-targeted, contextual health ads (certified lab testing services, certified Vitamin D supplements).
  - Explicit user opt-in consent and ad-free premium tier options.
  - Zero sharing of assessment scores, symptoms, or personal data with advertising networks.
- **Prerequisites:** Phase 10 deployed and explicit user authorization granted.
- **Exit Criteria:** Ethical review sign-off and strict technical isolation verified.

---

## 3. Dependency & Risk Management Matrix

| Risk Event | Severity | Probability | Mitigation Strategy |
|------------|----------|-------------|---------------------|
| Health Connect API unavailable on older Android OS (< Android 9) | Medium | High | Graceful degradation; display informational badge and continue full functionality using manual self-assessments. |
| User misinterprets self-assessment as clinical blood test | High | Medium | Prominent clinical disclaimer banners, persistent doctor consultation alerts, and explicit educational copy across results screens. |
| Overexposure to UV radiation caused by misapplied sunlight guidance | High | Low | Conservative sunlight recommendations; strict incorporation of UV index limits, Fitzpatrick skin typing, and sunburn warning advisories. |
| PII / PHI leak into technical logs or admin dashboard | Critical | Low | Strict Winston logger sanitization filter, zero-PHI admin API architecture, and automated integration test asserting zero health fields in admin responses. |
| EAS Android build failure due to native module incompatibility | Medium | Medium | Maintain standard Expo config plugins, isolate native wearable code to vetted Health Connect libraries, and test development builds early. |
