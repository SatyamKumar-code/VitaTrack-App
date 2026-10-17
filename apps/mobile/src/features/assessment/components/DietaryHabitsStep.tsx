import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../../shared/theme/colors';
import { DietaryHabitsData } from '../types/assessment.types';

interface DietaryHabitsStepProps {
  data: DietaryHabitsData;
  onChange: (updated: DietaryHabitsData) => void;
  onNext: () => void;
}

export const DietaryHabitsStep: React.FC<DietaryHabitsStepProps> = ({
  data,
  onChange,
  onNext
}) => {
  const handleUpdate = <K extends keyof DietaryHabitsData>(key: K, val: DietaryHabitsData[K]) => {
    onChange({
      ...data,
      [key]: val
    });
  };

  const renderStepper = (
    title: string,
    foodExamples: string,
    currentValue: number,
    unit: string,
    maxVal: number,
    onAdjust: (val: number) => void
  ) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardHint}>{foodExamples}</Text>
        </View>

        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={[styles.stepperBtn, currentValue === 0 && styles.stepperBtnDisabled]}
            onPress={() => onAdjust(Math.max(0, currentValue - 1))}
            disabled={currentValue === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.stepperBtnText}>&minus;</Text>
          </TouchableOpacity>

          <View style={styles.stepperDisplay}>
            <Text style={styles.stepperNumber}>{currentValue}</Text>
            <Text style={styles.stepperUnit}>{unit}</Text>
          </View>

          <TouchableOpacity
            style={[styles.stepperBtn, currentValue >= maxVal && styles.stepperBtnDisabled]}
            onPress={() => onAdjust(Math.min(maxVal, currentValue + 1))}
            disabled={currentValue >= maxVal}
            activeOpacity={0.7}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Oily / Fatty Fish */}
      {renderStepper(
        'Fatty / Oily Fish Intake',
        'Wild salmon, mackerel, sardines, herring, trout, or canned tuna (~400–1000 IU / serving)',
        data.fattyFishServingsPerWeek,
        'Servings / Week',
        21,
        (val) => handleUpdate('fattyFishServingsPerWeek', val)
      )}

      {/* 2. Fortified Milk & Dairy / Plant Alternatives */}
      {renderStepper(
        'Fortified Milk & Dairy Products',
        'Vitamin D-fortified cow’s milk, fortified soy/oat/almond milk, fortified yogurt (~100 IU / glass)',
        data.fortifiedMilkServingsPerWeek,
        'Servings / Week',
        28,
        (val) => handleUpdate('fortifiedMilkServingsPerWeek', val)
      )}

      {/* 3. Egg Yolks */}
      {renderStepper(
        'Whole Eggs / Egg Yolks',
        'Pastured or standard whole eggs (~40 IU per yolk)',
        data.eggYolksPerWeek,
        'Eggs / Week',
        35,
        (val) => handleUpdate('eggYolksPerWeek', val)
      )}

      {/* 4. UV-Exposed Mushrooms */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>UV-Treated Mushrooms (Vitamin D2)</Text>
          <Text style={styles.cardHint}>
            Do you consume mushrooms exposed to sunlight or UV light at least once a week?
          </Text>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              !data.mushroomsWeekly && styles.toggleBtnActive
            ]}
            onPress={() => handleUpdate('mushroomsWeekly', false)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleBtnText,
                !data.mushroomsWeekly && styles.toggleBtnTextActive
              ]}
            >
              No / Rarely
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              data.mushroomsWeekly && styles.toggleBtnActiveTeal
            ]}
            onPress={() => handleUpdate('mushroomsWeekly', true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleBtnText,
                data.mushroomsWeekly && styles.toggleBtnTextTeal
              ]}
            >
              Yes (Weekly)
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.infoNote}>
          {data.mushroomsWeekly
            ? 'Mushrooms synthesize ergocalciferol (Vitamin D2) when irradiated with UV rays.'
            : 'Unexposed grocery mushrooms produce negligible vitamin D2.'}
        </Text>
      </View>

      {/* 5. Vitamin D Supplements */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Vitamin D Oral Supplementation</Text>
          <Text style={styles.cardHint}>
            Are you currently taking any Vitamin D3/D2 oral tablets, capsules, or liquid drops?
          </Text>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              !data.takesVitaminDSupplement && styles.toggleBtnActive
            ]}
            onPress={() => handleUpdate('takesVitaminDSupplement', false)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleBtnText,
                !data.takesVitaminDSupplement && styles.toggleBtnTextActive
              ]}
            >
              No Supplement
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              data.takesVitaminDSupplement && styles.toggleBtnActiveTeal
            ]}
            onPress={() => handleUpdate('takesVitaminDSupplement', true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleBtnText,
                data.takesVitaminDSupplement && styles.toggleBtnTextTeal
              ]}
            >
              Yes (Taking Daily/Weekly)
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.infoNote}>
          {data.takesVitaminDSupplement
            ? 'Active supplementation mitigates dietary deficits in clinical scoring.'
            : 'Relying exclusively on food & sunlight synthesis.'}
        </Text>
      </View>

      {/* Continue Action */}
      <View style={styles.footerActionContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>Review Assessment Summary &rarr;</Text>
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
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    padding: 8
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperBtnDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderColor: Colors.slate.cardBorder,
    opacity: 0.5
  },
  stepperBtnText: {
    color: Colors.primary.amber,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28
  },
  stepperDisplay: {
    alignItems: 'center'
  },
  stepperNumber: {
    color: Colors.slate.textMain,
    fontSize: 26,
    fontWeight: '800'
  },
  stepperUnit: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    fontWeight: '500'
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    alignItems: 'center'
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: Colors.slate.cardBorder
  },
  toggleBtnActiveTeal: {
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    borderColor: Colors.clinical.teal
  },
  toggleBtnText: {
    color: Colors.slate.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  toggleBtnTextActive: {
    color: Colors.slate.textMain,
    fontWeight: '700'
  },
  toggleBtnTextTeal: {
    color: Colors.clinical.teal,
    fontWeight: '700'
  },
  infoNote: {
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
