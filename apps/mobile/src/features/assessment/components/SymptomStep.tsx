import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../../shared/theme/colors';
import { SymptomsData, SymptomSeverity } from '../types/assessment.types';

interface SymptomStepProps {
  data: SymptomsData;
  onChange: (updated: SymptomsData) => void;
  onNext: () => void;
}

interface SeverityOption {
  value: SymptomSeverity;
  label: string;
  description: string;
}

const SEVERITY_OPTIONS: SeverityOption[] = [
  { value: 'none', label: 'None', description: 'No noticeable discomfort' },
  { value: 'mild', label: 'Mild', description: 'Occasional, does not disrupt routine' },
  { value: 'moderate', label: 'Moderate', description: 'Regular discomfort, noticeable fatigue/ache' },
  { value: 'severe', label: 'Severe', description: 'Debilitating, impacts daily activities' }
];

export const SymptomStep: React.FC<SymptomStepProps> = ({ data, onChange, onNext }) => {
  const handleUpdate = <K extends keyof SymptomsData>(key: K, val: SymptomsData[K]) => {
    onChange({
      ...data,
      [key]: val
    });
  };

  const renderSeveritySelector = (
    title: string,
    clinicalHint: string,
    currentValue: SymptomSeverity,
    onSelect: (val: SymptomSeverity) => void
  ) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardHint}>{clinicalHint}</Text>
        </View>

        <View style={styles.optionsRow}>
          {SEVERITY_OPTIONS.map((opt) => {
            const isSelected = currentValue === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonActive,
                  isSelected && opt.value === 'severe' && styles.optionButtonSevere
                ]}
                onPress={() => onSelect(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelActive,
                    isSelected && opt.value === 'severe' && styles.optionLabelSevere
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.selectedDescription}>
          {SEVERITY_OPTIONS.find((o) => o.value === currentValue)?.description}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Fatigue Severity */}
      {renderSeveritySelector(
        'Chronic Fatigue & Low Energy',
        'Persistent tiredness that doesn’t resolve with adequate sleep',
        data.fatigueLevel,
        (val) => handleUpdate('fatigueLevel', val)
      )}

      {/* 2. Bone & Joint Pain */}
      {renderSeveritySelector(
        'Bone & Low Back Ache',
        'Deep aching pain in the lower back, ribs, or legs (osteomalacia marker)',
        data.bonePainLevel,
        (val) => handleUpdate('bonePainLevel', val)
      )}

      {/* 3. Muscle Weakness */}
      {renderSeveritySelector(
        'Muscle Weakness & Cramping',
        'Difficulty climbing stairs, getting up from chairs, or muscle twitches',
        data.muscleWeaknessLevel,
        (val) => handleUpdate('muscleWeaknessLevel', val)
      )}

      {/* 4. Mood & Depressive Symptoms */}
      {renderSeveritySelector(
        'Mood Changes / Low Mood',
        'Seasonal blues, irritability, or low motivation often tied to low sunlight',
        data.moodChanges,
        (val) => handleUpdate('moodChanges', val)
      )}

      {/* 5. Frequent Infections Toggle Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Frequent Respiratory Infections</Text>
          <Text style={styles.cardHint}>
            Have you caught 3+ colds, respiratory infections, or flu in the past 6 months?
          </Text>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !data.frequentInfections && styles.toggleButtonActive
            ]}
            onPress={() => handleUpdate('frequentInfections', false)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleButtonText,
                !data.frequentInfections && styles.toggleButtonTextActive
              ]}
            >
              No / Rare
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              data.frequentInfections && styles.toggleButtonActiveAlert
            ]}
            onPress={() => handleUpdate('frequentInfections', true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleButtonText,
                data.frequentInfections && styles.toggleButtonTextAlert
              ]}
            >
              Yes (Frequent)
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.selectedDescription}>
          {data.frequentInfections
            ? 'Frequent respiratory bouts strongly link to low Vitamin D immune defense.'
            : 'Normal immune frequency reported.'}
        </Text>
      </View>

      {/* Continue Action */}
      <View style={styles.footerActionContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>Continue to Solar Exposure &rarr;</Text>
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
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: Colors.primary.amber
  },
  optionButtonSevere: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: Colors.clinical.highRisk
  },
  optionLabel: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  optionLabelActive: {
    color: Colors.primary.amber,
    fontWeight: '700'
  },
  optionLabelSevere: {
    color: Colors.clinical.highRisk,
    fontWeight: '700'
  },
  selectedDescription: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    alignItems: 'center'
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: Colors.clinical.lowRisk
  },
  toggleButtonActiveAlert: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: Colors.primary.amber
  },
  toggleButtonText: {
    color: Colors.slate.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  toggleButtonTextActive: {
    color: Colors.clinical.lowRisk,
    fontWeight: '700'
  },
  toggleButtonTextAlert: {
    color: Colors.primary.amber,
    fontWeight: '700'
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
