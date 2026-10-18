import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/features/auth/context/AuthContext';
import { Colors } from '../src/shared/theme/colors';
import { ErrorBoundary } from '../src/shared/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
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
              name="(tabs)"
              options={{
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
              name="results"
              options={{
                title: 'Assessment Results',
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
            <Stack.Screen
              name="wearables"
              options={{
                title: 'Smartwatch & Wearables',
                headerShown: false
              }}
            />
          </Stack>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
