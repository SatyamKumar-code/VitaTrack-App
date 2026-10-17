import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../src/shared/theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={Colors.slate.bg} />
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
            title: 'VitaSun',
            headerShown: false
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
