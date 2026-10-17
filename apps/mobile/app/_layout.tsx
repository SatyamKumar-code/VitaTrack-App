import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/features/auth/context/AuthContext';
import { Colors } from '../src/shared/theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.slate.card
            },
            headerTintColor: Colors.slate.textMain,
            headerTitleStyle: {
              fontWeight: 'bold'
            },
            contentStyle: {
              backgroundColor: Colors.slate.bg
            }
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'VitaTrack',
              headerShown: false
            }}
          />
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              title: 'My Profile',
              headerShown: false
            }}
          />
          <Stack.Screen
            name="assessment"
            options={{
              title: 'Clinical Assessment',
              headerShown: false
            }}
          />
          <Stack.Screen
            name="results"
            options={{
              title: 'Assessment Results',
              headerShown: false
            }}
          />
          <Stack.Screen
            name="guidance"
            options={{
              title: 'Personalized Guidance',
              headerShown: false
            }}
          />
          <Stack.Screen
            name="history"
            options={{
              title: 'Assessment History & Reports',
              headerShown: false
            }}
          />
          <Stack.Screen
            name="reminders"
            options={{
              title: 'Smart Reminders',
              headerShown: false
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
