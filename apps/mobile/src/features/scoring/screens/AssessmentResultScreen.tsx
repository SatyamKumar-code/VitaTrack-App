import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../../shared/theme/colors';
import { AssessmentResultData } from '../types/scoring.types';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { RiskLevelBadge } from '../components/RiskLevelBadge';
import { DoctorAlertBanner } from '../components/DoctorAlertBanner';
import { KeyContributorsCard } from '../components/KeyContributorsCard';
import { AssessmentApi } from '../../assessment/services/assessmentApi';

interface AssessmentResultScreenProps {
  initialData?: AssessmentResultData | null;
}

export const AssessmentResultScreen: React.FC<AssessmentResultScreenProps> = ({ initialData }) => {
  const router = useRouter();
  const [data, setData] = useState<AssessmentResultData | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    const fetchLatest = async () => {
      try {
        setLoading(true);
        setError(null);
        const latest = await AssessmentApi.getLatestAssessment();

        if (latest) {
          setData({
            assessmentId: latest._id || latest.id,
            timestamp: latest.completedAt || new Date().toISOString(),
            results: latest.results || latest.scoringResults,
            aiExplanation: latest.aiExplanation
          });
        } else {
          setData(null);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to retrieve assessment results.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, [initialData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary.amber} />
          <Text style={styles.loadingText}>Synthesizing Clinical Risk Evaluation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Assessment Found</Text>
          <Text style={styles.emptySubtitle}>
            {error || 'You have not completed an assessment yet. Complete the clinical questionnaire to view your evaluation.'}
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/assessment')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Start Self-Assessment &rarr;</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { results, aiExplanation, timestamp } = data;
  const formattedDate = new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.badgePillText}>Clinical Evaluation</Text>
          </View>
        </View>

        {/* Screen Title & Timestamp */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Vitamin D Risk Assessment</Text>
          <Text style={styles.timestampText}>Evaluated on {formattedDate}</Text>
        </View>

        {/* Risk Level Badge */}
        <View style={styles.badgeRow}>
          <RiskLevelBadge tier={results.riskTier} size="large" />
        </View>

        {/* Animated Circular SVG Gauge */}
        <RiskScoreGauge
          score={results.compositeScore}
          riskTier={results.riskTier}
          subScores={results.subScores}
        />

        {/* Doctor Consultation Warning Banner */}
        <DoctorAlertBanner
          required={results.doctorConsultationRequired}
          urgency={results.consultationUrgency}
          riskTier={results.riskTier}
          disclaimer={results.disclaimer}
        />

        {/* AI Explainer Synthesis Card */}
        {aiExplanation && <KeyContributorsCard explanation={aiExplanation} />}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => router.push('/history')}
            activeOpacity={0.8}
          >
            <Text style={styles.historyBtnText}>
              📈 View History, Trends &amp; Clinician Report &rarr;
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guidanceBtn}
            onPress={() => router.push('/guidance')}
            activeOpacity={0.8}
          >
            <Text style={styles.guidanceBtnText}>View Personalized Guidance &rarr;</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.remindersBtn}
            onPress={() => router.push('/reminders')}
            activeOpacity={0.8}
          >
            <Text style={styles.remindersBtnText}>
              🔔 Set Follow-Up &amp; Daily Sunlight Reminders &rarr;
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/assessment')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Retake Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loadingText: {
    color: Colors.slate.textMuted,
    fontSize: 14,
    marginTop: 14,
    fontWeight: '600'
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    color: Colors.slate.textMain,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8
  },
  emptySubtitle: {
    color: Colors.slate.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)'
  },
  backButtonText: {
    color: Colors.slate.textMain,
    fontSize: 13,
    fontWeight: '600'
  },
  badgePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10
  },
  badgePillText: {
    color: Colors.primary.amber,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  titleSection: {
    marginBottom: 12,
    alignItems: 'center'
  },
  screenTitle: {
    color: Colors.slate.textMain,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center'
  },
  timestampText: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    marginTop: 4
  },
  badgeRow: {
    marginVertical: 8,
    alignItems: 'center'
  },
  actionsContainer: {
    marginTop: 20,
    gap: 12
  },
  historyBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary.amber,
    shadowColor: Colors.primary.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  historyBtnText: {
    color: Colors.primary.amber,
    fontSize: 15,
    fontWeight: '800'
  },
  guidanceBtn: {
    backgroundColor: Colors.clinical.teal,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: Colors.clinical.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  guidanceBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  },
  remindersBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#6366F1'
  },
  remindersBtnText: {
    color: '#818CF8',
    fontSize: 15,
    fontWeight: '800'
  },
  primaryBtn: {
    backgroundColor: Colors.primary.amber,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: Colors.primary.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800'
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  secondaryBtnText: {
    color: Colors.slate.textMain,
    fontSize: 14,
    fontWeight: '700'
  }
});
