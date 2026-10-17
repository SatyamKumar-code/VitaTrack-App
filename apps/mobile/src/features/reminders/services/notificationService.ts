import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ReminderPreferences, ReminderType, ScheduledNotificationItem } from '../types/reminder.types';

// Configure foreground notification behavior
if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
      })
    });
  } catch (err) {
    console.warn('[NotificationService] setNotificationHandler warning:', err);
  }
}

export const NotificationService = {
  /**
   * Set up Android Notification Channels with high importance and tailored colors
   */
  async configureAndroidChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      await Notifications.setNotificationChannelAsync('vitatrack-sunlight', {
        name: '☀️ Daily Sunlight Alerts',
        description: 'Context-aware notifications for safe, optimal daily sun exposure.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F59E0B',
        enableLights: true,
        enableVibrate: true
      });

      await Notifications.setNotificationChannelAsync('vitatrack-dietary', {
        name: '🥗 Dietary & Supplement Alerts',
        description: 'Reminders for Vitamin D rich meals and physician-prescribed supplements.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        enableLights: true,
        enableVibrate: true
      });

      await Notifications.setNotificationChannelAsync('vitatrack-reassessment', {
        name: '📋 Clinical Re-Assessment Follow-Ups',
        description: 'Periodic bi-weekly and monthly nudges to re-evaluate symptoms.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
        enableLights: true,
        enableVibrate: true
      });
    } catch (err) {
      console.warn('[NotificationService] Android channel setup warning:', err);
    }
  },

  /**
   * Check current notification permission status
   */
  async checkPermissions(): Promise<Notifications.PermissionStatus> {
    if (Platform.OS === 'web') {
      return (typeof Notification !== 'undefined' && Notification.permission === 'granted')
        ? Notifications.PermissionStatus.GRANTED
        : Notifications.PermissionStatus.UNDETERMINED;
    }

    try {
      const settings = await Notifications.getPermissionsAsync();
      return settings.status;
    } catch {
      return Notifications.PermissionStatus.UNDETERMINED;
    }
  },

  /**
   * Request user permission for local and push alerts
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      if (typeof Notification !== 'undefined') {
        const result = await Notification.requestPermission();
        return result === 'granted';
      }
      return true; // web fallback simulation
    }

    try {
      const existing = await Notifications.getPermissionsAsync();
      let finalStatus = existing.status;

      if (existing.status !== Notifications.PermissionStatus.GRANTED) {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = requested.status;
      }

      await this.configureAndroidChannels();
      return finalStatus === Notifications.PermissionStatus.GRANTED;
    } catch (error) {
      console.warn('[NotificationService] Permission request warning:', error);
      return false;
    }
  },

  /**
   * Parse HH:mm 24h string into hour and minute numbers
   */
  parseTimeString(timeStr: string): { hour: number; minute: number } {
    const parts = timeStr.split(':');
    const hour = parseInt(parts[0] || '10', 10);
    const minute = parseInt(parts[1] || '30', 10);
    return {
      hour: isNaN(hour) ? 10 : Math.min(Math.max(hour, 0), 23),
      minute: isNaN(minute) ? 30 : Math.min(Math.max(minute, 0), 59)
    };
  },

  /**
   * Schedule recurring daily sunlight reminder (TASK-P7-02)
   */
  async scheduleSunlightReminder(
    timeStr: string,
    durationMinutes: number = 15
  ): Promise<string | null> {
    if (Platform.OS === 'web') return 'web-sunlight-mock';

    try {
      const { hour, minute } = this.parseTimeString(timeStr);
      await this.cancelReminderByCategory('sunlight');

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '☀️ Daily Sunlight Exposure Window',
          body: `Step outside for your ${durationMinutes}-minute sun exposure session to stimulate natural Vitamin D3 synthesis.`,
          data: { type: 'sunlight', route: '/guidance', timestamp: new Date().toISOString() },
          sound: true
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'vitatrack-sunlight'
        }
      });

      return identifier;
    } catch (error) {
      console.warn('[NotificationService] Failed to schedule sunlight reminder:', error);
      return null;
    }
  },

  /**
   * Schedule recurring daily meal & diet reminder (TASK-P7-03)
   */
  async scheduleDietaryReminder(timeStr: string): Promise<string | null> {
    if (Platform.OS === 'web') return 'web-dietary-mock';

    try {
      const { hour, minute } = this.parseTimeString(timeStr);
      await this.cancelReminderByCategory('dietary');

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🥗 Nutrient-Rich Meal Reminder',
          body: 'Boost Vitamin D absorption: include dietary sources (fatty fish, eggs, fortified milk) paired with healthy dietary fats.',
          data: { type: 'dietary', route: '/guidance', timestamp: new Date().toISOString() },
          sound: true
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'vitatrack-dietary'
        }
      });

      return identifier;
    } catch (error) {
      console.warn('[NotificationService] Failed to schedule dietary reminder:', error);
      return null;
    }
  },

  /**
   * Schedule recurring daily supplement reminder (TASK-P7-03)
   */
  async scheduleSupplementReminder(timeStr: string): Promise<string | null> {
    if (Platform.OS === 'web') return 'web-supplement-mock';

    try {
      const { hour, minute } = this.parseTimeString(timeStr);
      await this.cancelReminderByCategory('supplement');

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Supplement Schedule Reminder',
          body: 'Time for your daily clinician-recommended Vitamin D3 & co-factor supplement.',
          data: { type: 'supplement', route: '/guidance', timestamp: new Date().toISOString() },
          sound: true
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'vitatrack-dietary'
        }
      });

      return identifier;
    } catch (error) {
      console.warn('[NotificationService] Failed to schedule supplement reminder:', error);
      return null;
    }
  },

  /**
   * Schedule periodic clinical re-assessment reminder (TASK-P7-04)
   */
  async scheduleReassessmentReminder(intervalDays: number = 14): Promise<string | null> {
    if (Platform.OS === 'web') return 'web-reassessment-mock';

    try {
      await this.cancelReminderByCategory('reassessment');

      const seconds = Math.max(intervalDays, 1) * 24 * 60 * 60;

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📋 Periodic Re-Assessment Due',
          body: `It has been ${intervalDays} days since your last check-in. Re-evaluate your symptoms to track your recovery trajectory.`,
          data: { type: 'reassessment', route: '/assessment', timestamp: new Date().toISOString() },
          sound: true
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          repeats: true,
          channelId: 'vitatrack-reassessment'
        }
      });

      return identifier;
    } catch (error) {
      console.warn('[NotificationService] Failed to schedule reassessment reminder:', error);
      return null;
    }
  },

  /**
   * Fire an immediate preview/test notification (5 seconds delay or immediate)
   */
  async sendImmediateTestNotification(
    type: ReminderType = 'test',
    customTitle?: string,
    customBody?: string
  ): Promise<string | null> {
    const title =
      customTitle ||
      (type === 'sunlight'
        ? '☀️ Daily Sunlight Exposure Alert'
        : type === 'dietary'
        ? '🥗 Nutrient-Rich Meal Reminder'
        : type === 'supplement'
        ? '💊 Supplement Intake Reminder'
        : type === 'reassessment'
        ? '📋 Periodic Re-Assessment Due'
        : '🔔 VitaTrack Health Reminder Test');

    const body =
      customBody ||
      'VitaTrack notification scheduler is active and configured for your personalized solar & clinical schedule.';

    const channelId =
      type === 'sunlight'
        ? 'vitatrack-sunlight'
        : type === 'reassessment'
        ? 'vitatrack-reassessment'
        : 'vitatrack-dietary';

    if (Platform.OS === 'web') {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      return 'web-immediate-sent';
    }

    try {
      await this.configureAndroidChannels();

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type, route: type === 'reassessment' ? '/assessment' : '/guidance', timestamp: new Date().toISOString() },
          sound: true
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          repeats: false,
          channelId
        }
      });

      return identifier;
    } catch (err) {
      console.warn('[NotificationService] Immediate test dispatch warning:', err);
      return null;
    }
  },

  /**
   * Cancel reminders matching a specific category
   */
  async cancelReminderByCategory(type: ReminderType): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduled) {
        if (notification.content?.data?.type === type) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.warn('[NotificationService] Error cancelling reminder category:', error);
    }
  },

  /**
   * Cancel all scheduled VitaTrack notifications
   */
  async cancelAllReminders(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.warn('[NotificationService] Error cancelling all notifications:', error);
    }
  },

  /**
   * Inspect all currently scheduled notifications
   */
  async getAllScheduled(): Promise<ScheduledNotificationItem[]> {
    if (Platform.OS === 'web') {
      return [
        {
          identifier: 'web-sunlight-sim',
          type: 'sunlight',
          title: '☀️ Daily Sunlight Exposure Window',
          triggerTime: '10:30'
        },
        {
          identifier: 'web-dietary-sim',
          type: 'dietary',
          title: '🥗 Nutrient-Rich Meal Reminder',
          triggerTime: '12:30'
        },
        {
          identifier: 'web-supplement-sim',
          type: 'supplement',
          title: '💊 Supplement Schedule Reminder',
          triggerTime: '09:00'
        },
        {
          identifier: 'web-reassessment-sim',
          type: 'reassessment',
          title: '📋 Periodic Re-Assessment Due',
          intervalDays: 14
        }
      ];
    }

    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications.map((n) => ({
        identifier: n.identifier,
        type: (n.content?.data?.type as ReminderType) || 'test',
        title: n.content?.title || 'VitaTrack Reminder',
        triggerTime: (n.trigger as any)?.hour
          ? `${String((n.trigger as any).hour).padStart(2, '0')}:${String((n.trigger as any).minute || 0).padStart(2, '0')}`
          : undefined,
        intervalDays: (n.trigger as any)?.seconds
          ? Math.round((n.trigger as any).seconds / 86400)
          : undefined
      }));
    } catch {
      return [];
    }
  },

  /**
   * Synchronize local notification triggers with latest user preferences
   */
  async syncWithPreferences(
    prefs: ReminderPreferences,
    sunlightExposureMinutes: number = 15
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    if (prefs.sunlightReminderEnabled) {
      await this.scheduleSunlightReminder(prefs.sunlightTime, sunlightExposureMinutes);
    } else {
      await this.cancelReminderByCategory('sunlight');
    }

    if (prefs.dietaryReminderEnabled) {
      await this.scheduleDietaryReminder(prefs.dietaryTime);
    } else {
      await this.cancelReminderByCategory('dietary');
    }

    if (prefs.supplementReminderEnabled) {
      await this.scheduleSupplementReminder(prefs.supplementTime);
    } else {
      await this.cancelReminderByCategory('supplement');
    }

    if (prefs.reassessmentReminderEnabled) {
      await this.scheduleReassessmentReminder(prefs.reassessmentIntervalDays);
    } else {
      await this.cancelReminderByCategory('reassessment');
    }
  }
};
