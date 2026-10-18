import mongoose, { Document, Schema, Types } from 'mongoose';
import { IDeviceInfo } from '../types/wearable.types';

export interface IWearableMetricDocument extends Document {
  userId: Types.ObjectId;
  metricsDate: string; // YYYY-MM-DD
  deviceInfo?: IDeviceInfo;
  stepCount: number;
  restingHeartRate?: number;
  avgSpO2?: number;
  sleepDurationMinutes?: number;
  deepSleepMinutes?: number;
  syncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceInfoSchema = new Schema(
  {
    manufacturer: { type: String, trim: true },
    model: { type: String, trim: true },
    sourceApp: { type: String, trim: true }
  },
  { _id: false }
);

const WearableMetricSchema = new Schema<IWearableMetricDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    metricsDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    deviceInfo: {
      type: DeviceInfoSchema,
      default: {}
    },
    stepCount: {
      type: Number,
      min: 0,
      max: 100000,
      default: 0
    },
    restingHeartRate: {
      type: Number,
      min: 30,
      max: 220,
      required: false
    },
    avgSpO2: {
      type: Number,
      min: 50.0,
      max: 100.0,
      required: false
    },
    sleepDurationMinutes: {
      type: Number,
      min: 0,
      max: 1440,
      required: false
    },
    deepSleepMinutes: {
      type: Number,
      min: 0,
      max: 720,
      required: false
    },
    syncedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'wearable_metrics'
  }
);

// Compound unique index ensuring one consolidated daily metric record per user
WearableMetricSchema.index({ userId: 1, metricsDate: 1 }, { unique: true });

export const WearableMetric = mongoose.model<IWearableMetricDocument>(
  'WearableMetric',
  WearableMetricSchema
);
