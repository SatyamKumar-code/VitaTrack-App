import mongoose, { Document, Schema, Types } from 'mongoose';
import {
  NutritionGuidance,
  SunlightGuidance,
  ExerciseGuidance
} from '../types/guidance.types';

export interface IRecommendationDocument extends Document {
  userId: Types.ObjectId;
  assessmentId?: Types.ObjectId;
  nutritionPlan: NutritionGuidance;
  sunlightSchedule: SunlightGuidance;
  exerciseSuggestions: ExerciseGuidance;
  generatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: false,
      index: true
    },
    nutritionPlan: {
      dietType: { type: String, required: true },
      targetDailyIU: { type: String, required: true },
      priorityFoods: [
        {
          name: { type: String, required: true },
          vitaminDContent: { type: String, required: true },
          servingSize: { type: String },
          category: { type: String },
          bioavailabilityNote: { type: String }
        }
      ],
      coFactors: [{ type: String }],
      absorptionTips: { type: String },
      supplementGuidance: {
        recommended: { type: Boolean },
        reason: { type: String },
        caution: { type: String }
      }
    },
    sunlightSchedule: {
      skinType: { type: String, required: true },
      skinTypeDescription: { type: String },
      recommendedDailyMinutes: { type: Number, required: true },
      optimalWindow: { type: String, required: true },
      safeExposureGuidance: { type: String, required: true },
      uvThresholdNotice: { type: String },
      sunscreenAdvice: { type: String },
      timerDefaultMinutes: { type: Number }
    },
    exerciseSuggestions: {
      focus: { type: String, required: true },
      suggestions: [
        {
          id: { type: String },
          name: { type: String, required: true },
          category: { type: String },
          durationMinutes: { type: Number },
          frequency: { type: String },
          difficulty: { type: String },
          boneImpact: { type: String },
          instructions: [{ type: String }],
          outdoorSynergy: { type: Boolean }
        }
      ],
      safetyPrecautions: { type: String },
      tailoredNote: { type: String }
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false,
    versionKey: false,
    collection: 'recommendations'
  }
);

// Compound index for efficient user history lookup
RecommendationSchema.index({ userId: 1, generatedAt: -1 });

export const Recommendation = mongoose.model<IRecommendationDocument>(
  'Recommendation',
  RecommendationSchema
);
