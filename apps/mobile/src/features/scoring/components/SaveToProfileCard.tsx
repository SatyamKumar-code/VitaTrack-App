import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../shared/theme/colors';
import { triggerTabHaptic } from '../../../shared/utils/haptics';

interface SaveToProfileCardProps {
  onDismiss?: () => void;
}

export const SaveToProfileCard: React.FC<SaveToProfileCardProps> = ({ onDismiss }) => {
  const router = useRouter();

  const handleRegister = () => {
    triggerTabHaptic();
    router.push('/(auth)/register');
  };

  const handleLogin = () => {
    triggerTabHaptic();
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.card}>
      {/* Header Tag */}
      <View style={styles.tagRow}>
        <View style={styles.shieldBadge}>
          <Text style={styles.shieldIcon}>🔒</Text>
          <Text style={styles.shieldText}>Ephemeral Guest Mode</Text>
        </View>
        <Text style={styles.zeroDbText}>Zero Cloud Storage</Text>
      </View>

      {/* Title & Explainer */}
      <Text style={styles.cardTitle}>Save Your Evaluation &amp; Track Trends</Text>
      <Text style={styles.cardBody}>
        Your risk evaluation is currently held only in temporary device memory. Create a free account or sign in to save your score, track historical trajectories over time, and export official Clinician PDF summaries.
      </Text>

      {/* Dual CTA Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Create Free Account &rarr;</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.40)',
    padding: 18,
    marginVertical: 14,
    shadowColor: Colors.primary.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  shieldIcon: {
    fontSize: 12
  },
  shieldText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary.amber
  },
  zeroDbText: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    fontWeight: '500'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate.textMain,
    marginBottom: 6,
    letterSpacing: -0.2
  },
  cardBody: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 18,
    marginBottom: 14
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10
  },
  primaryButton: {
    flex: 2,
    backgroundColor: Colors.primary.amber,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center'
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0F19'
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.80)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center'
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate.textMain
  }
});
