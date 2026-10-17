export type DietaryPreference = 'omnivore' | 'vegetarian' | 'vegan';

export type SkinType =
  | 'type_1'
  | 'type_2'
  | 'type_3'
  | 'type_4'
  | 'type_5'
  | 'type_6';

export interface PriorityFoodItem {
  name: string;
  vitaminDContent: string;
  servingSize: string;
  category: 'Seafood' | 'Dairy' | 'Plant-based' | 'Produce' | 'Eggs' | 'Fortified';
  bioavailabilityNote: string;
}

export interface NutritionGuidance {
  dietType: DietaryPreference;
  targetDailyIU: string;
  priorityFoods: PriorityFoodItem[];
  coFactors: string[];
  absorptionTips: string;
  supplementGuidance: {
    recommended: boolean;
    reason: string;
    caution: string;
  };
}

export interface SunlightGuidance {
  skinType: SkinType;
  skinTypeDescription: string;
  recommendedDailyMinutes: number;
  optimalWindow: string;
  safeExposureGuidance: string;
  uvThresholdNotice: string;
  sunscreenAdvice: string;
  timerDefaultMinutes: number;
}

export interface ExerciseRoutineItem {
  id: string;
  name: string;
  category: 'Weight-Bearing' | 'Resistance' | 'Low-Impact Mobility' | 'Postural Stability';
  durationMinutes: number;
  frequency: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  boneImpact: string;
  instructions: string[];
  outdoorSynergy: boolean;
}

export interface ExerciseGuidance {
  focus: string;
  suggestions: ExerciseRoutineItem[];
  safetyPrecautions: string;
  tailoredNote: string;
}

export interface EducationalArticleSection {
  heading: string;
  body: string;
  keyTakeaway?: string;
}

export interface EducationalArticle {
  id: string;
  title: string;
  subtitle: string;
  category: 'synthesis' | 'clinical' | 'nutrition' | 'safety';
  readTimeMinutes: number;
  summary: string;
  contentSections: EducationalArticleSection[];
  scientificReferences: string[];
}

export interface PersonalizedGuidancePayload {
  nutrition: NutritionGuidance;
  sunlight: SunlightGuidance;
  exercise: ExerciseGuidance;
  riskTier: 'low' | 'moderate' | 'high';
  assessmentId?: string;
  generatedAt: string;
}
