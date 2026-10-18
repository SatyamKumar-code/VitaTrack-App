import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../shared/theme/colors';
import { triggerTabHaptic } from '../../../shared/utils/haptics';

const WELLNESS_TIPS = [
  {
    category: 'SOLAR SYNTHESIS',
    title: 'Midday Sunlight is Most Efficient',
    body: 'UV-B rays responsible for cutaneous Vitamin D3 synthesis peak between 11 AM and 2 PM. 15–20 minutes of mild midday sun provides more benefit than hours of low-angle morning light.',
    actionLabel: 'Read Sunlight Guide'
  },
  {
    category: 'BIO-AVAILABILITY',
    title: 'Pair with Healthy Dietary Fats',
    body: 'Vitamin D is fat-soluble. Eating foods rich in Vitamin D (like egg yolks, oily fish, or fortified plant milk) alongside healthy dietary fats boosts digestive absorption by up to 32%.',
    actionLabel: 'Explore Diet Recipes'
  },
  {
    category: 'OSTEOGENIC HEALTH',
    title: 'Protect Bone Density & Muscle Tone',
    body: 'Active Vitamin D regulates calcium and phosphorus equilibrium in the bloodstream, reinforcing bone mineral matrix and preventing recurrent muscle aches and cramps.',
    actionLabel: 'View Exercise Tips'
  },
  {
    category: 'IMMUNE RESILIENCE',
    title: 'Cellular Immune Defense',
    body: 'Vitamin D receptors are present on nearly all immune cells (T-cells, B-cells, and macrophages), supporting natural infection defense and daily vitality.',
    actionLabel: 'Learn More'
  }
];

interface DailyWellnessInsightCardProps {
  onExploreGuidance?: () => void;
}

export const DailyWellnessInsightCard: React.FC<DailyWellnessInsightCardProps> = ({
  onExploreGuidance
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const currentTip = WELLNESS_TIPS[tipIndex];

  const handleNextTip = () => {
    triggerTabHaptic();
    setTipIndex((prev) => (prev + 1) % WELLNESS_TIPS.length);
  };

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Text style={styles.sparkleIcon}>✨</Text>
          <Text style={styles.categoryBadge}>{currentTip.category}</Text>
        </View>

        <TouchableOpacity
          onPress={handleNextTip}
          style={styles.cycleButton}
          activeOpacity={0.7}
        >
          <Text style={styles.cycleButtonText}>Next Tip ↻</Text>
        </TouchableOpacity>
      </View>

      {/* Tip Content */}
      <Text style={styles.titleText}>{currentTip.title}</Text>
      <Text style={styles.bodyText}>{currentTip.body}</Text>

      {/* Footer Action */}
      <View style={styles.footerRow}>
        <Text style={styles.tipCounter}>
          Tip {tipIndex + 1} of {WELLNESS_TIPS.length}
        </Text>

        {onExploreGuidance && (
          <TouchableOpacity
            onPress={onExploreGuidance}
            style={styles.linkButton}
            activeOpacity={0.7}
          >
            <Text style={styles.linkButtonText}>{currentTip.actionLabel} &rarr;</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.70)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 18,
    marginBottom: 20
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  sparkleIcon: {
    fontSize: 14
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary.amber,
    letterSpacing: 0.8
  },
  cycleButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)'
  },
  cycleButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary.amber
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.slate.textMain,
    marginBottom: 8
  },
  bodyText: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    lineHeight: 20,
    marginBottom: 14
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.50)',
    paddingTop: 12
  },
  tipCounter: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    fontWeight: '500'
  },
  linkButton: {
    paddingVertical: 2
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.amber
  }
});
