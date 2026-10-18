import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../../../shared/theme/colors';
import { GuestStore } from '../../assessment/storage/guestStore';
import { AssessmentApi } from '../../assessment/services/assessmentApi';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await login({ email: email.trim(), password });

      // If user had a guest evaluation waiting, persist to MongoDB now that authenticated
      const pendingGuest = GuestStore.getGuestAssessment();
      if (pendingGuest) {
        try {
          await AssessmentApi.submitAssessment({
            symptoms: pendingGuest.draft.symptoms,
            sunExposure: pendingGuest.draft.sunExposure,
            dietaryHabits: pendingGuest.draft.dietaryHabits
          });
          GuestStore.clearGuestAssessment();
          router.replace('/results');
          return;
        } catch {
          // Graceful non-blocking fallback
        }
      }

      router.replace('/profile');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials.';
      setErrorMessage(msg);
      Alert.alert('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>&larr; Back</Text>
            </TouchableOpacity>
            <View style={styles.iconRing}>
              <Text style={styles.icon}>☀️</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to access your Vitamin D assessments, solar guidance, and profile
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
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

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.slate.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0B0F19" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupPrompt}>
              <Text style={styles.promptText}>Do not have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Clinical Note */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              🔒 Privacy &amp; Data Security. Your health evaluations remain private and protected on your device.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  keyboardContainer: {
    flex: 1
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 28
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16
  },
  backButtonText: {
    color: Colors.primary.amber,
    fontSize: 14,
    fontWeight: '600'
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary.glow,
    borderWidth: 2,
    borderColor: Colors.primary.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  icon: {
    fontSize: 34
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.slate.textMain,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: Colors.slate.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16
  },
  form: {
    width: '100%',
    gap: 16
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
    padding: 12
  },
  errorText: {
    color: Colors.clinical.highRisk,
    fontSize: 13,
    textAlign: 'center'
  },
  inputGroup: {
    gap: 6
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    color: Colors.slate.textMain,
    fontSize: 13,
    fontWeight: '600'
  },
  forgotText: {
    color: Colors.primary.amber,
    fontSize: 12,
    fontWeight: '500'
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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.slate.card,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    borderRadius: 12
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.slate.textMain,
    fontSize: 15
  },
  eyeButton: {
    paddingHorizontal: 14
  },
  eyeText: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  loginButton: {
    backgroundColor: Colors.primary.amber,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    opacity: 0.6
  },
  loginButtonText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: '700'
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12
  },
  promptText: {
    color: Colors.slate.textMuted,
    fontSize: 13
  },
  signupLink: {
    color: Colors.primary.amber,
    fontSize: 13,
    fontWeight: '700'
  },
  disclaimerBox: {
    marginTop: 28,
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder
  },
  disclaimerText: {
    color: Colors.slate.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center'
  }
});
