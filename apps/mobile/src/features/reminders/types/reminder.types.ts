export interface ReminderPreferences {
  userId?: string;
  sunlightReminderEnabled: boolean;
  sunlightTime: string; // HH:mm format, e.g. "10:30"
  dietaryReminderEnabled: boolean;
  dietaryTime: string; // HH:mm format, e.g. "12:30"
  supplementReminderEnabled: boolean;
  supplementTime: string; // HH:mm format, e.g. "09:00"
  reassessmentReminderEnabled: boolean;
  reassessmentIntervalDays: number; // e.g. 14, 30
  pushToken?: string;
  updatedAt?: string;
}

export type ReminderType = 'sunlight' | 'dietary' | 'supplement' | 'reassessment' | 'test';

export interface NotificationPayload {
  title: string;
  body: string;
  data: {
    type: ReminderType;
    route?: string;
    timestamp: string;
  };
}

export interface ScheduledNotificationItem {
  identifier: string;
  type: ReminderType;
  title: string;
  triggerTime?: string;
  intervalDays?: number;
  nextTriggerDate?: string;
}

export interface ReminderNotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: number;
  lightColor: string;
  vibrationPattern?: number[];
}
