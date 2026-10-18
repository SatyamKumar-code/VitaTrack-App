import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../shared/theme/colors';

const VENDOR_GUIDES = [
  {
    id: 'samsung',
    name: 'Samsung Galaxy Watch',
    badge: 'Tier 1 Optimal',
    models: 'Watch 4, 5, 6, 7 & Ultra',
    instructions: [
      'Open the Samsung Health application on your phone.',
      'Tap Settings (gear icon) -> Connected services -> Health Connect.',
      'Toggle ON all permissions (Steps, Heart Rate, SpO2, Sleep).'
    ]
  },
  {
    id: 'pixel',
    name: 'Google Pixel Watch / Fitbit',
    badge: 'Tier 1 Optimal',
    models: 'Pixel Watch 1/2/3, Sense 2, Versa 4, Charge 6',
    instructions: [
      'Open the Fitbit or Google Pixel Watch app.',
      'Navigate to Profile settings -> Health Connect integration.',
      'Tap Sync with Health Connect and grant read/write access.'
    ]
  },
  {
    id: 'noise',
    name: 'Noise Smartwatches',
    badge: 'Tier 2 Supported',
    models: 'ColorFit Pro 4/5, Pulse 2/3, Icon, Halo, Caliber',
    instructions: [
      'Open the official NoiseFit companion app on your phone.',
      'Go to Profile -> Settings -> Third-Party Data Sync.',
      'Select Google Fit / Health Connect and turn the sync switch ON.'
    ]
  },
  {
    id: 'fireboltt',
    name: 'Fire-Boltt Smartwatches',
    badge: 'Tier 2 Supported',
    models: 'Invincible Plus, Ninja, Ring, Phoenix, Gladiator',
    instructions: [
      'Open Fire-Boltt Health Hub or Da Fit application.',
      'Go to "Me" / Account -> Linked Services.',
      'Enable Health Connect / Google Fit export sync.'
    ]
  },
  {
    id: 'garmin',
    name: 'Garmin Smartwatches',
    badge: 'Tier 2 High',
    models: 'Forerunner, Venu, Fenix, Vivoactive',
    instructions: [
      'Open Garmin Connect on your mobile device.',
      'Tap Settings -> Connected Apps -> Health Connect.',
      'Ensure daily steps, resting heart rate, and sleep sync are enabled.'
    ]
  }
];

export const VendorGuideSection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('samsung');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ecosystem &amp; Companion App Setup</Text>
      <Text style={styles.sectionSubtitle}>
        Smartwatches sync biometrics through their manufacturer companion app into Android Health Connect
      </Text>

      {VENDOR_GUIDES.map((vendor) => {
        const isExpanded = expandedId === vendor.id;
        return (
          <View key={vendor.id} style={styles.vendorCard}>
            <TouchableOpacity
              style={styles.vendorHeader}
              onPress={() => toggleExpand(vendor.id)}
            >
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{vendor.name}</Text>
                <Text style={styles.vendorModels}>{vendor.models}</Text>
              </View>
              <View style={styles.headerRight}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{vendor.badge}</Text>
                </View>
                <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.instructionsContainer}>
                {vendor.instructions.map((step, idx) => (
                  <View key={idx} style={styles.instructionStep}>
                    <View style={styles.stepNumberCircle}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate.textMain,
    marginBottom: 4
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    marginBottom: 12,
    lineHeight: 16
  },
  vendorCard: {
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    marginBottom: 8,
    overflow: 'hidden'
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14
  },
  vendorInfo: {
    flex: 1
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  vendorModels: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    marginTop: 2
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  badge: {
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)'
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.clinical.teal
  },
  chevron: {
    fontSize: 10,
    color: Colors.slate.textMuted,
    marginLeft: 4
  },
  instructionsContainer: {
    backgroundColor: '#0B0F19',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.slate.cardBorder
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  stepNumberCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary.amber,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A'
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: Colors.slate.textMain,
    lineHeight: 18
  }
});
