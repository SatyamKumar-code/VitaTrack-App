import { z } from 'zod';

export const AssessmentSubmissionSchema = z.object({
  symptoms: z.object({
    fatigueLevel: z.enum(['none', 'mild', 'moderate', 'severe'], {
      required_error: 'Fatigue severity level is required.',
      invalid_type_error: 'Fatigue level must be one of: none, mild, moderate, severe.'
    }),
    bonePainLevel: z.enum(['none', 'mild', 'moderate', 'severe'], {
      required_error: 'Bone pain severity level is required.',
      invalid_type_error: 'Bone pain level must be one of: none, mild, moderate, severe.'
    }),
    muscleWeaknessLevel: z.enum(['none', 'mild', 'moderate', 'severe'], {
      required_error: 'Muscle weakness level is required.',
      invalid_type_error: 'Muscle weakness level must be one of: none, mild, moderate, severe.'
    }),
    moodChanges: z.enum(['none', 'mild', 'moderate', 'severe'], {
      required_error: 'Mood changes level is required.',
      invalid_type_error: 'Mood changes level must be one of: none, mild, moderate, severe.'
    }),
    frequentInfections: z.boolean({
      required_error: 'Frequent infections indicator is required.'
    })
  }),
  sunExposure: z.object({
    dailyMinutesOutdoors: z
      .number({
        required_error: 'Daily outdoor minutes is required.'
      })
      .min(0, 'Daily outdoor minutes must be at least 0.')
      .max(720, 'Daily outdoor minutes cannot exceed 720.'),
    timeOfDay: z.enum(['early_morning', 'midday', 'late_afternoon', 'mixed'], {
      required_error: 'Time of day exposure window is required.',
      invalid_type_error: 'Time of day must be: early_morning, midday, late_afternoon, or mixed.'
    }),
    clothingCoverage: z.enum(['low', 'moderate', 'high'], {
      required_error: 'Clothing coverage level is required.',
      invalid_type_error: 'Clothing coverage must be: low, moderate, or high.'
    }),
    regularSunscreenSPF30: z.boolean({
      required_error: 'Sunscreen usage indicator is required.'
    })
  }),
  dietaryHabits: z.object({
    fattyFishServingsPerWeek: z
      .number({
        required_error: 'Fatty fish servings per week is required.'
      })
      .min(0, 'Fatty fish servings must be >= 0.')
      .max(21, 'Fatty fish servings must be <= 21.'),
    fortifiedMilkServingsPerWeek: z
      .number({
        required_error: 'Fortified milk servings per week is required.'
      })
      .min(0, 'Fortified milk servings must be >= 0.')
      .max(28, 'Fortified milk servings must be <= 28.'),
    eggYolksPerWeek: z
      .number({
        required_error: 'Egg yolks per week is required.'
      })
      .min(0, 'Egg yolks must be >= 0.')
      .max(35, 'Egg yolks must be <= 35.'),
    mushroomsWeekly: z.boolean({
      required_error: 'Weekly mushroom intake indicator is required.'
    }),
    takesVitaminDSupplement: z.boolean({
      required_error: 'Vitamin D supplement intake indicator is required.'
    })
  })
});

export type AssessmentSubmissionInput = z.infer<typeof AssessmentSubmissionSchema>;
