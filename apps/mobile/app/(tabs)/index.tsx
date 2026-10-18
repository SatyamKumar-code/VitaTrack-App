import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/features/auth/context/AuthContext';
import { Colors } from '../../src/shared/theme/colors';
import { HomeHeroCard } from '../../src/features/home/components/HomeHeroCard';
import { DailyWellnessInsightCard } from '../../src/features/home/components/DailyWellnessInsightCard';
import { WearableActivityCard } from '../../src/features/home/components/WearableActivityCard';
import { QuickAccessHub } from '../../src/features/home/components/QuickAccessHub';
import { triggerTabHaptic } from '../../src/shared/utils/haptics';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    triggerTabHaptic();
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.amber}
            colors={[Colors.primary.amber]}
          />
        }
      >
        {/* Top Brand Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandGroup}>
            <View style={styles.solarIconWrapper}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.brandTitle}>VitaTrack</Text>
              <Text style={styles.brandTagline}>Solar Vitality &amp; Health Platform</Text>
            </View>
          </View>

          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.profileBadge}
              onPress={() => {
                triggerTabHaptic();
                router.push('/profile');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.profileAvatar}>👤</Text>
              <Text style={styles.profileName} numberOfLines={1}>
                {user?.fullName?.split(' ')[0] || 'Profile'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInBadge}
              onPress={() => {
                triggerTabHaptic();
                router.push('/(auth)/login');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 1. Hero Card: Solar Synthesis Gauge, UV Index & Start Checkup CTA */}
        <HomeHeroCard
          userName={user?.fullName}
          isAuthenticated={isAuthenticated}
          skinType={user?.skinType}
          dietaryPreference={user?.dietaryPreference}
        />

        {/* 2. Daily Wellness Insight: Rotating Evidence-Based Health Tips */}
        <DailyWellnessInsightCard
          onExploreGuidance={() => {
            triggerTabHaptic();
            router.push('/guidance');
          }}
        />

        {/* 3. Connected Wearables & Activity Sync Preview */}
        <WearableActivityCard
          isAuthenticated={isAuthenticated}
          steps={7420}
          restingHeartRate={68}
          sleepMinutes={465}
          spO2={98.2}
        />

        {/* 4. Quick Access Hub & Clinical Disclaimer */}
        <QuickAccessHub />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 32
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  solarIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 3
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.slate.textMain,
    letterSpacing: -0.3
  },
  brandTagline: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    fontWeight: '500'
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.80)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6
  },
  profileAvatar: {
    fontSize: 13
  },
  profileName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate.textMain,
    maxWidth: 80
  },
  signInBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14
  },
  signInText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.amber
  }
});
