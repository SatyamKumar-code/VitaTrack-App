import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../../shared/theme/colors';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  highlight: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: '☀️',
    title: 'Self-Screening for Vitamin D Deficiency',
    subtitle:
      'Evaluate clinical symptoms, outdoor exposure habits, and dietary intake through a clinically calibrated questionnaire.',
    highlight: 'Deterministic Multi-Factor Scoring'
  },
  {
    id: '2',
    icon: '🌿',
    title: 'Tailored Solar & Nutritional Guidance',
    subtitle:
      'Receive personalized safe sunlight exposure limits based on your Fitzpatrick skin type and UV index, plus diet recommendations.',
    highlight: 'Phototype & Bioavailability Adaptation'
  },
  {
    id: '3',
    icon: '⌚',
    title: 'Wearable Sync & Clinician Reports',
    subtitle:
      'Track resting heart rate, sleep quality, and outdoor steps, then export comprehensive PDF summaries for your doctor.',
    highlight: 'Privacy & Device-Level Protection'
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const isLastSlide = currentSlideIndex === SLIDES.length - 1;
  const currentSlide = SLIDES[currentSlideIndex];

  const handleNext = () => {
    if (isLastSlide) {
      router.push('/(auth)/register');
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header / Skip */}
      <View style={styles.topBar}>
        <Text style={styles.logoText}>VitaTrack</Text>
        {!isLastSlide ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Main Slide Content */}
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{currentSlide.icon}</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{currentSlide.highlight}</Text>
        </View>

        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
      </View>

      {/* Bottom Navigation & Dots */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlideIndex ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.primaryButton, isLastSlide && styles.accentButton]}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.secondaryButtonText}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.slate.bg,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary.amber,
    letterSpacing: 0.5
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  skipText: {
    color: Colors.slate.textMuted,
    fontSize: 14,
    fontWeight: '500'
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 12
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary.glow,
    borderWidth: 2,
    borderColor: Colors.primary.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28
  },
  icon: {
    fontSize: 54
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16
  },
  badgeText: {
    color: Colors.primary.amber,
    fontSize: 12,
    fontWeight: '600'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.slate.textMain,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32
  },
  subtitle: {
    fontSize: 15,
    color: Colors.slate.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 16
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 24
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary.amber
  },
  inactiveDot: {
    width: 8,
    backgroundColor: Colors.slate.cardBorder
  },
  buttonRow: {
    width: '100%',
    gap: 12
  },
  primaryButton: {
    backgroundColor: Colors.primary.amber,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  accentButton: {
    backgroundColor: Colors.primary.orange
  },
  primaryButtonText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: '700'
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: Colors.slate.textMuted,
    fontSize: 13,
    fontWeight: '500'
  }
});
