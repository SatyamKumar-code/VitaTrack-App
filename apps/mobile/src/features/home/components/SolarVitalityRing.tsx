import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../../shared/theme/colors';

interface SolarVitalityRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  minutesToday?: number;
  targetMinutes?: number;
}

export const SolarVitalityRing: React.FC<SolarVitalityRingProps> = ({
  percentage = 75,
  size = 110,
  strokeWidth = 9,
  minutesToday = 15,
  targetMinutes = 20
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (circumference * clampedPercentage) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={Colors.primary.amber} />
            <Stop offset="100%" stopColor={Colors.primary.orange} />
          </LinearGradient>
        </Defs>

        {/* Track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.slate.cardBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#solarGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center Vitality Metrics */}
      <View style={styles.centerContent}>
        <Text style={styles.percentageText}>{clampedPercentage}%</Text>
        <Text style={styles.subtextLabel}>
          {minutesToday}/{targetMinutes}m
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  svg: {
    position: 'absolute'
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  percentageText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.slate.textMain,
    letterSpacing: -0.5
  },
  subtextLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary.amber,
    marginTop: 1
  }
});
