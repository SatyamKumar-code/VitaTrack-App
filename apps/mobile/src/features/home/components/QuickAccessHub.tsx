import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../shared/theme/colors';
import { triggerTabHaptic } from '../../../shared/utils/haptics';

export const QuickAccessHub: React.FC = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    triggerTabHaptic();
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Explore Health Services</Text>

      {/* Grid of 4 Quick Access Cards */}
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigateTo('/assessment')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Text style={styles.icon}>📝</Text>
          </View>
          <Text style={styles.cardTitle}>Self-Assessment</Text>
          <Text style={styles.cardSub}>Evaluate symptoms, solar exposure &amp; diet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigateTo('/guidance')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(13, 148, 136, 0.15)' }]}>
            <Text style={styles.icon}>🥗</Text>
          </View>
          <Text style={styles.cardTitle}>Personalized Guidance</Text>
          <Text style={styles.cardSub}>Bio-available diet &amp; sun exposure timer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigateTo('/history')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Text style={styles.icon}>📈</Text>
          </View>
          <Text style={styles.cardTitle}>History &amp; Reports</Text>
          <Text style={styles.cardSub}>Longitudinal trends &amp; exportable PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigateTo('/reminders')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(234, 88, 12, 0.15)' }]}>
            <Text style={styles.icon}>🔔</Text>
          </View>
          <Text style={styles.cardTitle}>Smart Reminders</Text>
          <Text style={styles.cardSub}>Peak UV-B windows &amp; supplement alerts</Text>
        </TouchableOpacity>
      </View>

      {/* Reassuring Clinical & Research Footer */}
      <View style={styles.disclaimerCard}>
        <View style={styles.disclaimerHeader}>
          <Text style={styles.disclaimerShield}>🛡️</Text>
          <Text style={styles.disclaimerTitle}>Medical &amp; Safety Advisory</Text>
        </View>
        <Text style={styles.disclaimerText}>
          VitaTrack is an informational wellness screening aid and lifestyle guide. It does not replace clinical laboratory blood serum testing or professional medical diagnosis.
        </Text>
        <Text style={styles.attributionText}>
          Designed by Satyam Kumar &amp; Shilpi Shikha &bull; Supervised by Dr. Hoshiyar Singh (VGU Jaipur)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate.textMain,
    marginBottom: 14,
    letterSpacing: -0.2
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  card: {
    width: '48%',
    backgroundColor: 'rgba(30, 41, 59, 0.55)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 14
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  icon: {
    fontSize: 18
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate.textMain,
    marginBottom: 4
  },
  cardSub: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    lineHeight: 15
  },
  disclaimerCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.60)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.50)',
    padding: 16
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  disclaimerShield: {
    fontSize: 14
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    lineHeight: 16,
    marginBottom: 8
  },
  attributionText: {
    fontSize: 10,
    color: 'rgba(148, 163, 184, 0.70)',
    fontStyle: 'italic'
  }
});
