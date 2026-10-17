export interface IReminderPreferences {
  userId: string;
  sunlightReminderEnabled: boolean;
  sunlightTime: string; // HH:mm format, e.g. "10:30"
  dietaryReminderEnabled: boolean;
  dietaryTime: string; // HH:mm format, e.g. "12:30"
  supplementReminderEnabled: boolean;
  supplementTime: string; // HH:mm format, e.g. "09:00"
  reassessmentReminderEnabled: boolean;
  reassessmentIntervalDays: number; // e.g. 14, 30
  pushToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateReminderPreferencesInput {
  sunlightReminderEnabled?: boolean;
  sunlightTime?: string;
  dietaryReminderEnabled?: boolean;
  dietaryTime?: string;
  supplementReminderEnabled?: boolean;
  supplementTime?: string;
  reassessmentReminderEnabled?: boolean;
  reassessmentIntervalDays?: number;
  pushToken?: string;
}

export interface ReminderNotificationPayload {
  title: string;
  body: string;
  data: {
    type: 'sunlight' | 'dietary' | 'supplement' | 'reassessment' | 'test';
    route?: string;
    timestamp: string;
  };
}
