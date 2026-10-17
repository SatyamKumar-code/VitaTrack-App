import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Colors } from '../../../shared/theme/colors';
import { EducationalArticle } from '../types/guidance.types';

interface EducationalHubViewProps {
  articles: EducationalArticle[];
}

export const EducationalHubView: React.FC<EducationalHubViewProps> = ({
  articles
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<EducationalArticle | null>(null);

  const CATEGORIES = [
    { key: 'all', label: 'All Articles' },
    { key: 'synthesis', label: 'Synthesis' },
    { key: 'clinical', label: 'Clinical' },
    { key: 'nutrition', label: 'Nutrition' },
    { key: 'safety', label: 'Sun Safety' }
  ];

  const filteredArticles =
    selectedCategory === 'all'
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vitamin D Knowledge Hub</Text>
        <Text style={styles.sectionSubtitle}>
          Evidence-based clinical guides on synthesis, laboratory testing, and physiology:
        </Text>
      </View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.filterPill, isSelected && styles.filterPillActive]}
              onPress={() => setSelectedCategory(cat.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Article Cards List */}
      <View style={styles.articlesList}>
        {filteredArticles.map((art) => (
          <TouchableOpacity
            key={art.id}
            style={styles.articleCard}
            onPress={() => setActiveArticle(art)}
            activeOpacity={0.8}
          >
            <View style={styles.articleHeader}>
              <Text style={styles.categoryBadge}>{art.category.toUpperCase()}</Text>
              <Text style={styles.readTime}>⏱ {art.readTimeMinutes} min read</Text>
            </View>
            <Text style={styles.articleTitle}>{art.title}</Text>
            <Text style={styles.articleSubtitle}>{art.subtitle}</Text>
            <Text style={styles.articleSummary} numberOfLines={2}>
              {art.summary}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.readLink}>Read Full Article &rarr;</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Article Reader Modal */}
      <Modal
        visible={activeArticle !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveArticle(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setActiveArticle(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>&larr; Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderCategory}>
              {activeArticle?.category.toUpperCase()}
            </Text>
          </View>

          {activeArticle && (
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>{activeArticle.title}</Text>
              <Text style={styles.modalSubtitle}>{activeArticle.subtitle}</Text>
              <Text style={styles.modalReadMeta}>
                ⏱ {activeArticle.readTimeMinutes} min clinical read &bull; Evidence-based
              </Text>

              {/* Sections */}
              <View style={styles.sectionsContainer}>
                {activeArticle.contentSections.map((sec, idx) => (
                  <View key={idx} style={styles.sectionBlock}>
                    <Text style={styles.sectionHeading}>{sec.heading}</Text>
                    <Text style={styles.sectionBody}>{sec.body}</Text>
                    {sec.keyTakeaway && (
                      <View style={styles.takeawayBox}>
                        <Text style={styles.takeawayLabel}>Key Clinical Takeaway:</Text>
                        <Text style={styles.takeawayText}>{sec.keyTakeaway}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Scientific References */}
              {activeArticle.scientificReferences.length > 0 && (
                <View style={styles.referencesCard}>
                  <Text style={styles.referencesTitle}>Scientific References</Text>
                  {activeArticle.scientificReferences.map((ref, idx) => (
                    <Text key={idx} style={styles.referenceText}>
                      [{idx + 1}] {ref}
                    </Text>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => setActiveArticle(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.doneBtnText}>Back to Guidance Hub</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16
  },
  sectionHeader: {
    marginBottom: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    marginTop: 4
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 4
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.slate.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  filterPillActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: Colors.primary.amber
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate.textMuted
  },
  filterTextActive: {
    color: Colors.primary.amber,
    fontWeight: '700'
  },
  articlesList: {
    gap: 12
  },
  articleCard: {
    backgroundColor: Colors.slate.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.clinical.teal,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  readTime: {
    fontSize: 11,
    color: Colors.slate.textMuted
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.textMain,
    lineHeight: 20
  },
  articleSubtitle: {
    fontSize: 12,
    color: Colors.primary.amber,
    marginTop: 4,
    fontWeight: '500'
  },
  articleSummary: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    marginTop: 6,
    lineHeight: 17
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.slate.cardBorder
  },
  readLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.amber
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate.cardBorder
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B'
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.textMain
  },
  modalHeaderCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.clinical.teal,
    letterSpacing: 0.5
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.slate.textMain,
    lineHeight: 26
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.primary.amber,
    marginTop: 6,
    lineHeight: 18,
    fontWeight: '500'
  },
  modalReadMeta: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    marginTop: 8,
    marginBottom: 20
  },
  sectionsContainer: {
    gap: 20
  },
  sectionBlock: {
    gap: 8
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.slate.textMain
  },
  sectionBody: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20
  },
  takeawayBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.amber,
    marginTop: 6
  },
  takeawayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary.amber,
    textTransform: 'uppercase'
  },
  takeawayText: {
    fontSize: 12,
    color: Colors.slate.textMain,
    marginTop: 2,
    lineHeight: 16
  },
  referencesCard: {
    marginTop: 24,
    backgroundColor: Colors.slate.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  referencesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  referenceText: {
    fontSize: 11,
    color: Colors.slate.textMuted,
    lineHeight: 16,
    marginBottom: 4
  },
  doneBtn: {
    marginTop: 24,
    backgroundColor: Colors.primary.amber,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  }
});
