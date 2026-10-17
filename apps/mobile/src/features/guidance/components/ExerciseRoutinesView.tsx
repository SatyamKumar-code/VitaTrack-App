import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../../shared/theme/colors';
import { ExerciseGuidance, ExerciseRoutineItem } from '../types/guidance.types';

interface ExerciseRoutinesViewProps {
  exercise: ExerciseGuidance;
}

export const ExerciseRoutinesView: React.FC<ExerciseRoutinesViewProps> = ({
  exercise
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    exercise.suggestions[0]?.id || null
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Header & Focus */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Musculoskeletal &amp; Bone Health</Text>
        <Text style={styles.sectionSubtitle}>
          Weight-bearing routines designed to stimulate bone mineral density (BMD):
        </Text>
      </View>

      {/* Focus Pill Banner */}
      <View style={styles.focusBanner}>
        <Text style={styles.focusLabel}>Clinical Objective</Text>
        <Text style={styles.focusValue}>{exercise.focus}</Text>
      </View>

      {/* Tailored Note */}
      <View style={styles.tailoredBox}>
        <Text style={styles.tailoredIcon}>🎯</Text>
        <Text style={styles.tailoredText}>{exercise.tailoredNote}</Text>
      </View>

      {/* Exercise Routines List */}
      <View style={styles.routinesList}>
        <Text style={styles.routinesTitle}>Prescribed Activity Routines</Text>

        {exercise.suggestions.map((item: ExerciseRoutineItem) => {
          const isExpanded = expandedId === item.id;
          return (
            <View key={item.id} style={styles.routineCard}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.headerLeft}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.categoryBadge}>{item.category}</Text>
                    {item.outdoorSynergy && (
                      <Text style={styles.synergyBadge}>☀️ Sun Synergy</Text>
                    )}
                    <Text style={styles.diffBadge}>{item.difficulty}</Text>
                  </View>
                  <Text style={styles.routineName}>{item.name}</Text>
                  <Text style={styles.metaText}>
                    ⏱ {item.durationMinutes} min &bull; 📅 {item.frequency}
                  </Text>
                </View>
                <Text style={styles.expandChevron}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Bone Impact Mechanism */}
              <View style={styles.impactBox}>
                <Text style={styles.impactLabel}>Osteogenic Bone Impact:</Text>
                <Text style={styles.impactText}>{item.boneImpact}</Text>
              </View>

              {/* Step-by-Step Instructions (Expandable) */}
              {isExpanded && (
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionHeader}>Step-by-Step Instructions:</Text>
                  {item.instructions.map((step, idx) => (
                    <View key={idx} style={styles.stepRow}>
                      <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Safety Precautions */}
      <View style={styles.safetyCard}>
        <Text style={styles.safetyTitle}>🛡️ Musculoskeletal Safety Notice</Text>
        <Text style={styles.safetyBody}>{exercise.safetyPrecautions}</Text>
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
  focusBanner: {
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.clinical.teal
  },
  focusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.clinical.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  focusValue: {
    fontSize: 13,
    color: Colors.slate.textMain,
    fontWeight: '600',
    marginTop: 2
  },
  tailoredBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    gap: 10
  },
  tailoredIcon: {
    fontSize: 20
  },
  tailoredText: {
    flex: 1,
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 18
  },
  routinesList: {
    gap: 12
  },
  routinesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  routineCard: {
    backgroundColor: Colors.slate.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  headerLeft: {
    flex: 1,
    marginRight: 10
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase'
  },
  synergyBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  diffBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.slate.textMuted,
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'capitalize'
  },
  routineName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  metaText: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    marginTop: 4
  },
  expandChevron: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    paddingTop: 4
  },
  impactBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10
  },
  impactLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.clinical.teal,
    textTransform: 'uppercase'
  },
  impactText: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 16,
    marginTop: 2
  },
  instructionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.slate.cardBorder,
    gap: 8
  },
  instructionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate.textMain,
    marginBottom: 2
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary.amber
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: Colors.slate.textMain,
    lineHeight: 18
  },
  safetyCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.amber
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary.amber,
    marginBottom: 4
  },
  safetyBody: {
    fontSize: 12,
    color: '#FEF3C7',
    lineHeight: 17
  }
});
