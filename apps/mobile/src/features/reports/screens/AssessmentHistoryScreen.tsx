import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth/context/AuthContext';
import { ReportApi } from '../services/reportApi';
import { PdfGenerator } from '../services/pdfGenerator';
import { PdfSharing } from '../services/pdfSharing';
import {
  AssessmentHistoryItem,
  TrendSummaryMetrics,
  HistoryApiResponse
} from '../types/report.types';
import { LongitudinalTrendChart } from '../components/LongitudinalTrendChart';
import { TrendMetricsHeader } from '../components/TrendMetricsHeader';
import { AssessmentHistoryCard } from '../components/AssessmentHistoryCard';
import { Colors } from '../../../shared/theme/colors';
import { getFriendlyErrorMessage } from '../../../shared/utils/errorMasking';

type DateFilter = 'all' | '90d' | '30d';

export const AssessmentHistoryScreen: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isGuest } = useAuth();

  const [assessments, setAssessments] = useState<AssessmentHistoryItem[]>([]);
  const [metrics, setMetrics] = useState<TrendSummaryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DateFilter>('all');
  const [isExportingFullPdf, setIsExportingFullPdf] = useState(false);
  const [exportingItemId, setExportingItemId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (filter: DateFilter = activeFilter) => {
      // Ephemeral Guest Mode: Zero DB writes or reads
      if (!isAuthenticated || isGuest) {
        setLoading(false);
        setRefreshing(false);
        setAssessments([]);
        return;
      }

      try {
        setErrorMsg(null);
        let startDate: string | undefined;

        const now = new Date();
        if (filter === '30d') {
          const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          startDate = d.toISOString();
        } else if (filter === '90d') {
          const d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          startDate = d.toISOString();
        }

        const res: HistoryApiResponse = await ReportApi.getHistory({
          page: 1,
          limit: 50,
          startDate
        });

        setAssessments(res.data);
        setMetrics(res.summary);
      } catch (err: any) {
        setErrorMsg(getFriendlyErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilter, isAuthenticated, isGuest]
  );

  useEffect(() => {
    fetchHistory(activeFilter);
  }, [activeFilter, fetchHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(activeFilter);
  }, [activeFilter, fetchHistory]);

  const handleExportFullSummaryPdf = async () => {
    if (!assessments.length || !metrics) {
      Alert.alert('No Data', 'You need at least one completed assessment to generate a health report.');
      return;
    }

    try {
      setIsExportingFullPdf(true);
      const latest = assessments[0];

      let age: number | undefined;
      if (user?.dateOfBirth) {
        const diffMs = Date.now() - new Date(user.dateOfBirth).getTime();
        age = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
      }

      const reportPayload = {
        patient: {
          fullName: user?.fullName || 'Patient',
          email: user?.email,
          skinType: user?.skinType,
          dietaryPreference: user?.dietaryPreference,
          age,
          medicalConditions: user?.medicalConditions
        },
        latestAssessment: latest,
        assessmentHistory: assessments,
        summaryMetrics: metrics,
        generatedAt: new Date().toISOString()
      };

      const { uri } = await PdfGenerator.generateClinicianReportPdf(reportPayload);
      await PdfSharing.shareReportPdf(uri, `VitaTrack Clinician Report - ${user?.fullName || 'Patient'}`);
    } catch (err: any) {
      Alert.alert('Export Error', getFriendlyErrorMessage(err));
    } finally {
      setIsExportingFullPdf(false);
    }
  };

  const handleExportSingleAssessmentPdf = async (item: AssessmentHistoryItem) => {
    try {
      setExportingItemId(item.id);

      let age: number | undefined;
      if (user?.dateOfBirth) {
        const diffMs = Date.now() - new Date(user.dateOfBirth).getTime();
        age = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
      }

      const singleMetrics: TrendSummaryMetrics = {
        totalAssessments: 1,
        averageScore: item.compositeScore,
        latestScore: item.compositeScore,
        earliestScore: item.compositeScore,
        scoreDelta: null,
        highestScore: item.compositeScore,
        lowestScore: item.compositeScore,
        riskDistribution: {
          low: item.riskTier === 'low' ? 1 : 0,
          moderate: item.riskTier === 'moderate' ? 1 : 0,
          high: item.riskTier === 'high' ? 1 : 0
        },
        trendDirection: 'insufficient_data'
      };

      const reportPayload = {
        patient: {
          fullName: user?.fullName || 'Patient',
          email: user?.email,
          skinType: user?.skinType,
          dietaryPreference: user?.dietaryPreference,
          age,
          medicalConditions: user?.medicalConditions
        },
        latestAssessment: item,
        assessmentHistory: [item],
        summaryMetrics: singleMetrics,
        generatedAt: new Date().toISOString()
      };

      const { uri } = await PdfGenerator.generateClinicianReportPdf(reportPayload);
      await PdfSharing.shareReportPdf(uri, `VitaTrack Assessment Summary - ${item.date}`);
    } catch (err: any) {
      Alert.alert('Export Error', getFriendlyErrorMessage(err));
    } finally {
      setExportingItemId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.amber}
          />
        }
      >
        {/* Navigation / Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>&larr; Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Assessment History</Text>
            <Text style={styles.headerSubtitle}>Longitudinal Vitamin D Trajectory &amp; Reports</Text>
          </View>
        </View>

        {/* Global Clinician PDF Export CTA */}
        {assessments.length > 0 && (
          <TouchableOpacity
            style={styles.exportFullReportButton}
            onPress={handleExportFullSummaryPdf}
            disabled={isExportingFullPdf}
          >
            {isExportingFullPdf ? (
              <ActivityIndicator size="small" color="#0B0F19" />
            ) : (
              <Text style={styles.exportFullReportButtonText}>
                📄 Export Clinician Health Summary PDF &rarr;
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Date Filter Tabs */}
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === 'all' && styles.filterTabTextActive
              ]}
            >
              All Time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeFilter === '90d' && styles.filterTabActive]}
            onPress={() => setActiveFilter('90d')}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === '90d' && styles.filterTabTextActive
              ]}
            >
              Last 90 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeFilter === '30d' && styles.filterTabActive]}
            onPress={() => setActiveFilter('30d')}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === '30d' && styles.filterTabTextActive
              ]}
            >
              Last 30 Days
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Callout */}
        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            <TouchableOpacity onPress={() => fetchHistory(activeFilter)}>
              <Text style={styles.retryText}>Tap to Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.amber} />
            <Text style={styles.loadingText}>Loading clinical history and trend analytics...</Text>
          </View>
        ) : assessments.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyEmblem}>
              <Text style={{ fontSize: 36 }}>📊</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {!isAuthenticated || isGuest ? 'Track Progress Over Time' : 'No Assessments Recorded Yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {!isAuthenticated || isGuest
                ? 'Create a free account or sign in to save assessments, track longitudinal risk trajectory charts, and export clinician PDF summaries.'
                : 'Complete your first clinical multi-factor self-assessment questionnaire to evaluate your risk score and start tracking your longitudinal health progression.'}
            </Text>
            <TouchableOpacity
              style={styles.startAssessmentButton}
              onPress={() => router.push('/assessment')}
            >
              <Text style={styles.startAssessmentButtonText}>
                Start Clinical Self-Assessment &rarr;
              </Text>
            </TouchableOpacity>

            {(!isAuthenticated || isGuest) && (
              <TouchableOpacity
                style={[
                  styles.startAssessmentButton,
                  {
                    backgroundColor: Colors.slate.card,
                    borderWidth: 1,
                    borderColor: Colors.primary.amber,
                    marginTop: 10
                  }
                ]}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={[styles.startAssessmentButtonText, { color: Colors.primary.amber }]}>
                  Sign In to Sync History &rarr;
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Content: Summary Metrics, Trend Chart & History Cards */
          <View>
            {/* Trend Summary Metrics */}
            {metrics && <TrendMetricsHeader metrics={metrics} />}

            {/* Visual Health Trend Chart */}
            <LongitudinalTrendChart assessments={assessments} />

            {/* Chronological List Header */}
            <View style={styles.listHeaderRow}>
              <Text style={styles.sectionTitle}>Completed Evaluations</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{assessments.length} total</Text>
              </View>
            </View>

            {/* Assessment Cards */}
            {assessments.map((item, idx) => (
              <AssessmentHistoryCard
                key={item.id}
                assessment={item}
                index={idx}
                totalCount={assessments.length}
                onExportPdf={handleExportSingleAssessmentPdf}
                isExporting={exportingItemId === item.id}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  container: {
    padding: 20
  },
  header: {
    marginBottom: 16
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10
  },
  backButtonText: {
    color: Colors.primary.amber,
    fontSize: 13,
    fontWeight: '700'
  },
  titleContainer: {
    marginTop: 2
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.slate.textMain,
    letterSpacing: 0.3
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    marginTop: 3
  },
  exportFullReportButton: {
    backgroundColor: Colors.primary.amber,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary.amber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
  },
  exportFullReportButtonText: {
    color: '#0B0F19',
    fontSize: 14,
    fontWeight: '800'
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  filterTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.slate.card,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    alignItems: 'center'
  },
  filterTabActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: Colors.primary.amber
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate.textMuted
  },
  filterTabTextActive: {
    color: Colors.primary.amber,
    fontWeight: '700'
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  errorText: {
    color: Colors.clinical.highRisk,
    fontSize: 12,
    flex: 1
  },
  retryText: {
    color: Colors.primary.amber,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 10
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: Colors.slate.textMuted,
    fontSize: 13,
    marginTop: 12
  },
  emptyStateContainer: {
    backgroundColor: Colors.slate.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 30,
    alignItems: 'center',
    marginVertical: 20
  },
  emptyEmblem: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.slate.textMain,
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20
  },
  startAssessmentButton: {
    backgroundColor: Colors.primary.amber,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22
  },
  startAssessmentButtonText: {
    color: '#0B0F19',
    fontSize: 14,
    fontWeight: '700'
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 6
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.textMain,
    letterSpacing: 0.3
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  countBadgeText: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    fontWeight: '600'
  }
});
