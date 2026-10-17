import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../../shared/theme/colors';
import {
  SunExposureData,
  TimeOfDay,
  ClothingCoverage
} from '../types/assessment.types';

interface SolarExposureStepProps {
  data: SunExposureData;
  onChange: (updated: SunExposureData) => void;
  onNext: () => void;
}

const PRESET_MINUTES = [0, 15, 30, 45, 60, 90, 120];

const TIME_OPTIONS: Array<{ value: TimeOfDay; label: string; badge: string; hint: string }> = [
  {
    value: 'early_morning',
    label: 'Early Morning',
    badge: 'Before 10 AM',
    hint: 'Low UV index (< 2). Minimal cutaneous synthesis.'
  },
  {
    value: 'midday',
    label: 'Midday Peak',
    badge: '10 AM - 3 PM',
    hint: 'Peak UV-B waveband. Optimal synthesis window.'
  },
  {
    value: 'late_afternoon',
    label: 'Late Afternoon',
    badge: 'After 3 PM',
    hint: 'Atmosphere filters UV-B wavelengths.'
  },
  {
    value: 'mixed',
    label: 'Mixed / Variable',
    badge: 'Varied Times',
    hint: 'Irregular outdoor shifts throughout the week.'
  }
];

const CLOTHING_OPTIONS: Array<{
  value: ClothingCoverage;
  label: string;
  exposure: string;
  hint: string;
}> = [
  {
    value: 'low',
    label: 'Minimal Coverage',
    exposure: '~35% skin exposed',
    hint: 'Shorts, short sleeves, or swimwear.'
  },
  {
    value: 'moderate',
    label: 'Moderate Coverage',
    exposure: '~15-20% skin exposed',
    hint: 'Short sleeves with jeans or long trousers.'
  },
  {
    value: 'high',
    label: 'High Coverage',
    exposure: '< 10% skin exposed',
    hint: 'Long sleeves, long pants, hats, or modest attire.'
  }
];

export const SolarExposureStep: React.FC<SolarExposureStepProps> = ({
  data,
  onChange,
  onNext
}) => {
  const handleUpdate = <K extends keyof SunExposureData>(key: K, val: SunExposureData[K]) => {
    onChange({
      ...data,
      [key]: val
    });
  };

  const adjustMinutes = (delta: number) => {
    const updated = Math.max(0, Math.min(360, data.dailyMinutesOutdoors + delta));
    handleUpdate('dailyMinutesOutdoors', updated);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Daily Outdoor Minutes */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Average Daily Outdoor Sunlight</Text>
          <Text style={styles.cardHint}>
            Direct outdoor exposure without glass window filtering (glass blocks 100% UV-B).
          </Text>
        </View>

        {/* Counter Display & Steppers */}
        <View style={styles.counterRow}>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => adjustMinutes(-5)}
            activeOpacity={0.7}
          >
            <Text style={styles.adjustBtnText}>&minus; 5m</Text>
          </TouchableOpacity>

          <View style={styles.displayBadge}>
            <Text style={styles.displayNumber}>{data.dailyMinutesOutdoors}</Text>
            <Text style={styles.displayUnit}>Minutes / Day</Text>
          </View>

          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => adjustMinutes(5)}
            activeOpacity={0.7}
          >
            <Text style={styles.adjustBtnText}>+ 5m</Text>
          </TouchableOpacity>
        </View>

        {/* Preset Quick Chips */}
        <View style={styles.presetRow}>
          {PRESET_MINUTES.map((m) => {
            const isSelected = data.dailyMinutesOutdoors === m;
            return (
              <TouchableOpacity
                key={m}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
                onPress={() => handleUpdate('dailyMinutesOutdoors', m)}
                activeOpacity={0.7}
              >
                <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                  {m === 0 ? 'None' : `${m}m`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Typical Exposure Time of Day */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Typical Time of Day Outdoors</Text>
          <Text style={styles.cardHint}>
            UV-B intensity varies dramatically based on the solar zenith angle.
          </Text>
        </View>

        <View style={styles.gridContainer}>
          {TIME_OPTIONS.map((opt) => {
            const isSelected = data.timeOfDay === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.gridCard, isSelected && styles.gridCardActive]}
                onPress={() => handleUpdate('timeOfDay', opt.value)}
                activeOpacity={0.7}
              >
                <View style={styles.gridCardTop}>
                  <Text style={[styles.gridCardTitle, isSelected && styles.gridCardTitleActive]}>
                    {opt.label}
                  </Text>
                  <View style={[styles.miniBadge, isSelected && styles.miniBadgeActive]}>
                    <Text
                      style={[styles.miniBadgeText, isSelected && styles.miniBadgeTextActive]}
                    >
                      {opt.badge}
                    </Text>
                  </View>
                </View>
                <Text style={styles.gridCardHint}>{opt.hint}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Clothing Coverage */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Typical Clothing Coverage Outdoors</Text>
          <Text style={styles.cardHint}>
            Fabric blocks up to 99% of photon penetration to dermal pre-vitamin D.
          </Text>
        </View>

        <View style={styles.clothingColumn}>
          {CLOTHING_OPTIONS.map((opt) => {
            const isSelected = data.clothingCoverage === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.clothingCard,
                  isSelected && styles.clothingCardActive
                ]}
                onPress={() => handleUpdate('clothingCoverage', opt.value)}
                activeOpacity={0.7}
              >
                <View style={styles.clothingCardLeft}>
                  <Text
                    style={[
                      styles.clothingTitle,
                      isSelected && styles.clothingTitleActive
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={styles.clothingExposure}>{opt.exposure}</Text>
                  <Text style={styles.clothingHint}>{opt.hint}</Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleActive
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Sunscreen SPF 30+ Regular Use */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Routine Sunscreen Usage (SPF 30+)</Text>
          <Text style={styles.cardHint}>
            Do you routinely apply SPF 30+ sunscreen to exposed skin before heading outside?
          </Text>
        </View>

        <View style={styles.sunscreenToggleRow}>
          <TouchableOpacity
            style={[
              styles.sunscreenToggleBtn,
              !data.regularSunscreenSPF30 && styles.sunscreenToggleBtnActive
            ]}
            onPress={() => handleUpdate('regularSunscreenSPF30', false)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sunscreenToggleText,
                !data.regularSunscreenSPF30 && styles.sunscreenToggleTextActive
              ]}
            >
              No / Rarely
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sunscreenToggleBtn,
              data.regularSunscreenSPF30 && styles.sunscreenToggleBtnActiveAmber
            ]}
            onPress={() => handleUpdate('regularSunscreenSPF30', true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sunscreenToggleText,
                data.regularSunscreenSPF30 && styles.sunscreenToggleTextAmber
              ]}
            >
              Yes (Regularly)
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardNote}>
          {data.regularSunscreenSPF30
            ? 'SPF 30 reduces cutaneous pre-vitamin D synthesis by ~95-98%.'
            : 'Unfiltered exposure facilitates rapid synthesis (10-20 min safe window).'}
        </Text>
      </View>

      {/* Next Step CTA */}
      <View style={styles.footerActionContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>Continue to Dietary Habits &rarr;</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40
  },
  card: {
    backgroundColor: Colors.slate.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 18,
    marginBottom: 16
  },
  cardHeader: {
    marginBottom: 14
  },
  cardTitle: {
    color: Colors.slate.textMain,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  cardHint: {
    color: Colors.slate.textMuted,
    fontSize: 12.5,
    lineHeight: 18
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  adjustBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  adjustBtnText: {
    color: Colors.slate.textMain,
    fontSize: 14,
    fontWeight: '700'
  },
  displayBadge: {
    alignItems: 'center'
  },
  displayNumber: {
    color: Colors.primary.amber,
    fontSize: 32,
    fontWeight: '800'
  },
  displayUnit: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    fontWeight: '500'
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center'
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  presetChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: Colors.primary.amber
  },
  presetChipText: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  presetChipTextActive: {
    color: Colors.primary.amber,
    fontWeight: '700'
  },
  gridContainer: {
    gap: 10
  },
  gridCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  gridCardActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: Colors.primary.amber
  },
  gridCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  gridCardTitle: {
    color: Colors.slate.textMain,
    fontSize: 14,
    fontWeight: '700'
  },
  gridCardTitleActive: {
    color: Colors.primary.amber
  },
  miniBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(148, 163, 184, 0.1)'
  },
  miniBadgeActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)'
  },
  miniBadgeText: {
    color: Colors.slate.textMuted,
    fontSize: 11,
    fontWeight: '600'
  },
  miniBadgeTextActive: {
    color: Colors.primary.amber
  },
  gridCardHint: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    lineHeight: 16
  },
  clothingColumn: {
    gap: 10
  },
  clothingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  clothingCardActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: Colors.primary.amber
  },
  clothingCardLeft: {
    flex: 1,
    paddingRight: 10
  },
  clothingTitle: {
    color: Colors.slate.textMain,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2
  },
  clothingTitleActive: {
    color: Colors.primary.amber
  },
  clothingExposure: {
    color: Colors.clinical.teal,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2
  },
  clothingHint: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    lineHeight: 16
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.slate.cardBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioCircleActive: {
    borderColor: Colors.primary.amber
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary.amber
  },
  sunscreenToggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10
  },
  sunscreenToggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    alignItems: 'center'
  },
  sunscreenToggleBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: Colors.clinical.lowRisk
  },
  sunscreenToggleBtnActiveAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: Colors.primary.amber
  },
  sunscreenToggleText: {
    color: Colors.slate.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  sunscreenToggleTextActive: {
    color: Colors.clinical.lowRisk,
    fontWeight: '700'
  },
  sunscreenToggleTextAmber: {
    color: Colors.primary.amber,
    fontWeight: '700'
  },
  cardNote: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16
  },
  footerActionContainer: {
    marginTop: 8
  },
  continueButton: {
    backgroundColor: Colors.primary.amber,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.primary.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700'
  }
});
