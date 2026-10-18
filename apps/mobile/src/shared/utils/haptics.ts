import { Vibration, Platform } from 'react-native';

/**
 * Trigger subtle tactile haptic feedback on tab press or button interactions.
 * Safe fallback across all mobile OS tiers and web preview without crashing.
 */
export function triggerTabHaptic(): void {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    try {
      Vibration.vibrate(Platform.OS === 'android' ? 12 : 8);
    } catch {
      // Graceful fallback if device vibration permission or hardware unavailable
    }
  }
}
