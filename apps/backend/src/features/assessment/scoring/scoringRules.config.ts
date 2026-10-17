/**
 * VitaTrack Clinical Risk Scoring Rules & Weight Constants
 * Reference: VGU Vitamin D Study, Slide 6 (Methodology) & Slide 7 (Sample User Analysis Table)
 * Architecture Reference: ARCHITECTURE.md Section 5 (Two-Tier Risk Scoring Engine)
 */

export const SCORING_WEIGHTS = {
  // 1. Symptom Severity Sub-Score (Max: 45 pts)
  SYMPTOMS: {
    MAX_POINTS: 45,
    FATIGUE: {
      none: 0,
      mild: 3,
      moderate: 7,
      severe: 12
    },
    BONE_PAIN: {
      none: 0,
      mild: 3,
      moderate: 6,
      severe: 10
    },
    MUSCLE_WEAKNESS: {
      none: 0,
      mild: 2,
      moderate: 5,
      severe: 8
    },
    MOOD_CHANGES: {
      none: 0,
      mild: 2,
      moderate: 4,
      severe: 7
    },
    FREQUENT_INFECTIONS: {
      yes: 8,
      no: 0
    }
  },

  // 2. Solar Insufficiency Sub-Score (Max: 25 pts)
  SOLAR: {
    MAX_POINTS: 25,
    EXPOSURE_MINUTES: {
      MINIMAL: { threshold: 10, points: 15 }, // < 10 min/day
      MODERATE: { threshold: 25, points: 7 }, // 10-25 min/day
      OPTIMAL: { points: 0 } // > 25 min/day
    },
    SUNSCREEN_SPF30: 5, // Applied uniformly before all exposure
    CLOTHING_COVERAGE: {
      high: 5, // Face & hands only exposed
      moderate: 2,
      low: 0
    },
    TIME_OF_DAY_PENALTY: {
      // If outdoors outside peak UV-B hours (10 AM - 3 PM), synthesis is drastically curtailed
      non_midday_penalty: 3
    }
  },

  // 3. Dietary Deficit Sub-Score (Max: 20 pts)
  DIET: {
    MAX_POINTS: 20,
    FATTY_FISH: {
      threshold: 1, // < 1 serving/week
      points: 7
    },
    FORTIFIED_MILK: {
      threshold: 3, // < 3 servings/week
      points: 5
    },
    EGG_YOLKS: {
      threshold: 2, // < 2 eggs/week
      points: 3
    },
    VEGAN_OR_VEGETARIAN_UNSUPPLEMENTED: 5,
    SUPPLEMENT_OFFSET: 15 // Taking daily Vitamin D supplement significantly mitigates dietary deficits
  },

  // 4. Biological & Medical Multipliers (Max: 10 pts)
  MEDICAL: {
    MAX_POINTS: 10,
    ELDERLY_AGE_THRESHOLD: 60,
    ELDERLY_POINTS: 4, // Reduced cutaneous 7-dehydrocholesterol conversion in elderly skin
    FITZPATRICK_HIGH_MELANIN_SKIN_TYPES: ['type_5', 'type_6'],
    HIGH_MELANIN_POINTS: 3, // Melanin pigment acts as a natural UV-B filter
    CHRONIC_CONDITION_POINTS: 3 // Celiac, Crohn's, CKD, or malabsorption conditions
  },

  // Composite Score Thresholds & Risk Stratification
  TIERS: {
    LOW: {
      min: 0,
      max: 39,
      tier: 'low' as const,
      doctorConsultationRequired: false,
      consultationUrgency: 'routine_monitoring' as const
    },
    MODERATE: {
      min: 40,
      max: 69,
      tier: 'moderate' as const,
      doctorConsultationRequired: true,
      consultationUrgency: 'recommended_within_2_weeks' as const
    },
    HIGH: {
      min: 70,
      max: 100,
      tier: 'high' as const,
      doctorConsultationRequired: true,
      consultationUrgency: 'urgent_medical_evaluation' as const
    }
  },

  DISCLAIMER:
    'VitaTrack is a self-assessment screening tool and does not provide medical diagnoses. Consult a qualified physician for serum blood testing.'
};
