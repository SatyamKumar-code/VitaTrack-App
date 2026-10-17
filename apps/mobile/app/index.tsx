import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/shared/theme/colors';

export default function WelcomeScreen() {
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
          <Text style={styles.brandTitle}>VitaSun</Text>
          <Text style={styles.brandTagline}>Vitamin D Self-Assessment & Solar Wellness</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Phase 1 Foundation Operational</Text>
          </View>
        </View>

        {/* System Architecture Status Cards */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mobile Architecture</Text>
            <Text style={styles.cardBody}>
              React Native + Expo SDK 52 + Expo Router configured with a strict Feature-Based directory structure.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Academic Research Origin</Text>
            <Text style={styles.cardBody}>
              Designed by Satyam Kumar & Shilpi Shikha (Supervised by Dr. Hoshiyar Singh, VGU Jaipur).
            </Text>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>Medical & Safety Disclaimer</Text>
            <Text style={styles.disclaimerBody}>
              VitaSun is an informational self-assessment screening and lifestyle guidance aid. It does not provide medical diagnoses or replace laboratory blood serum testing.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          VitaSun Mobile Client &bull; Ready for Phase 2 Authorization
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
    marginTop: 40,
    marginBottom: 20
  },
  emblemRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary.glow,
    borderWidth: 2,
    borderColor: Colors.primary.amber,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emblemText: {
    fontSize: 42
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
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
    marginTop: 12,
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
  cardContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32
  },
  card: {
    backgroundColor: Colors.slate.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary.amber,
    marginBottom: 6
  },
  cardBody: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    lineHeight: 18
  },
  disclaimerCard: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)'
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.clinical.teal,
    marginBottom: 4
  },
  disclaimerBody: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 17
  },
  footerText: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    textAlign: 'center'
  }
});
