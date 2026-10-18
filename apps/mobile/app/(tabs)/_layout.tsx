import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../src/shared/theme/colors';
import {
  HomeTabIcon,
  CheckupTabIcon,
  GuidanceTabIcon,
  TrendsTabIcon,
  ProfileTabIcon
} from '../../src/shared/components/navigation/TabIcons';
import { triggerTabHaptic } from '../../src/shared/utils/haptics';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 6);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.amber,
        tabBarInactiveTintColor: Colors.slate.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.slate.card,
          borderTopColor: Colors.slate.cardBorder,
          borderTopWidth: 1,
          height: 60 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.35,
          shadowRadius: 8
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2
        },
        tabBarButton: (props: any) => (
          <TouchableOpacity
            {...props}
            activeOpacity={0.7}
            onPress={(e) => {
              triggerTabHaptic();
              props.onPress?.(e);
            }}
          />
        )
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activePill]} testID="tab-home">
              <HomeTabIcon color={color} focused={focused} size={22} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="assessment"
        options={{
          title: 'Checkup',
          tabBarLabel: 'Checkup',
          tabBarAccessibilityLabel: 'Checkup tab',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activePill]} testID="tab-assessment">
              <CheckupTabIcon color={color} focused={focused} size={22} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="guidance"
        options={{
          title: 'Guidance',
          tabBarLabel: 'Guidance',
          tabBarAccessibilityLabel: 'Guidance tab',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activePill]} testID="tab-guidance">
              <GuidanceTabIcon color={color} focused={focused} size={22} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Trends',
          tabBarLabel: 'Trends',
          tabBarAccessibilityLabel: 'Trends tab',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activePill]} testID="tab-history">
              <TrendsTabIcon color={color} focused={focused} size={22} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activePill]} testID="tab-profile">
              <ProfileTabIcon color={color} focused={focused} size={22} />
            </View>
          )
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 16
  },
  activePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)'
  }
});
