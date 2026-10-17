import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AuthApi } from '../api/authApi';
import { Colors } from '../../../shared/theme/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await AuthApi.forgotPassword(email.trim());
      setSubmitted(true);
    } catch {
      // Show generic safe message for security
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>&larr; Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconRing}>
            <Text style={styles.icon}>🔑</Text>
          </View>
          <Text style={styles.title}>Password Recovery</Text>
          <Text style={styles.subtitle}>
            Enter your account email to receive cryptographic recovery instructions
          </Text>
        </View>

        {submitted ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Request Initiated</Text>
            <Text style={styles.successMessage}>
              If an account with that email exists in the VitaTrack database, password recovery instructions have been dispatched.
            </Text>
            <TouchableOpacity
              style={styles.returnButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.returnButtonText}>Return to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Registered Email</Text>
              <TextInput
                style={styles.input}
                placeholder="patient@example.com"
                placeholderTextColor={Colors.slate.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity
              style={[styles.actionButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0B0F19" />
              ) : (
                <Text style={styles.actionButtonText}>Send Recovery Link</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center'
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24
  },
  backButtonText: {
    color: Colors.primary.amber,
    fontSize: 14,
    fontWeight: '600'
  },
  header: {
    alignItems: 'center',
    marginBottom: 28
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.glow,
    borderWidth: 2,
    borderColor: Colors.primary.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  icon: {
    fontSize: 28
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.slate.textMain,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: Colors.slate.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20
  },
  form: {
    width: '100%',
    gap: 16
  },
  inputGroup: {
    gap: 6
  },
  label: {
    color: Colors.slate.textMain,
    fontSize: 13,
    fontWeight: '600'
  },
  input: {
    backgroundColor: Colors.slate.card,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.slate.textMain,
    fontSize: 15
  },
  actionButton: {
    backgroundColor: Colors.primary.amber,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    opacity: 0.6
  },
  actionButtonText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: '700'
  },
  successBox: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.4)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center'
  },
  successTitle: {
    color: Colors.clinical.teal,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  successMessage: {
    color: Colors.slate.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20
  },
  returnButton: {
    backgroundColor: Colors.primary.amber,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10
  },
  returnButtonText: {
    color: '#0B0F19',
    fontWeight: '700',
    fontSize: 14
  }
});
