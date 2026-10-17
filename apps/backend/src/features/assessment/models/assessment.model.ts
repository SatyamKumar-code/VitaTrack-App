import mongoose, { Document, Schema, Types } from 'mongoose';
import {
  AssessmentScoringResults,
  AssessmentAiExplanation,
  DietaryHabitsData,
  SunExposureData,
  SymptomsData
} from '../types/assessment.types';

export interface IAssessmentDocument extends Document {
  userId: Types.ObjectId;
  completedAt: Date;
  symptoms: SymptomsData;
  sunExposure: SunExposureData;
  dietaryHabits: DietaryHabitsData;
  scoringResults: AssessmentScoringResults;
  aiExplanation?: AssessmentAiExplanation;
}

const SymptomsSchema = new Schema<SymptomsData>(
  {
    fatigueLevel: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe'],
      required: true
    },
    bonePainLevel: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe'],
      required: true
    },
    muscleWeaknessLevel: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe'],
      required: true
    },
    moodChanges: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe'],
      required: true
    },
    frequentInfections: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const SunExposureSchema = new Schema<SunExposureData>(
  {
    dailyMinutesOutdoors: {
      type: Number,
      required: true,
      min: 0,
      max: 720
    },
    timeOfDay: {
      type: String,
      enum: ['early_morning', 'midday', 'late_afternoon', 'mixed'],
      required: true
    },
    clothingCoverage: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      required: true
    },
    regularSunscreenSPF30: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const DietaryHabitsSchema = new Schema<DietaryHabitsData>(
  {
    fattyFishServingsPerWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 21
    },
    fortifiedMilkServingsPerWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 28
    },
    eggYolksPerWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 35
    },
    mushroomsWeekly: {
      type: Boolean,
      default: false
    },
    takesVitaminDSupplement: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const SubScoresSchema = new Schema(
  {
    symptomScore: { type: Number, required: true },
    solarDeficitScore: { type: Number, required: true },
    dietaryDeficitScore: { type: Number, required: true },
    medicalMultiplierScore: { type: Number, required: true }
  },
  { _id: false }
);

const ScoringResultsSchema = new Schema<AssessmentScoringResults>(
  {
    compositeScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    riskTier: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      required: true
    },
    subScores: {
      type: SubScoresSchema,
      required: true
    },
    doctorConsultationRequired: {
      type: Boolean,
      required: true
    },
    consultationUrgency: {
      type: String,
      enum: [
        'routine_monitoring',
        'recommended_within_2_weeks',
        'urgent_medical_evaluation'
      ],
      required: true
    },
    disclaimer: {
      type: String,
      required: true,
      default:
        'VitaTrack is a self-assessment screening tool and does not provide medical diagnoses. Consult a qualified physician for serum blood testing.'
    }
  },
  { _id: false }
);

const AiExplanationSchema = new Schema<AssessmentAiExplanation>(
  {
    summary: { type: String },
    keyContributors: [{ type: String }]
  },
  { _id: false }
);

const AssessmentSchema = new Schema<IAssessmentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    symptoms: {
      type: SymptomsSchema,
      required: true
    },
    sunExposure: {
      type: SunExposureSchema,
      required: true
    },
    dietaryHabits: {
      type: DietaryHabitsSchema,
      required: true
    },
    scoringResults: {
      type: ScoringResultsSchema,
      required: true
    },
    aiExplanation: {
      type: AiExplanationSchema,
      required: false
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Compound descending index for instant retrieval of patient history (DATABASE_SCHEMA.md Section 2.2)
AssessmentSchema.index({ userId: 1, completedAt: -1 });

export const Assessment = mongoose.model<IAssessmentDocument>('Assessment', AssessmentSchema);
