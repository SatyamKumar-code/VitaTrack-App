# API_SPEC.md — RESTful API Specification (OpenAPI 3.0 Contract)

> **Base URL:** `https://api.vitatrack.internal/api/v1`  
> **Protocols:** HTTPS (TLS 1.3 required)  
> **Data Format:** JSON (`Content-Type: application/json`)  
> **Authentication:** HTTP Authorization Header: `Bearer <JWT>`

---

## 1. Authentication & Session Endpoints

### 1.1 `POST /auth/register`
Creates a new patient user account.
- **Access:** Public
- **Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "SecurePassword123!",
  "fullName": "Jane Doe",
  "dateOfBirth": "1994-06-15",
  "biologicalSex": "female",
  "skinType": "type_3",
  "dietaryPreference": "vegetarian"
}
```
- **Responses:**
  - `201 Created`:
    ```json
    {
      "success": true,
      "message": "User registered successfully.",
      "data": {
        "user": {
          "id": "6710ea1b8f14c2d3a1e94b10",
          "email": "patient@example.com",
          "fullName": "Jane Doe",
          "role": "patient"
        },
        "tokens": {
          "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "refreshToken": "d8e7c10b4f3a2e1d...",
          "expiresIn": 900
        }
      }
    }
    ```
  - `400 Bad Request`: Validation failure (weak password, invalid email format).
  - `409 Conflict`: Email already registered.

---

### 1.2 `POST /auth/login`
Authenticates user credentials and issues session tokens.
- **Access:** Public
- **Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "SecurePassword123!"
}
```
- **Responses:**
  - `200 OK`: Returns user profile summary and JWT token pair.
  - `401 Unauthorized`: Invalid credentials.
  - `429 Too Many Requests`: Account temporarily locked due to repeated failed logins.

---

### 1.3 `POST /auth/refresh-token`
Rotates an expired access token using a valid refresh token.
- **Access:** Public (Requires valid Refresh Token in body)
- **Request Body:**
```json
{
  "refreshToken": "d8e7c10b4f3a2e1d..."
}
```
- **Responses:**
  - `200 OK`: Returns new access token and rotated refresh token.
  - `401 Unauthorized`: Expired or reused refresh token (triggers session revocation).

---

## 2. User Profile Endpoints

### 2.1 `GET /users/profile`
Retrieves the authenticated user's demographic and health baseline.
- **Access:** Bearer JWT (Patient)
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "id": "6710ea1b8f14c2d3a1e94b10",
        "email": "patient@example.com",
        "fullName": "Jane Doe",
        "dateOfBirth": "1994-06-15",
        "biologicalSex": "female",
        "skinType": "type_3",
        "dietaryPreference": "vegetarian",
        "medicalConditions": ["malabsorption_syndrome"],
        "createdAt": "2026-10-17T10:00:00.000Z"
      }
    }
    ```

---

### 2.2 `PUT /users/profile`
Updates demographic parameters, skin phototype, or dietary orientation.
- **Access:** Bearer JWT (Patient)
- **Request Body:**
```json
{
  "dietaryPreference": "vegan",
  "skinType": "type_3",
  "medicalConditions": ["celiac_disease"]
}
```
- **Responses:**
  - `200 OK`: Profile updated.
  - `400 Bad Request`: Invalid enum values.

---

## 3. Clinical Self-Assessment Endpoints

### 3.1 `POST /assessments`
Submits a completed multi-factor self-assessment questionnaire, runs deterministic scoring, triggers AI insights, and stores the record.
- **Access:** Bearer JWT (Patient)
- **Request Body:**
```json
{
  "symptoms": {
    "fatigueLevel": "high",
    "bonePainLevel": "moderate",
    "muscleWeaknessLevel": "mild",
    "moodChanges": "moderate",
    "frequentInfections": true
  },
  "sunExposure": {
    "dailyMinutesOutdoors": 15,
    "timeOfDay": "midday",
    "clothingCoverage": "high",
    "regularSunscreenSPF30": true
  },
  "dietaryHabits": {
    "fattyFishServingsPerWeek": 0,
    "fortifiedMilkServingsPerWeek": 2,
    "eggYolksPerWeek": 0,
    "mushroomsWeekly": true,
    "takesVitaminDSupplement": false
  }
}
```
- **Responses:**
  - `201 Created`:
    ```json
    {
      "success": true,
      "data": {
        "assessmentId": "6710ee9a8f14c2d3a1e94b22",
        "timestamp": "2026-10-17T11:45:00.000Z",
        "results": {
          "compositeScore": 62,
          "riskTier": "moderate",
          "subScores": {
            "symptomScore": 31,
            "solarDeficitScore": 17,
            "dietaryDeficitScore": 11,
            "medicalMultiplierScore": 3
          },
          "doctorConsultationRequired": true,
          "consultationUrgency": "recommended_within_2_weeks",
          "disclaimer": "VitaTrack is a self-assessment screening tool and does not provide medical diagnoses. Consult a qualified physician for serum blood testing."
        },
        "aiExplanation": {
          "summary": "Your assessment reflects an elevated risk profile primarily driven by reported high fatigue, frequent infections, and limited cutaneous synthesis due to high clothing coverage and sunscreen use.",
          "keyContributors": [
            "High fatigue combined with recurrent infections indicates potential deficiency strain.",
            "Sub-optimal direct sunlight exposure limits cutaneous synthesis."
          ]
        }
      }
    }
    ```

---

### 3.2 `GET /assessments/latest`
Retrieves the most recent assessment results for the active user.
- **Access:** Bearer JWT (Patient)
- **Responses:**
  - `200 OK`: Returns latest assessment object.
  - `404 Not Found`: User has not completed any assessments yet.

---

### 3.3 `GET /assessments/history`
Returns chronological assessment records for trend tracking.
- **Access:** Bearer JWT (Patient)
- **Query Parameters:** `page` (default 1), `limit` (default 10)
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "pagination": { "total": 4, "page": 1, "pages": 1 },
      "data": [
        {
          "id": "6710ee9a8f14c2d3a1e94b22",
          "date": "2026-10-17T11:45:00.000Z",
          "compositeScore": 62,
          "riskTier": "moderate",
          "doctorAlert": true
        }
      ]
    }
    ```

---

## 4. Personalized Guidance & Reminders

### 4.1 `GET /recommendations/current`
Returns active nutritional, sunlight, and exercise guidance tailored to the user's latest assessment.
- **Access:** Bearer JWT (Patient)
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "nutrition": {
          "dietType": "vegetarian",
          "targetDailyIU": "1000 - 2000 IU (dietary + synthesis guidance)",
          "priorityFoods": [
            { "name": "UV-Exposed Portobello Mushrooms", "vitaminDContent": "400 IU / 100g" },
            { "name": "Fortified Soy or Almond Milk", "vitaminDContent": "120 IU / cup" }
          ],
          "coFactors": ["Magnesium (Leafy greens, pumpkin seeds)", "Vitamin K2"]
        },
        "sunlight": {
          "recommendedDailyMinutes": 20,
          "optimalWindow": "10:30 AM - 11:30 AM",
          "safeExposureGuidance": "Expose arms and lower legs without sunscreen for 15-20 min; apply SPF if outdoors longer."
        },
        "exercise": {
          "focus": "Weight-bearing & bone density support",
          "suggestions": ["Brisk outdoor walking (combines sun & activity)", "Resistance band workouts"]
        }
      }
    }
    ```

---

### 4.2 `GET /reminders` & `PUT /reminders`
Retrieves or updates the user's notification preferences for sunlight exposure, meals, and follow-ups.
- **Access:** Bearer JWT (Patient)
- **Request Body (PUT):**
```json
{
  "sunlightReminderEnabled": true,
  "sunlightTime": "11:00",
  "dietaryReminderEnabled": true,
  "dietaryTime": "13:00",
  "reassessmentIntervalDays": 14
}
```

---

## 5. Wearable Biometric Ingestion Endpoints

### 5.1 `POST /wearables/sync`
Ingests normalized biometric metrics synced from Android Health Connect.
- **Access:** Bearer JWT (Patient)
- **Request Body:**
```json
{
  "deviceInfo": {
    "manufacturer": "Samsung",
    "model": "Galaxy Watch 6",
    "sourceApp": "com.google.android.apps.healthdata"
  },
  "metricsDate": "2026-10-17",
  "data": {
    "stepCount": 7842,
    "restingHeartRate": 68,
    "avgSpO2": 98.2,
    "sleepDurationMinutes": 435,
    "deepSleepMinutes": 68
  }
}
```
- **Responses:**
  - `200 OK`: Returns `{ "success": true, "syncedAt": "2026-10-17T12:00:00.000Z" }`.
  - `400 Bad Request`: Physiological validation failure (e.g., negative steps or heart rate out of range).

---

## 6. Technical Administration Telemetry Endpoints (Zero-PHI)

> [!CAUTION]
> **Zero-PHI Compliance:** These endpoints strictly forbid individual user identifiers, names, symptoms, scores, reports, or wearable biometrics.

### 6.1 `POST /admin/auth/login`
Authenticates a technical administrator.
- **Access:** Public (Admin credentials)
- **Responses:** `200 OK` with short-lived Admin JWT.

---

### 6.2 `GET /admin/health`
Monitors backend uptime, database connections, and memory footprint.
- **Access:** Bearer JWT (`role: admin`)
- **Responses:**
  - `200 OK`:
    ```json
    {
      "status": "healthy",
      "uptimeSeconds": 142850,
      "environment": "production",
      "database": {
        "status": "connected",
        "activeConnections": 14
      },
      "memory": {
        "heapUsedMB": 82.4,
        "rssMB": 148.1
      }
    }
    ```

---

### 6.3 `GET /admin/metrics`
Retrieves aggregated macroscopic counts and API operational statistics ($N \ge 10$).
- **Access:** Bearer JWT (`role: admin`)
- **Responses:**
  - `200 OK`:
    ```json
    {
      "aggregateUsers": {
        "totalRegistered": 1420,
        "dailyActiveUsers": 310,
        "monthlyActiveUsers": 1180
      },
      "assessments": {
        "totalCompleted": 2840,
        "aggregateDistribution": {
          "lowRiskPercentage": 42.1,
          "moderateRiskPercentage": 38.4,
          "highRiskPercentage": 19.5
        }
      },
      "apiPerformance": {
        "avgResponseTimeMs": 64.2,
        "errorRate4xxPercentage": 1.2,
        "errorRate5xxPercentage": 0.05
      }
    }
    ```

---

### 6.4 `GET /admin/audit-logs`
Retrieves immutable administrative session and telemetry query audit records.
- **Access:** Bearer JWT (`role: admin`)
- **Query Parameters:** `limit` (default: 50, max: 100)
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "6710ee9a8f14c2d3a1e94b99",
          "adminEmail": "sysadmin@vitatrack.com",
          "action": "ADMIN_LOGIN_SUCCESS",
          "ipAddress": "127.0.0.1",
          "status": "SUCCESS",
          "details": "Administrator authenticated successfully.",
          "timestamp": "2026-10-18T11:45:00.000Z"
        }
      ]
    }
    ```

