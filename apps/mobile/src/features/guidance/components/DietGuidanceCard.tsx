import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../../shared/theme/colors';
import {
  NutritionGuidance,
  DietaryPreference
} from '../types/guidance.types';

interface DietGuidanceCardProps {
  nutrition: NutritionGuidance;
  selectedDiet: DietaryPreference;
  onDietChange: (diet: DietaryPreference) => void;
}

export const DietGuidanceCard: React.FC<DietGuidanceCardProps> = ({
  nutrition,
  selectedDiet,
  onDietChange
}) => {
  const DIET_OPTIONS: { key: DietaryPreference; label: string; icon: string }[] = [
    { key: 'omnivore', label: 'Omnivore', icon: '🐟' },
    { key: 'vegetarian', label: 'Vegetarian', icon: '🥛' },
    { key: 'vegan', label: 'Vegan', icon: '🌱' }
  ];

  return (
    <View style={styles.container}>
      {/* Diet Switcher Pills */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Dietary Profile & Bioavailability</Text>
        <Text style={styles.sectionSubtitle}>
          Select your eating pattern to personalize Vitamin D food sources:
        </Text>
      </View>

      <View style={styles.pillsRow}>
        {DIET_OPTIONS.map((option) => {
          const isSelected = selectedDiet === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.pill, isSelected && styles.pillActive]}
              onPress={() => onDietChange(option.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.pillIcon}>{option.icon}</Text>
              <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Target Daily IU Banner */}
      <View style={styles.targetBanner}>
        <View style={styles.targetIconBox}>
          <Text style={styles.targetIcon}>🎯</Text>
        </View>
        <View style={styles.targetContent}>
          <Text style={styles.targetLabel}>Target Daily Intake</Text>
          <Text style={styles.targetValue}>{nutrition.targetDailyIU}</Text>
        </View>
      </View>

      {/* Priority Vitamin D Rich Foods */}
      <View style={styles.foodsSection}>
        <Text style={styles.foodsTitle}>
          High-Bioavailability Foods ({selectedDiet.toUpperCase()})
        </Text>

        {nutrition.priorityFoods.map((food, idx) => (
          <View key={idx} style={styles.foodCard}>
            <View style={styles.foodHeader}>
              <View style={styles.foodNameContainer}>
                <Text style={styles.foodCategoryBadge}>{food.category}</Text>
                <Text style={styles.foodName}>{food.name}</Text>
                {food.servingSize && (
                  <Text style={styles.foodServing}>Serving: {food.servingSize}</Text>
                )}
              </View>
              <View style={styles.iuBadge}>
                <Text style={styles.iuText}>{food.vitaminDContent}</Text>
              </View>
            </View>
            <Text style={styles.foodBioNote}>{food.bioavailabilityNote}</Text>
          </View>
        ))}
      </View>

      {/* Co-Factors Synergy Card */}
      <View style={styles.cardBox}>
        <Text style={styles.cardBoxTitle}>Essential Co-Factors (The Bone Axis)</Text>
        <Text style={styles.cardBoxDesc}>
          Vitamin D requires specific trace minerals and vitamins to synthesize enzymes and prevent soft-tissue calcification:
        </Text>
        {nutrition.coFactors.map((cf, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>&bull;</Text>
            <Text style={styles.bulletText}>{cf}</Text>
          </View>
        ))}
      </View>

      {/* Fat-Soluble Absorption Tips */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Absorption Optimization</Text>
        <Text style={styles.tipBody}>{nutrition.absorptionTips}</Text>
      </View>

      {/* Supplement Advisory */}
      <View style={styles.supplementCard}>
        <View style={styles.supplementHeader}>
          <Text style={styles.supplementIcon}>💊</Text>
          <Text style={styles.supplementTitle}>Supplementation Advisory</Text>
        </View>
        <Text style={styles.supplementReason}>
          {nutrition.supplementGuidance.reason}
        </Text>
        <View style={styles.cautionBox}>
          <Text style={styles.cautionText}>
            &#9888; {nutrition.supplementGuidance.caution}
          </Text>
        </View>
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
  pillsRow: {
    flexDirection: 'row',
    gap: 8
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    gap: 6
  },
  pillActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: Colors.primary.amber
  },
  pillIcon: {
    fontSize: 16
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.textMuted
  },
  pillTextActive: {
    color: Colors.primary.amber,
    fontWeight: '700'
  },
  targetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.amber
  },
  targetIconBox: {
    marginRight: 12
  },
  targetIcon: {
    fontSize: 24
  },
  targetContent: {
    flex: 1
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.amber,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  targetValue: {
    fontSize: 13,
    color: Colors.slate.textMain,
    fontWeight: '600',
    marginTop: 2
  },
  foodsSection: {
    gap: 10
  },
  foodsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  foodCard: {
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  foodNameContainer: {
    flex: 1,
    marginRight: 10
  },
  foodCategoryBadge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.clinical.teal,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  foodName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  foodServing: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    marginTop: 2
  },
  iuBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  iuText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.amber
  },
  foodBioNote: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 17
  },
  cardBox: {
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  cardBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate.textMain,
    marginBottom: 4
  },
  cardBoxDesc: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    marginBottom: 10,
    lineHeight: 16
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  bulletDot: {
    fontSize: 14,
    color: Colors.primary.amber,
    marginRight: 8,
    lineHeight: 18
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: Colors.slate.textMain,
    lineHeight: 18
  },
  tipCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
    marginBottom: 4
  },
  tipBody: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 17
  },
  supplementCard: {
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  supplementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  supplementIcon: {
    fontSize: 18
  },
  supplementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  supplementReason: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 17,
    marginBottom: 8
  },
  cautionBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.clinical.highRisk
  },
  cautionText: {
    fontSize: 11,
    color: '#FCA5A5',
    lineHeight: 16
  }
});
