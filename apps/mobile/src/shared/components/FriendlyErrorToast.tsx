import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { getFriendlyErrorMessage } from '../utils/errorMasking';

interface FriendlyErrorToastProps {
  error: any;
  onDismiss?: () => void;
}

export const FriendlyErrorToast: React.FC<FriendlyErrorToastProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  const friendlyMessage = getFriendlyErrorMessage(error);

  return (
    <View style={styles.container}>
      <View style={styles.innerRow}>
        <Text style={styles.icon}>🛡️</Text>
        <Text style={styles.messageText}>{friendlyMessage}</Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 10
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  icon: {
    fontSize: 16
  },
  messageText: {
    flex: 1,
    fontSize: 12,
    color: '#FECACA',
    lineHeight: 17,
    fontWeight: '500'
  },
  closeBtn: {
    padding: 4
  },
  closeBtnText: {
    fontSize: 14,
    color: Colors.slate.textMuted,
    fontWeight: '700'
  }
});
