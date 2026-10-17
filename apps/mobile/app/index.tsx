import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/features/auth/context/AuthContext';
import { Colors } from '../src/shared/theme/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Solar Icon / Brand Emblem */}
        <View style={styles.emblemContainer}>
          <View style={styles.emblemRing}>
            <Text style={styles.emblemText}>☀️</Text>
          </View>
        </View>

        {/* Title & Tagline */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>VitaTrack</Text>
          <Text style={styles.brandTagline}>Vitamin D Self-Assessment & Solar Wellness</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Phase 4 Risk Scoring &amp; AI Explainer Operational</Text>
          </View>
        </View>

        {/* Auth CTA Section */}
        <View style={styles.authCtaContainer}>
          {isAuthenticated && user ? (
            <View style={styles.authenticatedCard}>
              <Text style={styles.authenticatedGreeting}>
                Welcome back, {user.fullName}!
              </Text>
              <Text style={styles.authenticatedSubtext}>
                Logged in as {user.email} &bull; Skin {user.skinType.toUpperCase()} &bull;{' '}
                {user.dietaryPreference}
              </Text>

              {/* Phase 3 & 4 Primary CTAs */}
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => router.push('/assessment')}
              >
                <Text style={styles.primaryActionButtonText}>
                  Start Clinical Self-Assessment &rarr;
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.outlineActionButton, { marginTop: 10, width: '100%' }]}
                onPress={() => router.push('/results')}
              >
                <Text style={styles.outlineActionButtonText}>
                  📊 View Latest Clinical Risk Results &rarr;
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.guidanceActionButton, { marginTop: 10, width: '100%' }]}
                onPress={() => router.push('/guidance')}
              >
                <Text style={styles.guidanceActionButtonText}>
                  🥗 Personalized Guidance Hub (Diet, Sun, Exercise) &rarr;
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.profileButton, { marginTop: 10 }]}
                onPress={() => router.push('/profile')}
              >
                <Text style={styles.profileButtonText}>Manage Health Baseline & Profile &rarr;</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionButtonGroup}>
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => router.push('/(auth)/onboarding')}
              >
                <Text style={styles.primaryActionButtonText}>Explore Onboarding Tour</Text>
              </TouchableOpacity>

              <View style={styles.dualButtonRow}>
                <TouchableOpacity
                  style={styles.outlineActionButton}
                  onPress={() => router.push('/(auth)/login')}
                >
                  <Text style={styles.outlineActionButtonText}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionButton}
                  onPress={() => router.push('/(auth)/register')}
                >
                  <Text style={styles.secondaryActionButtonText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* System Architecture Status Cards */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Phase 5 Personalized Guidance Hub Active</Text>
            <Text style={styles.cardBody}>
              Omnivore/vegetarian/vegan bioavailable nutrition engine, phototype-calibrated solar countdown timer, and osteogenic exercise guide module fully active.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Phase 4 Deterministic Risk &amp; AI Explainer</Text>
            <Text style={styles.cardBody}>
              Two-tier risk calculation engine with animated circular SVG gauge, clinical consultation alert rules, and zero-PHI AI diagnostic synthesis.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Phase 3 Clinical Questionnaire Active</Text>
            <Text style={styles.cardBody}>
              Interactive 4-step clinical wizard covering symptom inventory, solar irradiance habits, dietary bio-availability, and offline auto-save persistence.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Phase 2 Security & Vault Status</Text>
            <Text style={styles.cardBody}>
              Hardware Keystore token rotation (15m JWT / 7d refresh) &amp; Zero-PHI cryptographic profile management fully implemented and active.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Academic Research Origin</Text>
            <Text style={styles.cardBody}>
              Designed by Satyam Kumar &amp; Shilpi Shikha (Supervised by Dr. Hoshiyar Singh, VGU Jaipur).
            </Text>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>Medical & Safety Disclaimer</Text>
            <Text style={styles.disclaimerBody}>
              VitaTrack is an informational self-assessment screening and lifestyle guidance aid. It does not provide medical diagnoses or replace laboratory blood serum testing.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          VitaTrack Mobile Client &bull; Phase 5 Completed &amp; Verified
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emblemContainer: {
    marginTop: 20,
    marginBottom: 16
  },
  emblemRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.glow,
    borderWidth: 2,
    borderColor: Colors.primary.amber,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emblemText: {
    fontSize: 38
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.slate.textMain,
    letterSpacing: 0.5
  },
  brandTagline: {
    fontSize: 14,
    color: Colors.slate.textMuted,
    marginTop: 4,
    textAlign: 'center'
  },
  badge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.amber
  },
  authCtaContainer: {
    width: '100%',
    marginBottom: 24
  },
  actionButtonGroup: {
    gap: 12
  },
  primaryActionButton: {
    backgroundColor: Colors.primary.amber,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  primaryActionButtonText: {
    color: '#0B0F19',
    fontSize: 15,
    fontWeight: '700'
  },
  dualButtonRow: {
    flexDirection: 'row',
    gap: 10
  },
  outlineActionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  outlineActionButtonText: {
    color: Colors.slate.textMain,
    fontSize: 14,
    fontWeight: '600'
  },
  secondaryActionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  secondaryActionButtonText: {
    color: Colors.primary.amber,
    fontSize: 14,
    fontWeight: '600'
  },
  authenticatedCard: {
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.35)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center'
  },
  authenticatedGreeting: {
    color: Colors.slate.textMain,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  authenticatedSubtext: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center'
  },
  guidanceActionButton: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#14B8A6'
  },
  guidanceActionButtonText: {
    color: '#F0FDFA',
    fontSize: 13,
    fontWeight: '700'
  },
  profileButton: {
    backgroundColor: Colors.clinical.teal,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  cardContainer: {
    width: '100%',
    gap: 14,
    marginBottom: 24
  },
  card: {
    backgroundColor: Colors.slate.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.amber,
    marginBottom: 6
  },
  cardBody: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 17
  },
  disclaimerCard: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)'
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.clinical.teal,
    marginBottom: 4
  },
  disclaimerBody: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    lineHeight: 16
  },
  footerText: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    textAlign: 'center'
  }
});
