# UI_UX_SPEC.md — Mobile UI/UX Design System & Screen Specifications

> **Platform:** React Native (Expo SDK 52+) with Expo Router  
> **Aesthetic Philosophy:** Clinical Precision meets Energizing Warmth (Solar Amber & Clinical Slate)  
> **Typography:** Inter & Outfit (Modern Geometric Sans)

---

## 1. Visual Design System & Design Tokens

VitaTrack's aesthetic combines the trustworthy authority of a clinical application with the warm, energizing optimism of solar wellness.

### 1.1 Curated Color Palette

```mermaid
graph LR
    subgraph Primary Solar Palette [Warmth & Synthesis]
        C1[Amber Sunlight<br/>#F59E0B / HSL 38, 92%, 50%]
        C2[Solar Dawn Orange<br/>#EA580C / HSL 21, 90%, 48%]
    end

    subgraph Clinical Authority Palette [Trust & Health]
        C3[Clinical Slate Dark<br/>#0F172A / HSL 222, 47%, 11%]
        C4[Deep Medical Teal<br/>#0D9488 / HSL 175, 84%, 32%]
    end

    subgraph Status & Clinical Alerts [Risk Stratification]
        S1[Low Risk / Safe: Emerald<br/>#10B981]
        S2[Moderate Risk: Amber<br/>#F59E0B]
        S3[High Risk / Clinical Alert: Crimson<br/>#EF4444]
    end
```

- **Light Mode Surface:** `#F8FAFC` (Slate 50)
- **Dark Mode Surface:** `#0B0F19` (Deep Midnight Blue)
- **Glassmorphism Card Effect:** `rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(12px)` and subtle border `rgba(255, 255, 255, 0.2)`.

### 1.2 Typography Hierarchy
- **Display 1 (Results & Scores):** Outfit Bold, 36sp, line-height 44sp.
- **Heading 1 (Screen Titles):** Outfit SemiBold, 24sp, line-height 32sp.
- **Heading 2 (Card Headers):** Inter SemiBold, 18sp, line-height 24sp.
- **Body Regular:** Inter Regular, 15sp, line-height 22sp.
- **Caption & Disclaimers:** Inter Medium, 12sp, line-height 16sp, muted slate `#64748B`.

---

## 2. Navigation Architecture & Screen Hierarchy

```mermaid
flowchart TD
    subgraph Onboarding & Auth Flow [Expo Router: /auth]
        ONB[Onboarding Slides] --> LOGIN[Login Screen]
        ONB --> SIGNUP[Sign Up Screen]
        LOGIN --> FORGOT[Forgot Password]
    end

    subgraph Main Bottom Tab Navigator [Expo Router: /(tabs)]
        HOME[Home Dashboard]
        ASSESS[Assessment Wizard]
        GUIDE[Personalized Guidance]
        WEAR[Wearable Sync]
        HIST[History & Reports]
    end

    subgraph Modal & Detail Stacks [Expo Router: /modals]
        RES[Assessment Results & Risk Gauge]
        PDF[Clinician PDF Report Viewer]
        SETTINGS[Profile & Privacy Settings]
        SUN_TIMER[Live Sunlight Exposure Timer]
    end

    LOGIN --> HOME
    SIGNUP --> HOME
    HOME --> ASSESS
    ASSESS --> RES
    RES --> GUIDE
    HIST --> PDF
    HOME --> WEAR
    HOME --> SETTINGS
    GUIDE --> SUN_TIMER
```

---

## 3. Screen Specifications & Wireframe Layouts

### 3.1 Screen: Home Dashboard (`/(tabs)/index`)
- **Header:** Personalized greeting ("Good Morning, Jane"), notification bell icon, profile avatar.
- **Primary Hero Card:**
  - *If assessment completed:* Circular score badge (e.g. `62 Moderate Risk`), last assessed date, "Retake Assessment" button.
  - *If new user:* High-impact welcome card: "Discover your Vitamin D status in 3 minutes" with glowing CTA "Start Self-Assessment".
- **Daily Sun Tracker Card:** Progress ring showing outdoor sunlight minutes today (e.g. `12 / 20 min goal`), current local UV Index (`UV 4.2 - Moderate`), and optimal exposure window.
- **Quick Metric Carousel:** Wearable sync status (Steps, Resting Heart Rate, Sleep Duration).
- **Educational Knowledge Card:** "Why Vitamin D matters for bone and immune health" (links to article).

### 3.2 Screen: Multi-Step Assessment Wizard (`/(tabs)/assessment`)
- **Top Bar:** Step indicator (`Step 2 of 4`), back button, animated segmented progress bar.
- **Card-Based Questionnaire Steps:**
  - **Step 1: Symptom Inventory:**
    - Fatigue Severity: Segmented selector (`None`, `Mild`, `Moderate`, `Severe`).
    - Bone & Joint Pain: Segmented selector with anatomical hint.
    - Muscle Weakness / Cramps: Interactive card picker.
    - Mood Changes & Recurrent Infections toggles.
  - **Step 2: Sunlight & Outdoor Exposure:**
    - Daily outdoor minutes slider (`0 to 120+ min`).
    - Typical time of day picker (Morning, Midday, Afternoon).
    - Clothing coverage visual cards (Minimal, Moderate, High Coverage).
    - Regular sunscreen SPF 30+ toggle.
  - **Step 3: Dietary Patterns:**
    - Weekly intake frequency steppers for Fatty Fish, Fortified Milk, Egg Yolks, Mushrooms.
    - Dietary preference radio group (Omnivore, Vegetarian, Vegan).
    - Current Vitamin D supplement checkbox.
  - **Step 4: Summary & Submission:**
    - Review entered answers with quick edit links.
    - Submit button with haptic feedback and loading spinner.

### 3.3 Screen: Assessment Results & Risk Gauge (`/modals/results`)
- **Visual Risk Gauge:** Custom animated circular SVG gauge filling from 0 to 100 with color gradient:
  - Green ($0–39$): Low Risk
  - Amber ($40–69$): Moderate Risk
  - Red ($70–100$): High Risk
- **Clinical Consultation Alert Banner:**
  - Rendered when score $\ge 40$. High-contrast amber/red alert box:  
    *“Clinical Consultation Advised: Your score indicates an elevated likelihood of Vitamin D deficiency. We recommend consulting a healthcare professional to consider a 25(OH)D venous blood test.”*
- **Primary Risk Drivers Breakdown:** Accordion list breaking down contributing factors (e.g. "Low direct sunlight exposure (+15 pts)", "Severe chronic fatigue (+12 pts)").
- **AI-Powered Plain-Language Summary:** Expandable card summarizing findings in clear language.
- **Persistent Legal Disclaimer:** Non-dismissible disclaimer at footer.
- **Action Buttons:** "View Personalized Guidance" & "Export Clinician Report".

### 3.4 Screen: Personalized Guidance Hub (`/(tabs)/guidance`)
- **Segmented Tabs:** `[Diet & Nutrition] | [Safe Sunlight] | [Exercise]`
- **Diet Tab:** Tailored meal suggestions matching dietary preference (e.g. Vegan meal ideas featuring UV-exposed mushrooms and fortified oat milk; omnivore ideas with wild salmon). Micronutrient co-factors card (Magnesium and Vitamin K2).
- **Sunlight Tab:** Active solar synthesis calculator based on user skin phototype. Built-in countdown timer for outdoor exposure breaks with auto-alarm.
- **Exercise Tab:** Illustrated weight-bearing and outdoor activity routines supporting bone density.

### 3.5 Screen: Clinician-Ready Health Report Viewer (`/modals/report`)
- **Document Preview:** High-fidelity PDF rendering displaying:
  - Patient demographics (Age, Sex, Assessment Date).
  - Calculated risk score and detailed symptom breakdown.
  - 7-day wearable biometrics summary (Resting HR, Sleep, Steps).
  - Note for Clinician: Outlines methodology and suggests serum $25(\text{OH})\text{D}$ evaluation.
  - Official medical disclaimer.
- **Floating Action Bar:** "Save PDF to Files", "Share with Doctor" (triggers native OS share sheet).

---

## 4. State Handling & Micro-Interactions

```mermaid
stateDiagram-v2
    [*] --> LoadingSkeleton: Screen Mounts
    LoadingSkeleton --> DataLoaded: API Success
    LoadingSkeleton --> ErrorState: Network Failure
    LoadingSkeleton --> EmptyState: Zero Records Found

    DataLoaded --> OfflineBanner: Device Loses Connectivity
    OfflineBanner --> DataLoaded: Network Reconnected

    ErrorState --> LoadingSkeleton: Tap "Retry"
```

- **Loading States:** Shimmer skeletons (`SkeletonView`) matching the exact layout of incoming cards to prevent layout shifts.
- **Empty States:** Meaningful illustrations and clear CTAs (e.g., "No previous assessments found — Take your first assessment now").
- **Error States:** Friendly error messaging with a prominent "Retry" button.
- **Offline Banner:** Non-intrusive amber banner at top of viewport: *"You are currently offline. Recent data is cached and new entries will sync automatically."*
- **Haptic Feedback:** Subtle vibration ticks on segmented slider changes, button presses, and survey completion.
