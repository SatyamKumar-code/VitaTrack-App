import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Colors } from '../../../shared/theme/colors';

interface ReminderCardProps {
  icon: string;
  badgeColor?: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  time?: string;
  onTimeChange?: (time: string) => void;
  intervalDays?: number;
  onIntervalChange?: (days: number) => void;
  presetTimes?: string[];
  presetIntervals?: number[];
  onTestPress?: () => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  icon,
  badgeColor = Colors.primary.amber,
  title,
  subtitle,
  enabled,
  onToggle,
  time,
  onTimeChange,
  intervalDays,
  onIntervalChange,
  presetTimes = ['09:00', '10:30', '12:30', '16:00'],
  presetIntervals = [7, 14, 30],
  onTestPress
}) => {
  return (
    <View style={[styles.card, !enabled && styles.cardDisabled]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconContainer, { backgroundColor: badgeColor + '20', borderColor: badgeColor + '50' }]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.subtitleText}>{subtitle}</Text>
          </View>
        </View>

        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: Colors.slate.cardBorder, true: Colors.primary.amber }}
          thumbColor={enabled ? '#FFFFFF' : Colors.slate.textMuted}
        />
      </View>

      {/* Time Picker / Presets Section (if time is provided and enabled) */}
      {enabled && time && onTimeChange && (
        <View style={styles.schedulerSection}>
          <View style={styles.timeDisplayRow}>
            <Text style={styles.schedulerLabel}>Scheduled Alert Time:</Text>
            <View style={styles.currentTimeBadge}>
              <Text style={styles.currentTimeText}>⏰ {time}</Text>
            </View>
          </View>

          <View style={styles.presetRow}>
            {presetTimes.map((preset) => {
              const isSelected = preset === time;
              return (
                <TouchableOpacity
                  key={preset}
                  style={[styles.presetButton, isSelected && styles.presetButtonActive]}
                  onPress={() => onTimeChange(preset)}
                >
                  <Text style={[styles.presetButtonText, isSelected && styles.presetButtonTextActive]}>
                    {preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Interval Picker / Presets Section (for periodic reassessment) */}
      {enabled && intervalDays !== undefined && onIntervalChange && (
        <View style={styles.schedulerSection}>
          <View style={styles.timeDisplayRow}>
            <Text style={styles.schedulerLabel}>Follow-Up Frequency:</Text>
            <View style={styles.currentTimeBadge}>
              <Text style={styles.currentTimeText}>🗓️ Every {intervalDays} Days</Text>
            </View>
          </View>

          <View style={styles.presetRow}>
            {presetIntervals.map((days) => {
              const isSelected = days === intervalDays;
              return (
                <TouchableOpacity
                  key={days}
                  style={[styles.presetButton, isSelected && styles.presetButtonActive]}
                  onPress={() => onIntervalChange(days)}
                >
                  <Text style={[styles.presetButtonText, isSelected && styles.presetButtonTextActive]}>
                    {days === 7 ? 'Weekly (7d)' : days === 14 ? 'Bi-Weekly (14d)' : 'Monthly (30d)'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Instant Preview / Test Button */}
      {enabled && onTestPress && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.testButton} onPress={onTestPress}>
            <Text style={styles.testButtonText}>🔔 Preview Notification Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.slate.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3
  },
  cardDisabled: {
    opacity: 0.65,
    borderColor: Colors.slate.cardBorder + '60'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  iconText: {
    fontSize: 22
  },
  textContainer: {
    flex: 1
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.slate.textMain,
    marginBottom: 2
  },
  subtitleText: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 16
  },
  schedulerSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.slate.cardBorder + '80'
  },
  timeDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  schedulerLabel: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    fontWeight: '500'
  },
  currentTimeBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  currentTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary.amber
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  presetButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  presetButtonActive: {
    backgroundColor: Colors.primary.amber + '25',
    borderColor: Colors.primary.amber
  },
  presetButtonText: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    fontWeight: '600'
  },
  presetButtonTextActive: {
    color: Colors.primary.amber,
    fontWeight: '700'
  },
  actionRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  testButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  testButtonText: {
    fontSize: 12,
    color: Colors.slate.textMain,
    fontWeight: '600'
  }
});
