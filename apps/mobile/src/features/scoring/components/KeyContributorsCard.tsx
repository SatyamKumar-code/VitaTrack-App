import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AssessmentAiExplanation } from '../types/scoring.types';
import { Colors } from '../../../shared/theme/colors';

interface KeyContributorsCardProps {
  explanation: AssessmentAiExplanation;
}

export const KeyContributorsCard: React.FC<KeyContributorsCardProps> = ({ explanation }) => {
  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI SYNTHESIS</Text>
        </View>
        <Text style={styles.headerTitle}>Personalized Clinical Insights</Text>
      </View>

      {/* Summary Narrative */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{explanation.summary}</Text>
      </View>

      {/* Primary Contributing Factors List */}
      <View style={styles.contributorsSection}>
        <Text style={styles.contributorsSectionTitle}>Primary Risk Drivers &amp; Observations</Text>
        <View style={styles.contributorsList}>
          {explanation.keyContributors.map((item, index) => (
            <View key={index} style={styles.contributorItem}>
              <View style={styles.bulletRing}>
                <Text style={styles.bulletNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.contributorText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: Colors.slate.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 16,
    marginVertical: 10
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  aiBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: Colors.primary.amber,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6
  },
  aiBadgeText: {
    color: Colors.primary.amber,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1
  },
  headerTitle: {
    color: Colors.slate.textMain,
    fontSize: 15,
    fontWeight: '800'
  },
  summaryBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    marginBottom: 14
  },
  summaryText: {
    color: Colors.slate.textMain,
    fontSize: 13,
    lineHeight: 19
  },
  contributorsSection: {
    marginTop: 4
  },
  contributorsSectionTitle: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  contributorsList: {
    gap: 8
  },
  contributorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    gap: 10
  },
  bulletRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primary.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1
  },
  bulletNumber: {
    color: Colors.primary.amber,
    fontSize: 11,
    fontWeight: '800'
  },
  contributorText: {
    color: Colors.slate.textMain,
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1
  }
});
