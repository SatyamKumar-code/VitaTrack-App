import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Expo Router unmatched route catch-all.
 * Gracefully redirects any unknown or legacy path (e.g., /index) back to the main tabs.
 */
export default function NotFoundScreen() {
  return <Redirect href={'/(tabs)' as any} />;
}
