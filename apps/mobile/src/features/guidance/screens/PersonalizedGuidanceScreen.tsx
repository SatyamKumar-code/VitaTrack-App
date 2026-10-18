import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../shared/theme/colors';
import {
  PersonalizedGuidancePayload,
  DietaryPreference,
  SkinType,
  EducationalArticle
} from '../types/guidance.types';
import { GuidanceApi } from '../services/guidanceApi';
import { SegmentedTabSelector, GuidanceTabKey } from '../components/SegmentedTabSelector';
import { DietGuidanceCard } from '../components/DietGuidanceCard';
import { SunlightExposureTracker } from '../components/SunlightExposureTracker';
import { ExerciseRoutinesView } from '../components/ExerciseRoutinesView';
import { EducationalHubView } from '../components/EducationalHubView';

export const PersonalizedGuidanceScreen: React.FC = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<GuidanceTabKey>('nutrition');
  const [loading, setLoading] = useState<boolean>(true);
  const [guidance, setGuidance] = useState<PersonalizedGuidancePayload | null>(null);
  const [articles, setArticles] = useState<EducationalArticle[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<DietaryPreference>('omnivore');
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType>('type_3');

  const loadData = async (diet?: DietaryPreference, skinType?: SkinType) => {
    setLoading(true);
    try {
      const payload = await GuidanceApi.fetchCurrentGuidance(diet, skinType);
      setGuidance(payload);
      setSelectedDiet(payload.nutrition.dietType);
      setSelectedSkinType(payload.sunlight.skinType);

      const educationalList = await GuidanceApi.fetchEducationalArticles();
      setArticles(educationalList);
    } catch {
      const fallback = GuidanceApi.getOfflineFallbackGuidance(diet, skinType);
      setGuidance(fallback);
      setSelectedDiet(fallback.nutrition.dietType);
      setSelectedSkinType(fallback.sunlight.skinType);
      setArticles(GuidanceApi.getOfflineFallbackArticles());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDietChange = (newDiet: DietaryPreference) => {
    setSelectedDiet(newDiet);
    loadData(newDiet, selectedSkinType);
  };

  const handleSkinTypeChange = (newSkinType: SkinType) => {
    setSelectedSkinType(newSkinType);
    loadData(selectedDiet, newSkinType);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/')}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>&larr; Dashboard</Text>
          </TouchableOpacity>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>Clinical Guidance</Text>
          </View>
        </View>

        {/* Header Title */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Personalized Guidance Hub</Text>
          <Text style={styles.screenSubtitle}>
            Dietary bio-availability, solar synthesis timer &amp; osteogenic routines
          </Text>
        </View>

        {/* Tab Selector */}
        <SegmentedTabSelector
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* Loading State */}
        {loading && !guidance && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.amber} />
            <Text style={styles.loadingText}>Synthesizing personalized guidance...</Text>
          </View>
        )}

        {/* Tab Content */}
        {guidance && (
          <View style={styles.tabContentContainer}>
            {activeTab === 'nutrition' && (
              <DietGuidanceCard
                nutrition={guidance.nutrition}
                selectedDiet={selectedDiet}
                onDietChange={handleDietChange}
              />
            )}

            {activeTab === 'sunlight' && (
              <SunlightExposureTracker
                sunlight={guidance.sunlight}
                selectedSkinType={selectedSkinType}
                onSkinTypeChange={handleSkinTypeChange}
              />
            )}

            {activeTab === 'exercise' && (
              <ExerciseRoutinesView exercise={guidance.exercise} />
            )}

            {activeTab === 'education' && (
              <EducationalHubView articles={articles} />
            )}
          </View>
        )}

        {/* Phase 7 Reminders CTA */}
        <TouchableOpacity
          style={styles.remindersCtaButton}
          onPress={() => router.push('/reminders')}
        >
          <Text style={styles.remindersCtaText}>
            🔔 Set Daily Sunlight, Meal &amp; Supplement Reminders &rarr;
          </Text>
        </TouchableOpacity>

        {/* Footer Medical Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerTitle}>Medical &amp; Safety Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            VitaTrack guidance is based on clinical nutritional and photobiological literature. It does not constitute individual medical prescription or supersede physician treatment. Always consult a healthcare provider for persistent deficiency symptoms or before initiating high-dose supplementation.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.slate.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.textMain
  },
  badgePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.amber
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary.amber
  },
  titleSection: {
    marginBottom: 8
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.slate.textMain,
    letterSpacing: -0.5
  },
  screenSubtitle: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    marginTop: 4,
    lineHeight: 18
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12
  },
  loadingText: {
    fontSize: 13,
    color: Colors.slate.textMuted
  },
  tabContentContainer: {
    marginTop: 8
  },
  remindersCtaButton: {
    marginTop: 20,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  remindersCtaText: {
    color: '#818CF8',
    fontSize: 13,
    fontWeight: '700'
  },
  disclaimerContainer: {
    marginTop: 32,
    padding: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  disclaimerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  disclaimerText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16
  }
});
