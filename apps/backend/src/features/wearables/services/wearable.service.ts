import { Types } from 'mongoose';
import { WearableMetric, IWearableMetricDocument } from '../models/wearableMetric.model';
import { WearableSyncDto } from '../validators/wearable.validator';
import { IWearableCorrelationInsights } from '../types/wearable.types';
import { Assessment } from '../../assessment/models/assessment.model';
import { logger } from '../../../core/logger/logger';

export class WearableService {
  /**
   * Ingest and normalize daily biometric records synced from Android Health Connect.
   * Uses an upsert keyed by (userId, metricsDate) to prevent duplicate daily entries.
   */
  public static async syncMetrics(
    userId: string,
    dto: WearableSyncDto
  ): Promise<{ syncedAt: Date; metric: IWearableMetricDocument }> {
    const userObjectId = new Types.ObjectId(userId);

    const updatePayload: Partial<IWearableMetricDocument> = {
      userId: userObjectId,
      metricsDate: dto.metricsDate,
      deviceInfo: dto.deviceInfo || {},
      stepCount: dto.data.stepCount,
      syncedAt: new Date()
    };

    if (dto.data.restingHeartRate !== undefined) {
      updatePayload.restingHeartRate = Math.round(dto.data.restingHeartRate);
    }
    if (dto.data.avgSpO2 !== undefined) {
      updatePayload.avgSpO2 = parseFloat(dto.data.avgSpO2.toFixed(1));
    }
    if (dto.data.sleepDurationMinutes !== undefined) {
      updatePayload.sleepDurationMinutes = Math.round(dto.data.sleepDurationMinutes);
    }
    if (dto.data.deepSleepMinutes !== undefined) {
      updatePayload.deepSleepMinutes = Math.round(dto.data.deepSleepMinutes);
    }

    const metric = await WearableMetric.findOneAndUpdate(
      { userId: userObjectId, metricsDate: dto.metricsDate },
      { $set: updatePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    logger.info(`[WearableService] Synced metrics for user ${userId} on date ${dto.metricsDate}`);

    return {
      syncedAt: metric.syncedAt,
      metric
    };
  }

  /**
   * Retrieve the most recent wearable biometric record for a user.
   */
  public static async getLatestMetrics(userId: string): Promise<IWearableMetricDocument | null> {
    const userObjectId = new Types.ObjectId(userId);
    return WearableMetric.findOne({ userId: userObjectId })
      .sort({ metricsDate: -1, syncedAt: -1 })
      .exec();
  }

  /**
   * Retrieve multi-day biometric history (default: last 7 days).
   */
  public static async getMetricsHistory(
    userId: string,
    days: number = 7
  ): Promise<IWearableMetricDocument[]> {
    const userObjectId = new Types.ObjectId(userId);
    const limit = Math.min(Math.max(days, 1), 30);

    return WearableMetric.find({ userId: userObjectId })
      .sort({ metricsDate: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * TASK-P8-06: Correlate low physical activity or disrupted sleep patterns
   * with fatigue scores from clinical assessments in progress views.
   */
  public static async getCorrelationInsights(userId: string): Promise<IWearableCorrelationInsights> {
    const userObjectId = new Types.ObjectId(userId);

    // 1. Fetch recent wearable history (last 7 recorded days)
    const recentMetrics = await WearableMetric.find({ userId: userObjectId })
      .sort({ metricsDate: -1 })
      .limit(7)
      .exec();

    // 2. Fetch latest completed clinical assessment
    const latestAssessment = await Assessment.findOne({ userId: userObjectId })
      .sort({ completedAt: -1 })
      .exec();

    const fatigueLevel = latestAssessment?.symptoms?.fatigueLevel || 'none';

    if (recentMetrics.length === 0) {
      return {
        hasWearableData: false,
        sevenDayAverages: {
          avgSteps: 0,
          avgRestingHeartRate: null,
          avgSleepMinutes: null,
          avgSpO2: null,
          daysRecorded: 0
        },
        assessmentCorrelation: {
          reportedFatigueLevel: fatigueLevel,
          fatigueCorrelationStatus: 'insufficient_data',
          sleepEvaluation: {
            status: 'not_tracked',
            summary: 'No sleep records synced yet from Android Health Connect.'
          },
          activityEvaluation: {
            status: 'not_tracked',
            summary: 'No activity or pedometer records synced yet.'
          },
          clinicalSynergyInsight:
            'Pair a smartwatch with Android Health Connect to evaluate how sleep architecture and daily steps correlate with your Vitamin D fatigue indicators.'
        },
        generatedAt: new Date().toISOString()
      };
    }

    // 3. Compute 7-day rolling aggregates
    const totalSteps = recentMetrics.reduce((sum, m) => sum + (m.stepCount || 0), 0);
    const avgSteps = Math.round(totalSteps / recentMetrics.length);

    const hrMetrics = recentMetrics.filter((m) => m.restingHeartRate !== undefined && m.restingHeartRate !== null);
    const avgRestingHeartRate =
      hrMetrics.length > 0
        ? Math.round(hrMetrics.reduce((sum, m) => sum + (m.restingHeartRate || 0), 0) / hrMetrics.length)
        : null;

    const sleepMetrics = recentMetrics.filter(
      (m) => m.sleepDurationMinutes !== undefined && m.sleepDurationMinutes !== null
    );
    const avgSleepMinutes =
      sleepMetrics.length > 0
        ? Math.round(sleepMetrics.reduce((sum, m) => sum + (m.sleepDurationMinutes || 0), 0) / sleepMetrics.length)
        : null;

    const spo2Metrics = recentMetrics.filter((m) => m.avgSpO2 !== undefined && m.avgSpO2 !== null);
    const avgSpO2 =
      spo2Metrics.length > 0
        ? parseFloat((spo2Metrics.reduce((sum, m) => sum + (m.avgSpO2 || 0), 0) / spo2Metrics.length).toFixed(1))
        : null;

    // 4. Evaluate Sleep Status
    let sleepStatus: 'insufficient' | 'suboptimal' | 'optimal' | 'not_tracked' = 'not_tracked';
    let sleepSummary = 'Sleep duration not measured on paired device.';
    if (avgSleepMinutes !== null) {
      const sleepHours = (avgSleepMinutes / 60).toFixed(1);
      if (avgSleepMinutes < 360) {
        // Under 6 hours
        sleepStatus = 'insufficient';
        sleepSummary = `Chronic sleep debt detected: averaging only ${sleepHours} hours/night (< 6h).`;
      } else if (avgSleepMinutes < 420) {
        // Under 7 hours
        sleepStatus = 'suboptimal';
        sleepSummary = `Borderline sleep duration: averaging ${sleepHours} hours/night (recommended 7-9h).`;
      } else {
        sleepStatus = 'optimal';
        sleepSummary = `Healthy sleep duration: averaging ${sleepHours} hours/night.`;
      }
    }

    // 5. Evaluate Activity Status
    let activityStatus: 'sedentary' | 'light' | 'active' | 'not_tracked' = 'active';
    let activitySummary = '';
    if (avgSteps < 4000) {
      activityStatus = 'sedentary';
      activitySummary = `Sedentary mobility pattern: averaging ${avgSteps.toLocaleString()} steps/day (< 4,000 steps).`;
    } else if (avgSteps < 7500) {
      activityStatus = 'light';
      activitySummary = `Moderate mobility pattern: averaging ${avgSteps.toLocaleString()} steps/day.`;
    } else {
      activityStatus = 'active';
      activitySummary = `Optimal mobility pattern: averaging ${avgSteps.toLocaleString()} steps/day.`;
    }

    // 6. Correlate with Fatigue Score
    let fatigueCorrelationStatus: 'optimal' | 'contributing' | 'aggravating' = 'optimal';
    let clinicalSynergyInsight = '';

    const isHighFatigue = fatigueLevel === 'moderate' || fatigueLevel === 'severe';
    const isSleepDeprived = sleepStatus === 'insufficient' || sleepStatus === 'suboptimal';
    const isSedentary = activityStatus === 'sedentary';

    if (isHighFatigue && (isSleepDeprived || isSedentary)) {
      fatigueCorrelationStatus = 'aggravating';
      clinicalSynergyInsight = `Lifestyle Aggravation: Your clinical assessment flags ${fatigueLevel} fatigue. Wearable telemetry confirms ${
        isSleepDeprived ? 'insufficient sleep' : ''
      }${isSleepDeprived && isSedentary ? ' combined with ' : ''}${
        isSedentary ? 'sedentary physical activity' : ''
      }. These factors compound Vitamin D deficiency symptoms. Prioritize morning outdoor sunlight (15-30 min) to synchronize your circadian clock, improve deep sleep architecture, and jumpstart natural Vitamin D3 synthesis.`;
    } else if (isHighFatigue && !isSleepDeprived && !isSedentary) {
      fatigueCorrelationStatus = 'contributing';
      clinicalSynergyInsight = `Isolated Metabolic Fatigue: Despite optimal wearable biometrics (${avgSteps.toLocaleString()} steps/day, ${
        avgSleepMinutes ? (avgSleepMinutes / 60).toFixed(1) + 'h sleep' : 'normal rest'
      }), your assessment records ${fatigueLevel} fatigue. This discordance strongly points toward micronutrient or biochemical deficit rather than mechanical exhaustion. Medical serum 25(OH)D laboratory testing is strongly advised.`;
    } else if (fatigueLevel === 'mild') {
      fatigueCorrelationStatus = isSleepDeprived || isSedentary ? 'contributing' : 'optimal';
      clinicalSynergyInsight = `Mild Fatigue Baseline: Mild fatigue reported alongside ${activityStatus} activity (${avgSteps.toLocaleString()} steps/day). Regular midday sun exposure and consistent sleep timing will prevent progression to chronic exhaustion.`;
    } else {
      fatigueCorrelationStatus = 'optimal';
      clinicalSynergyInsight = `Resilient Biometric Balance: Zero significant fatigue reported, corroborated by ${activityStatus} movement (${avgSteps.toLocaleString()} steps/day) and stable resting vitals. Maintain current outdoor solar habits and balanced nutrition.`;
    }

    return {
      hasWearableData: true,
      metricsDate: recentMetrics[0].metricsDate,
      sevenDayAverages: {
        avgSteps,
        avgRestingHeartRate,
        avgSleepMinutes,
        avgSpO2,
        daysRecorded: recentMetrics.length
      },
      assessmentCorrelation: {
        reportedFatigueLevel: fatigueLevel,
        fatigueCorrelationStatus,
        sleepEvaluation: {
          status: sleepStatus,
          summary: sleepSummary
        },
        activityEvaluation: {
          status: activityStatus,
          summary: activitySummary
        },
        clinicalSynergyInsight
      },
      generatedAt: new Date().toISOString()
    };
  }
}
