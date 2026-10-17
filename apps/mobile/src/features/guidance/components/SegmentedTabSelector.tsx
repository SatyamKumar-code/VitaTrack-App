import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../../shared/theme/colors';

export type GuidanceTabKey = 'nutrition' | 'sunlight' | 'exercise' | 'education';

interface TabItem {
  key: GuidanceTabKey;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { key: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { key: 'sunlight', label: 'Sunlight', icon: '☀️' },
  { key: 'exercise', label: 'Exercise', icon: '🏃' },
  { key: 'education', label: 'Learn', icon: '📖' }
];

interface SegmentedTabSelectorProps {
  activeTab: GuidanceTabKey;
  onSelectTab: (tab: GuidanceTabKey) => void;
}

export const SegmentedTabSelector: React.FC<SegmentedTabSelectorProps> = ({
  activeTab,
  onSelectTab
}) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 4,
    marginVertical: 12
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4
  },
  activeTabButton: {
    backgroundColor: Colors.primary.amber,
    shadowColor: Colors.primary.amber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
  },
  tabIcon: {
    fontSize: 14
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.slate.textMuted
  },
  activeTabLabel: {
    color: '#0F172A',
    fontWeight: '700'
  }
});
