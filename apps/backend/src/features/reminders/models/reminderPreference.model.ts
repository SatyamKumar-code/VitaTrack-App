import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReminderPreferencesDocument extends Document {
  userId: Types.ObjectId;
  sunlightReminderEnabled: boolean;
  sunlightTime: string;
  dietaryReminderEnabled: boolean;
  dietaryTime: string;
  supplementReminderEnabled: boolean;
  supplementTime: string;
  reassessmentReminderEnabled: boolean;
  reassessmentIntervalDays: number;
  pushToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderPreferencesSchema = new Schema<IReminderPreferencesDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    sunlightReminderEnabled: {
      type: Boolean,
      default: true
    },
    sunlightTime: {
      type: String,
      default: '10:30',
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    dietaryReminderEnabled: {
      type: Boolean,
      default: true
    },
    dietaryTime: {
      type: String,
      default: '12:30',
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    supplementReminderEnabled: {
      type: Boolean,
      default: true
    },
    supplementTime: {
      type: String,
      default: '09:00',
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    reassessmentReminderEnabled: {
      type: Boolean,
      default: true
    },
    reassessmentIntervalDays: {
      type: Number,
      default: 14,
      min: 1,
      max: 90
    },
    pushToken: {
      type: String,
      required: false,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const ReminderPreferences = mongoose.model<IReminderPreferencesDocument>(
  'ReminderPreferences',
  ReminderPreferencesSchema
);
