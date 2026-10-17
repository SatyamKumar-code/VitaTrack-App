import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Line,
  Rect,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop
} from 'react-native-svg';
import { AssessmentHistoryItem } from '../types/report.types';
import { Colors } from '../../../shared/theme/colors';

interface Props {
  assessments: AssessmentHistoryItem[];
  onSelectAssessment?: (assessment: AssessmentHistoryItem) => void;
}

type MetricMode = 'composite' | 'symptoms' | 'solar' | 'diet';

export const LongitudinalTrendChart: React.FC<Props> = ({
  assessments,
  onSelectAssessment
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const [activeMetric, setActiveMetric] = useState<MetricMode>('composite');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Sort chronological (oldest to newest for X-axis progression)
  const chronologicalData = [...assessments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartWidth = Math.max(300, Math.min(windowWidth - 48, 540));
  const chartHeight = 200;
  const paddingLeft = 36;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const getMetricMax = () => {
    switch (activeMetric) {
      case 'composite':
        return 100;
      case 'symptoms':
        return 45;
      case 'solar':
        return 25;
      case 'diet':
        return 20;
    }
  };

  const getMetricValue = (item: AssessmentHistoryItem): number => {
    switch (activeMetric) {
      case 'composite':
        return item.compositeScore;
      case 'symptoms':
        return item.subScores.symptomScore;
      case 'solar':
        return item.subScores.solarDeficitScore;
      case 'diet':
        return item.subScores.dietaryDeficitScore;
    }
  };

  const maxVal = getMetricMax();

  // If empty or 1 point, display minimal indicator
  if (chronologicalData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No historical assessments to plot yet.</Text>
      </View>
    );
  }

  // Calculate points
  const points = chronologicalData.map((item, idx) => {
    const x =
      chronologicalData.length === 1
        ? paddingLeft + innerWidth / 2
        : paddingLeft + (idx / (chronologicalData.length - 1)) * innerWidth;
    const val = getMetricValue(item);
    const clampedVal = Math.max(0, Math.min(maxVal, val));
    const y = paddingTop + innerHeight - (clampedVal / maxVal) * innerHeight;
    return { x, y, item, val };
  });

  // Build SVG path
  let pathD = '';
  let areaD = '';
  if (points.length === 1) {
    pathD = `M ${points[0].x} ${points[0].y}`;
  } else {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      // Smooth cubic bezier curve
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    const lastPoint = points[points.length - 1];
    areaD = `${pathD} L ${lastPoint.x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`;
  }

  const selectedPoint =
    selectedIndex !== null && points[selectedIndex] ? points[selectedIndex] : points[points.length - 1];

  const getTierColor = (score: number) => {
    if (activeMetric === 'composite') {
      if (score >= 70) return Colors.clinical.highRisk;
      if (score >= 40) return Colors.clinical.moderateRisk;
      return Colors.clinical.lowRisk;
    }
    return Colors.primary.amber;
  };

  return (
    <View style={styles.container}>
      {/* Metric Selector Pills */}
      <View style={styles.metricRow}>
        <TouchableOpacity
          style={[styles.metricPill, activeMetric === 'composite' && styles.metricPillActive]}
          onPress={() => {
            setActiveMetric('composite');
            setSelectedIndex(null);
          }}
        >
          <Text
            style={[
              styles.metricPillText,
              activeMetric === 'composite' && styles.metricPillTextActive
            ]}
          >
            Composite
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.metricPill, activeMetric === 'symptoms' && styles.metricPillActive]}
          onPress={() => {
            setActiveMetric('symptoms');
            setSelectedIndex(null);
          }}
        >
          <Text
            style={[
              styles.metricPillText,
              activeMetric === 'symptoms' && styles.metricPillTextActive
            ]}
          >
            Symptoms
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.metricPill, activeMetric === 'solar' && styles.metricPillActive]}
          onPress={() => {
            setActiveMetric('solar');
            setSelectedIndex(null);
          }}
        >
          <Text
            style={[
              styles.metricPillText,
              activeMetric === 'solar' && styles.metricPillTextActive
            ]}
          >
            Solar Deficit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.metricPill, activeMetric === 'diet' && styles.metricPillActive]}
          onPress={() => {
            setActiveMetric('diet');
            setSelectedIndex(null);
          }}
        >
          <Text
            style={[
              styles.metricPillText,
              activeMetric === 'diet' && styles.metricPillTextActive
            ]}
          >
            Diet Deficit
          </Text>
        </TouchableOpacity>
      </View>

      {/* SVG Chart Container */}
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Risk Tier Background Reference Bands (Only shown for composite) */}
          {activeMetric === 'composite' && (
            <G>
              {/* High Risk Band: 70 - 100 */}
              <Rect
                x={paddingLeft}
                y={paddingTop}
                width={innerWidth}
                height={innerHeight * 0.3}
                fill="rgba(239, 68, 68, 0.08)"
              />
              {/* Moderate Risk Band: 40 - 69 */}
              <Rect
                x={paddingLeft}
                y={paddingTop + innerHeight * 0.3}
                width={innerWidth}
                height={innerHeight * 0.3}
                fill="rgba(245, 158, 11, 0.06)"
              />
              {/* Low Risk Band: 0 - 39 */}
              <Rect
                x={paddingLeft}
                y={paddingTop + innerHeight * 0.6}
                width={innerWidth}
                height={innerHeight * 0.4}
                fill="rgba(16, 185, 129, 0.06)"
              />
            </G>
          )}

          {/* Grid lines and Y-axis scale */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + innerHeight * (1 - ratio);
            const valLabel = Math.round(maxVal * ratio);
            return (
              <G key={`grid-${i}`}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + innerWidth}
                  y2={y}
                  stroke="#1E293B"
                  strokeWidth="1"
                  strokeDasharray="4, 4"
                />
                <SvgText
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="#64748B"
                  fontSize="10"
                  textAnchor="end"
                >
                  {valLabel}
                </SvgText>
              </G>
            );
          })}

          {/* Area fill */}
          {areaD !== '' && <Path d={areaD} fill="url(#areaGradient)" />}

          {/* Trajectory Curve Line */}
          {pathD !== '' && (
            <Path
              d={pathD}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Point Markers (Declarative SVG only, no direct onPress on SVG elements) */}
          {points.map((pt, idx) => {
            const isSelected = selectedIndex === idx;
            const ptColor = getTierColor(pt.item.compositeScore);
            return (
              <G key={`pt-${idx}`}>
                {isSelected && (
                  <Circle
                    cx={pt.x}
                    cy={pt.y}
                    r={9}
                    fill={ptColor}
                    opacity={0.35}
                  />
                )}
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6 : 4.5}
                  fill={ptColor}
                  stroke="#0F172A"
                  strokeWidth={2}
                />
              </G>
            );
          })}
        </Svg>

        {/* Cross-platform Touch Targets for direct point clicks on Web, iOS and Android */}
        {points.map((pt, idx) => (
          <TouchableOpacity
            key={`touch-pt-${idx}`}
            style={{
              position: 'absolute',
              left: Math.max(0, pt.x - 18),
              top: Math.max(0, pt.y - 18),
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'transparent',
              zIndex: 10
            }}
            activeOpacity={0.7}
            onPress={() => {
              setSelectedIndex(idx);
              if (onSelectAssessment) onSelectAssessment(pt.item);
            }}
          />
        ))}
      </View>

      {/* Horizontal Evaluation Scrubber Bar */}
      {points.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.evalScroller}
        >
          {points.map((pt, idx) => {
            const isSelected =
              selectedIndex === idx || (selectedIndex === null && idx === points.length - 1);
            const dateStr = new Date(pt.item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
            const ptColor = getTierColor(pt.item.compositeScore);
            return (
              <TouchableOpacity
                key={`eval-chip-${idx}`}
                style={[
                  styles.evalChip,
                  isSelected && { borderColor: ptColor, backgroundColor: `${ptColor}18` }
                ]}
                onPress={() => {
                  setSelectedIndex(idx);
                  if (onSelectAssessment) onSelectAssessment(pt.item);
                }}
              >
                <View style={[styles.evalDot, { backgroundColor: ptColor }]} />
                <Text
                  style={[
                    styles.evalChipText,
                    isSelected && { color: Colors.slate.textMain, fontWeight: '700' }
                  ]}
                >
                  #{idx + 1} ({dateStr})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Selected Point Detail Card / Tooltip */}
      {selectedPoint && (
        <View style={styles.tooltipCard}>
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipDate}>
              {new Date(selectedPoint.item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            <View
              style={[
                styles.tooltipTierBadge,
                { backgroundColor: `${getTierColor(selectedPoint.item.compositeScore)}20` }
              ]}
            >
              <Text
                style={[
                  styles.tooltipTierText,
                  { color: getTierColor(selectedPoint.item.compositeScore) }
                ]}
              >
                {selectedPoint.item.riskTier.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.tooltipMetricsRow}>
            <Text style={styles.tooltipMetricLabel}>
              {activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}:
            </Text>
            <Text style={styles.tooltipMetricVal}>
              {selectedPoint.val} / {maxVal}
            </Text>
            {selectedPoint.item.doctorAlert && (
              <Text style={styles.doctorFlagText}>⚠️ Doctor Alert</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.slate.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    padding: 16,
    marginBottom: 16
  },
  metricRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap'
  },
  metricPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  metricPillActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: Colors.primary.amber
  },
  metricPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.slate.textMuted
  },
  metricPillTextActive: {
    color: Colors.primary.amber
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4
  },
  tooltipCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  tooltipDate: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate.textMain
  },
  tooltipTierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  tooltipTierText: {
    fontSize: 10,
    fontWeight: '700'
  },
  tooltipMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  tooltipMetricLabel: {
    fontSize: 12,
    color: Colors.slate.textMuted
  },
  tooltipMetricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary.amber
  },
  doctorFlagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.clinical.highRisk,
    marginLeft: 'auto'
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.slate.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    marginBottom: 16
  },
  emptyText: {
    color: Colors.slate.textMuted,
    fontSize: 13
  },
  evalScroller: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
    marginVertical: 4
  },
  evalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  evalDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  evalChipText: {
    fontSize: 11,
    color: Colors.slate.textMuted
  }
});
