import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '../../../shared/theme/colors';
import { SunlightGuidance, SkinType } from '../types/guidance.types';

interface SunlightExposureTrackerProps {
  sunlight: SunlightGuidance;
  selectedSkinType: SkinType;
  onSkinTypeChange: (skinType: SkinType) => void;
}

export const SunlightExposureTracker: React.FC<SunlightExposureTrackerProps> = ({
  sunlight,
  selectedSkinType,
  onSkinTypeChange
}) => {
  const totalSeconds = sunlight.recommendedDailyMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync timer when recommended minutes change
  useEffect(() => {
    setIsRunning(false);
    setIsCompleted(false);
    setSecondsRemaining(sunlight.recommendedDailyMinutes * 60);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [sunlight.recommendedDailyMinutes]);

  // Interval timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleToggleTimer = () => {
    if (isCompleted) {
      setSecondsRemaining(totalSeconds);
      setIsCompleted(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setSecondsRemaining(totalSeconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVG circular arc calculation
  const circleRadius = 75;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * circleRadius;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const SKIN_TYPES: { key: SkinType; label: string; min: string }[] = [
    { key: 'type_1', label: 'Type I', min: '10m' },
    { key: 'type_2', label: 'Type II', min: '12m' },
    { key: 'type_3', label: 'Type III', min: '18m' },
    { key: 'type_4', label: 'Type IV', min: '22m' },
    { key: 'type_5', label: 'Type V', min: '30m' },
    { key: 'type_6', label: 'Type VI', min: '38m' }
  ];

  return (
    <View style={styles.container}>
      {/* Header & Phototype Switcher */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Solar Photobiology & Synthesis</Text>
        <Text style={styles.sectionSubtitle}>
          Exposure calibrated to your skin sensitivity to prevent sunburn:
        </Text>
      </View>

      <View style={styles.phototypeRow}>
        {SKIN_TYPES.map((st) => {
          const isSelected = selectedSkinType === st.key;
          return (
            <TouchableOpacity
              key={st.key}
              style={[styles.phototypePill, isSelected && styles.phototypePillActive]}
              onPress={() => onSkinTypeChange(st.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.ptText, isSelected && styles.ptTextActive]}>
                {st.label}
              </Text>
              <Text style={[styles.ptSubText, isSelected && styles.ptSubTextActive]}>
                {st.min}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Phototype Details Card */}
      <View style={styles.skinCard}>
        <View style={styles.skinCardHeader}>
          <Text style={styles.skinBadge}>{sunlight.skinType.toUpperCase()}</Text>
          <Text style={styles.skinName}>{sunlight.skinTypeDescription}</Text>
        </View>
        <View style={styles.windowBox}>
          <Text style={styles.windowLabel}>Optimal Solar Window:</Text>
          <Text style={styles.windowValue}>{sunlight.optimalWindow}</Text>
        </View>
      </View>

      {/* Interactive Outdoor Countdown Timer */}
      <View style={styles.timerCard}>
        <Text style={styles.timerTitle}>Outdoor Exposure Countdown</Text>
        <Text style={styles.timerSubtitle}>
          Uncover arms &amp; lower legs. Track direct sunlight until safe limit:
        </Text>

        <View style={styles.gaugeContainer}>
          <Svg width={180} height={180} viewBox="0 0 180 180">
            <G transform="rotate(-90 90 90)">
              {/* Background Track Circle */}
              <Circle
                cx={90}
                cy={90}
                r={circleRadius}
                stroke="#1E293B"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Active Progress Circle */}
              <Circle
                cx={90}
                cy={90}
                r={circleRadius}
                stroke={isCompleted ? Colors.clinical.teal : Colors.primary.amber}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </G>
          </Svg>

          <View style={styles.gaugeInnerContent}>
            <Text style={styles.timerDigits}>{formatTime(secondsRemaining)}</Text>
            <Text style={styles.timerStatus}>
              {isCompleted
                ? 'Target Met!'
                : isRunning
                ? 'Synthesizing...'
                : 'Ready'}
            </Text>
          </View>
        </View>

        {/* Timer Control Buttons */}
        <View style={styles.timerControls}>
          <TouchableOpacity
            style={[styles.primaryControlBtn, isRunning && styles.pauseBtn]}
            onPress={handleToggleTimer}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryControlBtnText}>
              {isCompleted ? 'Restart Session' : isRunning ? 'Pause Session' : 'Start Exposure'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleResetTimer}
            activeOpacity={0.7}
          >
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Completion Alert */}
        {isCompleted && (
          <View style={styles.completeAlertBox}>
            <Text style={styles.completeAlertTitle}>☀️ Safe Exposure Limit Reached!</Text>
            <Text style={styles.completeAlertBody}>
              You have achieved your target cutaneous synthesis. Please step into shade or apply broad-spectrum SPF 30+ to protect your skin barrier from photochemical erythema.
            </Text>
          </View>
        )}
      </View>

      {/* Safe Exposure Guidelines */}
      <View style={styles.guidanceCard}>
        <Text style={styles.guidanceCardTitle}>Safe Solar Exposure Guidelines</Text>
        <Text style={styles.guidanceCardBody}>{sunlight.safeExposureGuidance}</Text>
      </View>

      {/* Sunscreen vs Synthesis Advice */}
      <View style={styles.adviceCard}>
        <Text style={styles.adviceTitle}>🧴 Sunscreen Timing Protocol</Text>
        <Text style={styles.adviceBody}>{sunlight.sunscreenAdvice}</Text>
      </View>

      {/* UV Index Threshold Caution */}
      <View style={styles.uvCard}>
        <Text style={styles.uvTitle}>⚠️ UV Index Threshold Advisory</Text>
        <Text style={styles.uvBody}>{sunlight.uvThresholdNotice}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16
  },
  sectionHeader: {
    marginBottom: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    marginTop: 4
  },
  phototypeRow: {
    flexDirection: 'row',
    gap: 6
  },
  phototypePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: Colors.slate.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  phototypePillActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: Colors.primary.amber
  },
  ptText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate.textMuted
  },
  ptTextActive: {
    color: Colors.primary.amber
  },
  ptSubText: {
    fontSize: 10,
    color: Colors.slate.textMuted,
    marginTop: 2
  },
  ptSubTextActive: {
    color: Colors.primary.amber,
    fontWeight: '700'
  },
  skinCard: {
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  skinCardHeader: {
    marginBottom: 8
  },
  skinBadge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4
  },
  skinName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  windowBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.clinical.teal
  },
  windowLabel: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  windowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.clinical.teal,
    marginTop: 2
  },
  timerCard: {
    backgroundColor: Colors.slate.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  timerSubtitle: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16
  },
  gaugeContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  gaugeInnerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  timerDigits: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.slate.textMain,
    letterSpacing: 1
  },
  timerStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.amber,
    marginTop: 4
  },
  timerControls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%'
  },
  primaryControlBtn: {
    flex: 2,
    backgroundColor: Colors.primary.amber,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pauseBtn: {
    backgroundColor: '#D97706'
  },
  primaryControlBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.slate.textMuted
  },
  completeAlertBox: {
    marginTop: 16,
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.clinical.lowRisk
  },
  completeAlertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.clinical.lowRisk,
    marginBottom: 4
  },
  completeAlertBody: {
    fontSize: 12,
    color: Colors.slate.textMain,
    lineHeight: 17
  },
  guidanceCard: {
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  guidanceCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate.textMain,
    marginBottom: 6
  },
  guidanceCardBody: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 18
  },
  adviceCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  adviceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FBBF24',
    marginBottom: 4
  },
  adviceBody: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 17
  },
  uvCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.clinical.highRisk
  },
  uvTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F87171',
    marginBottom: 4
  },
  uvBody: {
    fontSize: 12,
    color: '#FECACA',
    lineHeight: 17
  }
});
