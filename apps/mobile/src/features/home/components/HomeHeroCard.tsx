import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../shared/theme/colors';
import { SolarVitalityRing } from './SolarVitalityRing';
import { triggerTabHaptic } from '../../../shared/utils/haptics';

interface HomeHeroCardProps {
  userName?: string | null;
  isAuthenticated: boolean;
  skinType?: string;
  dietaryPreference?: string;
}

export const HomeHeroCard: React.FC<HomeHeroCardProps> = ({
  userName,
  isAuthenticated,
  skinType = 'type_3',
  dietaryPreference = 'Balanced'
}) => {
  const router = useRouter();

  const handleStartAssessment = () => {
    triggerTabHaptic();
    router.push('/assessment');
  };

  const getGreeting = () => {
    if (isAuthenticated && userName) {
      const firstName = userName.split(' ')[0];
      return `Welcome, ${firstName}!`;
    }
    return 'Good morning!';
  };

  const getSkinName = (st: string) => {
    const map: Record<string, string> = {
      type_1: 'Sensitive Skin',
      type_2: 'Dry Skin',
      type_3: 'Normal Skin',
      type_4: 'Combination Skin',
      type_5: 'Oily Skin',
      type_6: 'Oily Skin'
    };
    return map[st] || 'Normal Skin';
  };

  const getSubtitle = () => {
    if (isAuthenticated && userName) {
      return `${userName} • ${getSkinName(skinType)} • Daily Goal: 20 min Sun`;
    }
    return 'Track your solar vitality and daily wellness';
  };

  return (
    <View style={styles.card}>
      {/* Top Header Badge & Greeting */}
      <View style={styles.headerRow}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>{getGreeting()}</Text>
          <Text style={styles.greetingSubtitle}>{getSubtitle()}</Text>
        </View>
        <View style={styles.uvBadge}>
          <Text style={styles.uvDot}>●</Text>
          <Text style={styles.uvText}>UV 4.8 Moderate</Text>
        </View>
      </View>

      {/* Center Vitality Gauge & Key Metrics */}
      <View style={styles.bodyRow}>
        <SolarVitalityRing
          percentage={75}
          size={114}
          strokeWidth={10}
          minutesToday={15}
          targetMinutes={20}
        />

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>PEAK SYNTHESIS WINDOW</Text>
            <Text style={styles.metricValue}>11:00 AM – 1:30 PM</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>RECOMMENDED EXPOSURE</Text>
            <Text style={styles.metricValue}>20 mins outdoor light</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>DERMAL SENSITIVITY</Text>
            <Text style={styles.metricValue}>Low Risk (SPF 15 recommended)</Text>
          </View>
        </View>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handleStartAssessment}
        activeOpacity={0.8}
        testID="home-start-assessment"
      >
        <View style={styles.ctaButtonInner}>
          <Text style={styles.ctaButtonText}>Start Assessment</Text>
          <Text style={styles.ctaButtonArrow}>&rarr;</Text>
        </View>
        <Text style={styles.ctaSubtext}>3-Minute Health Checkup (Quick &amp; Confidential)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.28)',
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.primary.amber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18
  },
  greetingContainer: {
    flex: 1,
    paddingRight: 10
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.slate.textMain,
    letterSpacing: -0.3
  },
  greetingSubtitle: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    marginTop: 4,
    fontWeight: '500'
  },
  uvBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.40)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5
  },
  uvDot: {
    color: Colors.primary.amber,
    fontSize: 10
  },
  uvText: {
    color: Colors.primary.amber,
    fontSize: 11,
    fontWeight: '700'
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16
  },
  metricsContainer: {
    flex: 1,
    gap: 10
  },
  metricItem: {
    backgroundColor: 'rgba(30, 41, 59, 0.60)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.50)'
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.slate.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate.textMain
  },
  ctaButton: {
    backgroundColor: Colors.primary.amber,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: Colors.primary.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  ctaButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B0F19'
  },
  ctaButtonArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B0F19'
  },
  ctaSubtext: {
    fontSize: 11,
    color: 'rgba(11, 15, 25, 0.75)',
    fontWeight: '600',
    marginTop: 2
  }
});
