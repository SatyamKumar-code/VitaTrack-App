import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../shared/theme/colors';

interface BiometricMetricCardProps {
  icon: string;
  title: string;
  value: string | number | undefined | null;
  unit: string;
  subtitle?: string;
  progressPercent?: number; // 0 to 100
  accentColor?: string;
  badgeLabel?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'neutral';
  isMissingSensor?: boolean;
}

export const BiometricMetricCard: React.FC<BiometricMetricCardProps> = ({
  icon,
  title,
  value,
  unit,
  subtitle,
  progressPercent,
  accentColor = Colors.primary.amber,
  badgeLabel,
  badgeType = 'info',
  isMissingSensor = false
}) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: Colors.clinical.lowRisk, border: '#10B98133' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: Colors.clinical.moderateRisk, border: '#F59E0B33' };
      case 'neutral':
        return { bg: 'rgba(148, 163, 184, 0.12)', text: Colors.slate.textMuted, border: '#334155' };
      case 'info':
      default:
        return { bg: 'rgba(13, 148, 136, 0.15)', text: Colors.clinical.teal, border: '#0D948833' };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {badgeLabel && (
          <View
            style={[
              styles.badge,
              { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }
            ]}
          >
            <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{badgeLabel}</Text>
          </View>
        )}
      </View>

      {isMissingSensor ? (
        <View style={styles.missingSensorContainer}>
          <Text style={styles.missingSensorText}>Sensor not detected on watch</Text>
          <Text style={styles.missingSensorSubtext}>Manual assessment remains unaffected</Text>
        </View>
      ) : (
        <>
          <View style={styles.valueRow}>
            <Text style={[styles.valueText, { color: accentColor }]}>
              {value !== undefined && value !== null ? value : '—'}
            </Text>
            {unit ? <Text style={styles.unitText}>{unit}</Text> : null}
          </View>

          {progressPercent !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(Math.max(progressPercent, 0), 100)}%`,
                      backgroundColor: accentColor
                    }
                  ]}
                />
              </View>
            </View>
          )}

          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.slate.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 16,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    fontSize: 18,
    marginRight: 8
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6
  },
  valueText: {
    fontSize: 28,
    fontWeight: '800'
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.slate.textMuted,
    marginLeft: 6
  },
  progressContainer: {
    marginVertical: 6
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 3
  },
  subtitle: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    marginTop: 4
  },
  missingSensorContainer: {
    paddingVertical: 8,
    alignItems: 'flex-start'
  },
  missingSensorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.textMuted
  },
  missingSensorSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  }
});
