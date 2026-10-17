import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskTier } from '../types/scoring.types';
import { Colors } from '../../../shared/theme/colors';

interface RiskLevelBadgeProps {
  tier: RiskTier;
  size?: 'small' | 'medium' | 'large';
}

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({ tier, size = 'medium' }) => {
  const getBadgeConfig = () => {
    switch (tier) {
      case 'high':
        return {
          label: 'HIGH RISK',
          subLabel: 'Deficiency Imbalance Detected',
          icon: '🚨',
          color: Colors.clinical.highRisk,
          bgColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'rgba(239, 68, 68, 0.45)'
        };
      case 'moderate':
        return {
          label: 'MODERATE RISK',
          subLabel: 'Sub-Optimal Serum Marker Risk',
          icon: '⚠️',
          color: Colors.primary.amber,
          bgColor: 'rgba(245, 158, 11, 0.15)',
          borderColor: 'rgba(245, 158, 11, 0.45)'
        };
      case 'low':
      default:
        return {
          label: 'LOW RISK',
          subLabel: 'Healthy Solar & Dietary Balance',
          icon: '🛡️',
          color: Colors.clinical.lowRisk,
          bgColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: 'rgba(16, 185, 129, 0.45)'
        };
    }
  };

  const config = getBadgeConfig();

  const isLarge = size === 'large';
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badgeContainer,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          paddingVertical: isLarge ? 8 : isSmall ? 4 : 6,
          paddingHorizontal: isLarge ? 16 : isSmall ? 10 : 14
        }
      ]}
    >
      <Text style={[styles.badgeIcon, isLarge && styles.iconLarge, isSmall && styles.iconSmall]}>
        {config.icon}
      </Text>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.badgeLabel,
            { color: config.color },
            isLarge && styles.labelLarge,
            isSmall && styles.labelSmall
          ]}
        >
          {config.label}
        </Text>
        {isLarge && <Text style={styles.badgeSubLabel}>{config.subLabel}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 8,
    alignSelf: 'center'
  },
  badgeIcon: {
    fontSize: 16
  },
  iconLarge: {
    fontSize: 20
  },
  iconSmall: {
    fontSize: 12
  },
  textContainer: {
    alignItems: 'center'
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2
  },
  labelLarge: {
    fontSize: 16,
    letterSpacing: 1.5
  },
  labelSmall: {
    fontSize: 11,
    letterSpacing: 0.8
  },
  badgeSubLabel: {
    color: Colors.slate.textMuted,
    fontSize: 11,
    marginTop: 2
  }
});
