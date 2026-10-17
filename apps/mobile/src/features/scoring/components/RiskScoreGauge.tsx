import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { AssessmentSubScores, RiskTier } from '../types/scoring.types';
import { Colors } from '../../../shared/theme/colors';


interface RiskScoreGaugeProps {
  score: number;
  riskTier: RiskTier;
  subScores?: AssessmentSubScores;
  size?: number;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  score,
  riskTier,
  subScores,
  size = 210
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = React.useState(0);

  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Clamped score in [0, 100]
  const clampedScore = Math.min(100, Math.max(0, score));

  useEffect(() => {
    animatedValue.setValue(0);
    const animation = Animated.timing(animatedValue, {
      toValue: clampedScore,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    });

    const listenerId = animatedValue.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });

    animation.start();

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [clampedScore]);

  // Stroke offset calculation driven smoothly by displayScore
  const strokeOffset = circumference - (circumference * displayScore) / 100;

  const getTierColors = () => {
    switch (riskTier) {
      case 'high':
        return {
          start: '#EF4444',
          end: '#DC2626',
          glow: 'rgba(239, 68, 68, 0.25)',
          text: Colors.clinical.highRisk
        };
      case 'moderate':
        return {
          start: '#FBBF24',
          end: '#D97706',
          glow: 'rgba(245, 158, 11, 0.25)',
          text: Colors.primary.amber
        };
      case 'low':
      default:
        return {
          start: '#34D399',
          end: '#059669',
          glow: 'rgba(16, 185, 129, 0.25)',
          text: Colors.clinical.lowRisk
        };
    }
  };

  const colors = getTierColors();

  return (
    <View style={styles.container}>
      <View style={[styles.gaugeWrapper, { width: size, height: size }]}>
        {/* Ambient Glow Backdrop */}
        <View
          style={[
            styles.glowRing,
            {
              width: size * 0.85,
              height: size * 0.85,
              borderRadius: (size * 0.85) / 2,
              backgroundColor: colors.glow
            }
          ]}
        />

        {/* Circular SVG Gauge */}
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.start} />
              <Stop offset="100%" stopColor={colors.end} />
            </LinearGradient>
          </Defs>

          <G transform={`rotate(-90 ${center} ${center})`}>
            {/* Background Muted Track */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Active Colored Progress Arc */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#scoreGaugeGrad)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </G>
        </Svg>

        {/* Centered Numerical Value & Label */}
        <View style={styles.centerTextOverlay}>
          <Text style={[styles.scoreValue, { color: colors.text }]}>{displayScore}</Text>
          <Text style={styles.scoreDenominator}>/ 100</Text>
          <Text style={styles.scoreCaption}>Risk Score</Text>
        </View>
      </View>

      {/* Sub-Score Breakdown Chips */}
      {subScores && (
        <View style={styles.subScoresGrid}>
          <View style={styles.subScoreItem}>
            <Text style={styles.subScoreLabel}>Symptoms</Text>
            <Text style={styles.subScoreValue}>{subScores.symptomScore} / 45</Text>
            <View style={styles.miniBarTrack}>
              <View
                style={[
                  styles.miniBarFill,
                  {
                    width: `${Math.min(100, (subScores.symptomScore / 45) * 100)}%`,
                    backgroundColor: colors.start
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.subScoreItem}>
            <Text style={styles.subScoreLabel}>Solar Deficit</Text>
            <Text style={styles.subScoreValue}>{subScores.solarDeficitScore} / 25</Text>
            <View style={styles.miniBarTrack}>
              <View
                style={[
                  styles.miniBarFill,
                  {
                    width: `${Math.min(100, (subScores.solarDeficitScore / 25) * 100)}%`,
                    backgroundColor: colors.start
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.subScoreItem}>
            <Text style={styles.subScoreLabel}>Dietary Deficit</Text>
            <Text style={styles.subScoreValue}>{subScores.dietaryDeficitScore} / 20</Text>
            <View style={styles.miniBarTrack}>
              <View
                style={[
                  styles.miniBarFill,
                  {
                    width: `${Math.min(100, (subScores.dietaryDeficitScore / 20) * 100)}%`,
                    backgroundColor: colors.start
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.subScoreItem}>
            <Text style={styles.subScoreLabel}>Medical</Text>
            <Text style={styles.subScoreValue}>{subScores.medicalMultiplierScore} / 10</Text>
            <View style={styles.miniBarTrack}>
              <View
                style={[
                  styles.miniBarFill,
                  {
                    width: `${Math.min(100, (subScores.medicalMultiplierScore / 10) * 100)}%`,
                    backgroundColor: colors.start
                  }
                ]}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12
  },
  gaugeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  glowRing: {
    position: 'absolute'
  },
  centerTextOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1
  },
  scoreDenominator: {
    fontSize: 14,
    color: Colors.slate.textMuted,
    fontWeight: '700',
    marginTop: -4
  },
  scoreCaption: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
    fontWeight: '600'
  },
  subScoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
    gap: 10
  },
  subScoreItem: {
    width: '48%',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  subScoreLabel: {
    color: Colors.slate.textMuted,
    fontSize: 11,
    fontWeight: '600'
  },
  subScoreValue: {
    color: Colors.slate.textMain,
    fontSize: 13,
    fontWeight: '800',
    marginVertical: 4
  },
  miniBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2
  }
});
