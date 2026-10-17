# DECISIONS.md — Architecture Decision Records (ADR)

> **Standard:** Michael Nygard ADR Format  
> **Project:** VitaTrack — Self-Diagnosis & Guidance Platform for Vitamin D Deficiency  
> **Status:** Phase 0 Approved Architectural Decisions

---

## Index of Architecture Decision Records

- [ADR-001: Mobile Client Framework Selection (React Native + Expo SDK)](#adr-001-mobile-client-framework-selection)
- [ADR-002: Backend Runtime & Architecture (Node.js + Express + TypeScript)](#adr-002-backend-runtime--architecture)
- [ADR-003: Persistence Layer Selection (MongoDB with Mongoose ODM)](#adr-003-persistence-layer-selection)
- [ADR-004: Unified Wearable Integration via Android Health Connect](#adr-004-unified-wearable-integration-via-android-health-connect)
- [ADR-005: Two-Tier Risk Engine: Deterministic Formula + AI Explainer](#adr-005-two-tier-risk-engine)
- [ADR-006: Strict Zero-PHI Boundary for Admin Operations Portal](#adr-006-strict-zero-phi-boundary-for-admin-operations-portal)
- [ADR-007: Deferment of Advertising Subsystem to Future Explicit Phase](#adr-007-deferment-of-advertising-subsystem)
- [ADR-008: Client-Side Clinician PDF Generation via `expo-print`](#adr-008-client-side-clinician-pdf-generation)
- [ADR-009: Feature-Based (Vertical Slice) Directory Organization](#adr-009-feature-based-directory-organization)

---

### ADR-001: Mobile Client Framework Selection
- **Status:** Accepted
- **Context:** VitaTrack requires cross-platform mobile delivery with first-class Android support, rapid iteration, native hardware sensor access, and smooth 60 FPS animations.
- **Decision:** Use **React Native with Expo SDK (52+)** and **Expo Router** (file-based routing) written strictly in TypeScript.
- **Consequences:**
  - *Positive:* Unified TypeScript codebase, streamlined build pipeline via Expo EAS, native module support via Expo Config Plugins, robust file-based navigation.
  - *Negative:* Native Health Connect integration requires building custom development clients via EAS rather than vanilla Expo Go.

---

### ADR-002: Backend Runtime & Architecture
- **Status:** Accepted
- **Context:** The backend must handle secure user authentication, deterministic risk scoring, input validation, and telemetry ingestion with low latency.
- **Decision:** Build the backend using **Node.js LTS (v20+), Express, and TypeScript** structured in a layered modular architecture (`controllers`, `services`, `models`, `middlewares`, `validators`).
- **Consequences:**
  - *Positive:* High I/O throughput, vast ecosystem of security/validation libraries (Zod, bcrypt, helmet, rate-limit), shared TypeScript types with mobile frontend.
  - *Negative:* Express is unopinionated; strict architectural conventions must be documented and enforced.

---

### ADR-003: Persistence Layer Selection
- **Status:** Accepted
- **Context:** VitaTrack stores dynamic questionnaire payloads, evolving lifestyle recommendations, time-series wearable biometric records, and operational telemetry.
- **Decision:** Select **MongoDB 7.0+ with Mongoose ODM**.
- **Consequences:**
  - *Positive:* Native JSON/BSON document model matches nested assessment data; flexible schema evolution as research introduces new clinical parameters; native TTL indexing for automatic log rotation.
  - *Negative:* Complex relational queries require careful indexing and reference management.

---

### ADR-004: Unified Wearable Integration via Android Health Connect
- **Status:** Accepted
- **Context:** Wearable devices in Android are heavily fragmented across Samsung Health, Google Pixel Watch/Fitbit, Garmin, and others. Writing separate proprietary BLE or cloud SDKs for each manufacturer is fragile, privacy-invasive, and maintenance-heavy.
- **Decision:** Standardize on **Android Health Connect (`androidx.health.connect`)** as the single OS-level abstraction broker.
- **Consequences:**
  - *Positive:* Standardized Android OS permission model; zero direct BLE handling; privacy compliant; automatically supports any smartwatch manufacturer syncing to Health Connect (Samsung, Pixel Watch, Garmin).
  - *Negative:* Devices running Android $< 9$ or budget RTOS trackers lacking Health Connect integration cannot sync automatically (graceful degradation required).

---

### ADR-005: Two-Tier Risk Engine: Deterministic Formula + AI Explainer
- **Status:** Accepted
- **Context:** Relying solely on a generative AI model (LLM) for medical risk scoring introduces dangerous non-determinism, hallucinations, and clinical unpredictability. Conversely, static rule engines lack empathetic, personalized plain-language explanations.
- **Decision:** Implement a **Two-Tier Engine**:
  1. *Tier 1 (Deterministic Core):* A weighted mathematical scoring formula ($0–100$) computes the exact score, risk tier, and doctor consultation trigger.
  2. *Tier 2 (AI Explainer):* Google Gemini AI receives only the pre-computed sub-scores and synthesized risk factors to generate an empathetic, plain-language patient summary.
- **Consequences:**
  - *Positive:* 100% reproducible and verifiable clinical risk scoring; safe AI summaries without clinical hallucination risk.
  - *Negative:* Requires managing two distinct services (scoring logic + LLM proxy).

---

### ADR-006: Strict Zero-PHI Boundary for Admin Operations Portal
- **Status:** Accepted
- **Context:** System administrators and DevOps engineers require technical visibility into backend uptime, error logs, and macro performance. However, exposing patient symptoms, risk scores, or biometrics to admins violates ethical guidelines and data privacy regulations (DPDP Act, HIPAA).
- **Decision:** Enforce an **inviolable Zero-PHI architectural firewall**. Admin APIs and UI screens are strictly prohibited from querying or displaying individual health data. Only macro aggregates ($N \ge 10$) and scrubbed technical error logs are permitted.
- **Consequences:**
  - *Positive:* Complete regulatory compliance, zero risk of internal patient data snooping, minimal attack surface.
  - *Negative:* Admins cannot troubleshoot user-reported issues by viewing raw questionnaire records; debugging must rely on client-side error codes.

---

### ADR-007: Deferment of Advertising Subsystem to Future Explicit Phase
- **Status:** Accepted
- **Context:** In-app advertising in a clinical self-assessment platform can erode patient trust, compromise privacy, and distract from core health guidance.
- **Decision:** Completely exclude advertising dependencies, SDKs, and endpoints from Phases 0 through 10. Document future ethical monetization in [ADVERTISING_PLAN.md](file:///e:/VitaTrack/ADVERTISING_PLAN.md) and defer implementation until explicitly authorized.
- **Consequences:**
  - *Positive:* Clean, trusted, ad-free patient experience during development and clinical validation; zero risk of ad tracker privacy violations.
  - *Negative:* Monetization through advertising is postponed.

---

### ADR-008: Client-Side Clinician PDF Generation via `expo-print`
- **Status:** Accepted
- **Context:** Generating clinician-ready PDF summaries on the backend using headless browsers (Puppeteer) consumes significant server RAM/CPU and requires transmitting sensitive health records to a rendering queue.
- **Decision:** Perform PDF compilation **directly on the client device** using `expo-print` (HTML to PDF rendering) and share via native OS share sheet using `expo-sharing`.
- **Consequences:**
  - *Positive:* Zero server rendering load; zero storage of generated PDFs in cloud databases; maximum privacy as the PDF remains in local device memory until user shares it.
  - *Negative:* PDF rendering speed depends on mobile device CPU performance.

---

### ADR-009: Feature-Based (Vertical Slice) Directory Organization
- **Status:** Accepted
- **Context:** Organizing code purely by technical layers (all controllers in one place, all models in another, all components in another) leads to excessive cross-directory jumping, tight coupling, and difficulty in isolating feature changes during phased development.
- **Decision:** Adopt a **Feature-Based (Feature-First / Vertical Slice)** folder structure across `apps/mobile`, `apps/backend`, and `apps/admin`.
  - In `apps/mobile`: Business domain logic is grouped under `src/features/{auth, assessment, scoring, guidance, wearables, reports, reminders}/`, while Expo Router routes in `app/` serve as thin navigational wrappers.
  - In `apps/backend`: Each domain is encapsulated under `src/features/{auth, assessment, guidance, wearables, reminders, admin}/` containing its own controllers, services, models, routes, and validation schemas, with common code isolated in `src/core/`.
  - In `apps/admin`: Modules are grouped under `src/features/{auth, health, telemetry, analytics, audit}/`.
- **Consequences:**
  - *Positive:* High cohesion, low coupling, easier incremental phase-by-phase implementation and testing, clean deletion or refactoring of features, improved cognitive clarity for developers and AI agents.
  - *Negative:* Cross-cutting utilities and shared types must be maintained disciplined in designated `shared/` or `core/` directories.

