# REQUIREMENTS.md — System Requirements Specification (SRS)

> **Project:** VitaTrack — Self-Diagnosis & Guidance Platform for Vitamin D Deficiency  
> **Source Material:** Vivekananda Global University (VGU Jaipur) Academic Research Presentation (Satyam Kumar & Shilpi Shikha; Supervisor: Dr. Hoshiyar Singh)  
> **Classification:** Specification Tier (Phase 0)

---

## 1. PPT Extraction & Traceability Matrix

The table below maps each finding, objective, and proposed feature from the 9-slide academic presentation to formal system requirements:

| PPT Source Slide | Content & Topics in Presentation | System Requirement ID | Requirement Type | Status in Scope |
|:---|:---|:---|:---|:---|
| **Slide 2: Abstract & Problem** | Universal prevalence, lack of awareness, remote accessibility, early symptom detection | `FR-ASSESS-01`, `FR-AWARE-01` | Functional | Core Baseline |
| **Slide 3: Literature Review** | Clinical monitoring (Smith et al.), WHO nutritional deficiency studies, mobile health apps | `NFR-CLIN-01`, `FR-AWARE-02` | Non-Functional / Functional | Core Baseline |
| **Slide 4: Research Gap** | Dedicated Vitamin D detection, AI-based prediction, diet/sunlight advice, tracking, reminders | `FR-SCORE-01`, `FR-REC-01`, `FR-REMIND-01` | Functional | Core Baseline |
| **Slide 5: Objectives** | App design, symptom/lifestyle analysis, personalized advice, awareness, early medical consultation | `FR-ASSESS-02`, `FR-ALERT-01`, `FR-REC-02` | Functional | Core Baseline |
| **Slide 6: Methodology** | Step 1 Data Collection (symptoms, age, gender, sunlight, diet, history); Step 2 Data Processing (analysis, scoring, AI); Step 3 Recommendations (diet, exercise, sun, doctor alerts); Step 4 UI Design (easy nav, dashboard, tracking) | `FR-DATA-01` to `FR-DATA-05`, `FR-SCORE-02`, `FR-REC-03`, `FR-UI-01` | Functional | Core Baseline |
| **Slide 7: Results & Figures** | Sample User Analysis Table (Fatigue: High, Bone Pain: Moderate, Sunlight Exposure: Low $\to$ Risk: Medium); Progress monitoring, Report generation | `FR-SCORE-03`, `FR-HIST-01`, `FR-REPORT-01` | Functional | Core Baseline |
| **Slide 8: Future Scope** | Wearable device integration, real-time monitoring, ML enhancement, multi-language, cloud patient records, doctor appointment booking | `FR-WEAR-01`, `FR-ML-02`, `PROP-LANG-01`, `PROP-DOC-01` | Functional / Future | Phased Allocation |
| **Slide 9: References** | WHO Reports, Vit D Papers, Mobile Healthcare Studies, AI Journals | `NFR-CLIN-02` | Non-Functional | Reference Baseline |

---

## 2. Functional Requirements (FR)

### 2.1 User Onboarding & Profile Management
- **FR-AUTH-01: User Registration & Authentication**
  - *Description:* The system shall allow users to securely register with an email address and strong password, log in, refresh authentication tokens, and request password resets.
  - *Priority:* P0 (Must Have)
  - *Source:* Standard architecture requirement.
- **FR-PROF-01: Demographic & Biological Baseline Profile**
  - *Description:* The system shall capture baseline parameters: Age, Biological Sex, Geographic Region (for solar irradiance estimates), Fitzpatrick Skin Phototype (Types I–VI), and Dietary Orientation (Omnivore, Vegetarian, Vegan).
  - *Priority:* P0 (Must Have)
  - *Source:* PPT Slide 6 (Step 1 Data Collection).
- **FR-PROF-02: Medical & Medication History**
  - *Description:* The system shall capture pre-existing conditions known to affect Vitamin D metabolism (Malabsorption syndromes, Celiac disease, Crohn's, Chronic Kidney/Liver disease, Obesity) and medications (Anticonvulsants, Glucocorticoids).
  - *Priority:* P1 (Should Have)
  - *Source:* PPT Slide 6 (Step 1 Data Collection - Medical History).

### 2.2 Clinical Self-Assessment Questionnaire
- **FR-ASSESS-01: Multi-Dimensional Questionnaire Ingestion**
  - *Description:* The system shall present an interactive assessment evaluating:
    1. *Symptoms:* Severity of fatigue, generalized bone pain, muscle weakness/cramps, low mood/depressive tendencies, frequent respiratory infections.
    2. *Solar Exposure:* Average daily minutes outdoors, typical time of day (10:00–15:00 vs early morning/evening), skin surface exposed (arms, legs, face), and routine sunscreen usage SPF $\ge 30$.
    3. *Dietary Habits:* Weekly intake frequencies of oily fish (salmon, mackerel), fortified dairy/plant milk, egg yolks, UV-exposed mushrooms, and fortified cereals.
  - *Priority:* P0 (Must Have)
  - *Source:* PPT Slide 6 & Slide 7.
- **FR-ASSESS-02: In-Progress Draft Preservation**
  - *Description:* The mobile client shall cache uncompleted assessment responses locally so users can resume without losing entered data if interrupted.
  - *Priority:* P2 (Nice to Have)
  - *Source:* Proposed Enhancement.

### 2.3 Risk Scoring & AI Diagnostic Support
- **FR-SCORE-01: Transparent Deterministic Risk Engine**
  - *Description:* The backend shall compute a weighted risk score ($0–100$) based on symptom severity, solar deficit, dietary insufficiency, and medical risk multipliers, stratifying into:
    - **Low Risk (0–39):** Deficiency unlikely; maintenance guidance recommended.
    - **Moderate Risk (40–69):** Elevated risk of insufficiency; lifestyle modifications and non-urgent clinical test advised.
    - **High Risk (70–100):** Substantial probability of clinical deficiency; immediate doctor consultation recommended.
  - *Priority:* P0 (Must Have)
  - *Source:* PPT Slide 6 (Step 2) & Slide 7 (Sample User Analysis Table).
- **FR-SCORE-02: AI-Powered Natural Language Explanation**
  - *Description:* The system shall generate a safe, plain-language summary of the primary contributors to the user's score using an AI explainer module, without making speculative medical diagnoses.
  - *Priority:* P1 (Should Have)
  - *Source:* PPT Slide 4 & Slide 7 ("AI-powered diagnosis support").
- **FR-ALERT-01: Doctor Consultation Alerts & Disclaimers**
  - *Description:* The system shall trigger a prominent, non-dismissible clinical consultation advisory whenever an assessment yields a `Moderate` or `High` risk level, or flags critical symptoms.
  - *Priority:* P0 (Must Have)
  - *Source:* PPT Slide 5 (Objective 5) & Slide 6 (Step 3).

### 2.4 Personalized Recommendations
- **FR-REC-01: Tailored Nutritional Suggestions**
  - *Description:* The system shall generate diet plans customized to the user's dietary preferences (Omnivore, Vegetarian, Vegan), emphasizing rich sources of Vitamin D3/D2, Calcium, Magnesium, and Vitamin K2 co-factors.
  - *Priority:* P0 (Must Have)
  - *Source:* PPT Slide 6 (Step 3) & Slide 7.
- **FR-REC-02: Safe Sunlight Exposure Protocol**
  - *Description:* The system shall calculate personalized daily sun exposure windows (e.g., 15–25 minutes midday for Fitzpatrick Type III) factoring in local UV index guidelines to maximize Vitamin D synthesis while guarding against erythema/sunburn.
  - *Priority:* P0 (Must Have)
  - *Source:* PPT Slide 6 (Step 3).
- **FR-REC-03: Exercise & Musculoskeletal Guidance**
  - *Description:* The system shall recommend weight-bearing physical activities and resistance exercises suited to the user's fitness level to support bone mineral density.
  - *Priority:* P1 (Should Have)
  - *Source:* PPT Slide 6 (Step 3).

### 2.5 Progress Tracking, History & Health Reports
- **FR-HIST-01: Longitudinal Assessment History & Trend Analysis**
  - *Description:* The system shall store chronological assessment results and display visual trend charts of score changes over weeks and months.
  - *Priority:* P1 (Should Have)
  - *Source:* PPT Slide 6 (Step 4) & Slide 7 ("Progress monitoring").
- **FR-REPORT-01: Clinician-Ready Health Report Generation**
  - *Description:* The mobile app shall compile assessment results, symptom logs, lifestyle factors, and wearable metrics into an exportable, formatted PDF document designed for sharing with a physician.
  - *Priority:* P1 (Should Have)
  - *Source:* PPT Slide 7 ("Health report generation").

### 2.6 Proactive Reminders & Notifications
- **FR-REMIND-01: Daily Sunlight & Lifestyle Reminders**
  - *Description:* The app shall schedule local daily notifications alerting users to take their recommended sun exposure breaks and maintain nutrient-rich meal habits.
  - *Priority:* P1 (Should Have)
  - *Source:* PPT Slide 4 & Slide 7 ("Daily sunlight reminders").
- **FR-REMIND-02: Periodic Re-assessment Prompts**
  - *Description:* The system shall schedule bi-weekly or monthly prompts nudging the user to complete a follow-up assessment to track recovery or symptom progression.
  - *Priority:* P2 (Nice to Have)
  - *Source:* Proposed Enhancement.

### 2.7 Smartwatch & Wearable Integration
- **FR-WEAR-01: Android Health Connect Biometric Ingestion**
  - *Description:* The mobile app shall query Android Health Connect for available biometric data: Daily Step Count, Active Calories, Resting Heart Rate, Blood Oxygen Saturation (SpO₂), and Sleep Duration/Stages.
  - *Priority:* P1 (Should Have)
  - *Source:* PPT Slide 8 (Future Scope - "Integration with wearable devices").
- **FR-WEAR-02: Wearable Sync Status & Graceful Degradation**
  - *Description:* The app shall display the sync status and timestamp of wearable metrics. If Health Connect is unavailable or unsupported on the device, all self-assessment features must remain 100% functional without error.
  - *Priority:* P0 (Must Have)
  - *Source:* System Reliability Requirement.

### 2.8 Technical Administration Portal
- **FR-ADMIN-01: Infrastructure Health & Error Telemetry**
  - *Description:* The admin portal shall display real-time backend operational metrics: HTTP status codes (2xx, 4xx, 5xx), average endpoint latency, MongoDB connection pool status, and server CPU/memory.
  - *Priority:* P1 (Should Have)
  - *Source:* Technical Maintenance Requirement.
- **FR-ADMIN-02: Macro Aggregated App Analytics**
  - *Description:* The admin portal shall display aggregate metrics only (Total Registered Users, Daily Active Users, Total Completed Assessments).
  - *Priority:* P1 (Should Have)
  - *Source:* Operational Requirement.

---

## 3. Non-Functional Requirements (NFR)

### 3.1 Security & Privacy
- **NFR-SEC-01 (Authentication Security):** All API communication must be encrypted via TLS 1.3. User passwords must be hashed with bcrypt (cost factor $\ge 12$). Session tokens must follow JWT standards with short-lived access tokens (15 minutes) and rotating refresh tokens (7 days).
- **NFR-SEC-02 (Mobile Token Storage):** Tokens and user identity secrets must be stored strictly in hardware-backed storage (`Expo SecureStore` / Android Keystore).
- **NFR-PRIV-01 (Strict Zero-PHI Admin Isolation):** The admin portal must have zero access to individual patient records, symptom entries, assessment scores, health reports, or wearable biometrics. All administrative queries must operate strictly on aggregate datasets ($N \ge 10$) or technical system logs.
- **NFR-PRIV-02 (Log Sanitization):** Application server logs must systematically scrub request headers, passwords, and any body containing symptom or medical data.

### 3.2 Clinical Reliability & Safety
- **NFR-CLIN-01 (Diagnostic Boundary Disclaimer):** Every user screen displaying an assessment score, lifestyle tip, or report must feature a clear legal/medical disclaimer: *"VitaTrack is a self-assessment screening tool and does not provide medical diagnoses. Consult a qualified doctor for clinical evaluation and serum testing."*
- **NFR-CLIN-02 (Deterministic Reproducibility):** The core scoring algorithm must be 100% deterministic: identical assessment input payloads must always yield the exact same numerical score and risk tier.

### 3.3 Performance & Responsiveness
- **NFR-PERF-01 (API Latency):** 95% of standard REST API requests (assessments, profile, history) must respond within $\le 300\text{ ms}$ under normal network conditions.
- **NFR-PERF-02 (Mobile Fluidity):** Mobile UI transitions must maintain 60 frames per second (FPS), with zero UI blocking during background network sync or PDF generation.

### 3.4 Availability & Offline Resilience
- **NFR-AVAIL-01 (Offline First Experience):** The mobile application must allow users to view educational material, inspect past cached reports, and fill out assessment drafts without active internet connectivity. Responses must sync automatically once a network connection is re-established.

---

## 4. Proposed Features vs. PPT Scope Distinctions

To ensure academic and technical transparency, the table below highlights items explicitly covered in the presentation vs. proposed engineering extensions:

| Topic | PPT Explicit Specification | Proposed Engineering Specification |
|:---|:---|:---|
| **Risk Scoring** | Slide 6 & 7: "Symptom analysis, risk scoring, AI-based evaluation; Sample Table (Fatigue: High, Bone Pain: Moderate, Sun: Low $\to$ Risk: Medium)" | Weighted 0–100 mathematical model detailed in [ARCHITECTURE.md](file:///e:/VitaTrack/ARCHITECTURE.md) and [API_SPEC.md](file:///e:/VitaTrack/API_SPEC.md). |
| **Wearable Metrics** | Slide 8: Listed broadly under Future Scope ("Integration with wearable devices, real-time health monitoring"). | Specified explicitly for Android Health Connect (Heart Rate, SpO₂, Sleep, Steps) with explicit compatibility limits in [SMARTWATCH_INTEGRATION.md](file:///e:/VitaTrack/SMARTWATCH_INTEGRATION.md). |
| **Admin Dashboard** | Not mentioned in PPT. | Proposed for technical uptime and aggregate metrics only, with strict Zero-PHI boundaries detailed in [ADMIN_DASHBOARD.md](file:///e:/VitaTrack/ADMIN_DASHBOARD.md). |
| **Monetization / Ads**| Not mentioned in PPT. | Proposed as a future, deferred plan in [ADVERTISING_PLAN.md](file:///e:/VitaTrack/ADVERTISING_PLAN.md) — strictly blocked from early implementation. |

---

## 5. Open Technical Questions & Clarifications

1. **Question 1 (AI Provider Selection):** Which LLM provider (Google Gemini API, OpenAI, or local on-device small language model) is preferred for the plain-language AI explanation feature in Phase 4?  
   *Current Proposal:* Standardize on Google Gemini 1.5 Flash via a backend proxy for optimal latency, cost-efficiency, and clinical data safety.
2. **Question 2 (Weather & UV Index Data Source):** Should safe sunlight exposure calculations dynamically fetch real-time local UV Index from an open meteorological API (e.g., Open-Meteo), or rely on user manual latitude/season selection?  
   *Current Proposal:* Use device approximate location with Open-Meteo API fallback, with manual override available.
3. **Question 3 (PDF Sharing Destination):** Should clinician reports support direct encrypted email dispatch, or remain restricted to native OS share sheet (WhatsApp, Email, Print)?  
   *Current Proposal:* Use native OS share sheet via `expo-sharing` to preserve user privacy and avoid server-side email exposure.
