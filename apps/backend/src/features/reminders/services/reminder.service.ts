import { ReminderPreferences, IReminderPreferencesDocument } from '../models/reminderPreference.model';
import { UpdateReminderPreferencesDto } from '../validators/reminder.validator';
import { ReminderNotificationPayload } from '../types/reminder.types';

export class ReminderService {
  /**
   * Fetch current user's reminder preferences, initializing defaults if none exist
   */
  public static async getPreferences(userId: string): Promise<IReminderPreferencesDocument> {
    let prefs = await ReminderPreferences.findOne({ userId });

    if (!prefs) {
      prefs = await ReminderPreferences.create({
        userId,
        sunlightReminderEnabled: true,
        sunlightTime: '10:30',
        dietaryReminderEnabled: true,
        dietaryTime: '12:30',
        supplementReminderEnabled: true,
        supplementTime: '09:00',
        reassessmentReminderEnabled: true,
        reassessmentIntervalDays: 14
      });
    }

    return prefs;
  }

  /**
   * Update or upsert user's reminder preferences
   */
  public static async updatePreferences(
    userId: string,
    data: UpdateReminderPreferencesDto
  ): Promise<IReminderPreferencesDocument> {
    const updated = await ReminderPreferences.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    );

    return updated;
  }

  /**
   * Generate context-aware reminder notification payloads for testing or dispatch
   */
  public static generateNotificationContent(
    type: 'sunlight' | 'dietary' | 'supplement' | 'reassessment' | 'test' = 'test',
    metadata?: { durationMinutes?: number; intervalDays?: number }
  ): ReminderNotificationPayload {
    const timestamp = new Date().toISOString();

    switch (type) {
      case 'sunlight':
        return {
          title: '☀️ Daily Sunlight Exposure Window',
          body: `Time for your recommended ${
            metadata?.durationMinutes || 15
          }-minute sunlight exposure. Step outside to safely boost natural Vitamin D synthesis.`,
          data: {
            type: 'sunlight',
            route: '/guidance',
            timestamp
          }
        };

      case 'dietary':
        return {
          title: '🥗 Nutrient-Rich Meal Reminder',
          body: 'Consider including Vitamin D rich foods (fatty fish, egg yolks, fortified dairy) paired with healthy fats for enhanced absorption.',
          data: {
            type: 'dietary',
            route: '/guidance',
            timestamp
          }
        };

      case 'supplement':
        return {
          title: '💊 Supplement Schedule Reminder',
          body: 'Reminder for your physician-recommended Vitamin D3 & cofactor intake with your meal.',
          data: {
            type: 'supplement',
            route: '/guidance',
            timestamp
          }
        };

      case 'reassessment':
        return {
          title: '📋 Periodic Clinical Re-Assessment Due',
          body: `It has been ${
            metadata?.intervalDays || 14
          } days since your last evaluation. Re-check your symptoms to track your progress score.`,
          data: {
            type: 'reassessment',
            route: '/assessment',
            timestamp
          }
        };

      case 'test':
      default:
        return {
          title: '🔔 VitaTrack Health Reminder Test',
          body: 'Your notification system is actively configured! You will receive scheduled reminders for sunlight, diet, and clinical follow-ups.',
          data: {
            type: 'test',
            route: '/reminders',
            timestamp
          }
        };
    }
  }
}
