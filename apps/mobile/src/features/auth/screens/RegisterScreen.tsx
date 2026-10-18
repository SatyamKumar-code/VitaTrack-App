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
import { HealthProfileStorage } from '../../../shared/storage/secureStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1996-05-20');
  const [biologicalSex, setBiologicalSex] = useState<'male' | 'female' | 'other'>('female');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please provide your name, email, and a secure password.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const registeredUser = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        dateOfBirth,
        biologicalSex
      });

      // Mark health profile as incomplete so checkup prompts user if skipped
      await HealthProfileStorage.setIncomplete(registeredUser?.id);

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
        } catch {
          // Graceful non-blocking fallback
        }
      }

      // Prompt to configure health profile with Skip option
      Alert.alert(
        'Setup Health Profile',
        'Account created! Would you like to set your Skin Type and Dietary Orientation now for accurate checkup calculations?',
        [
          {
            text: 'Skip for Now',
            style: 'cancel',
            onPress: () => router.replace('/')
          },
          {
            text: 'Set Up Now',
            style: 'default',
            onPress: () => router.replace('/profile')
          }
        ],
        { cancelable: false }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setErrorMessage(msg);
      Alert.alert('Registration Error', msg);
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>&larr; Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Set up your profile to calibrate personalized Vitamin D screening and safe solar limits
            </Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Account Credentials */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Account Credentials</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane Doe"
                placeholderTextColor={Colors.slate.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

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
              <Text style={styles.label}>Password (min 8 chars, 1 number)</Text>
              <TextInput
                style={styles.input}
                placeholder="SecurePassword123!"
                placeholderTextColor={Colors.slate.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Demographic Baseline */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Demographic Baseline</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="1996-05-20"
                placeholderTextColor={Colors.slate.textMuted}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Biological Sex</Text>
              <View style={styles.sexRow}>
                {(['female', 'male', 'other'] as const).map((sex) => (
                  <TouchableOpacity
                    key={sex}
                    style={[styles.sexButton, biologicalSex === sex && styles.selectedSexButton]}
                    onPress={() => setBiologicalSex(sex)}
                  >
                    <Text
                      style={[
                        styles.sexButtonText,
                        biologicalSex === sex && styles.selectedSexButtonText
                      ]}
                    >
                      {sex.charAt(0).toUpperCase() + sex.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0B0F19" />
            ) : (
              <Text style={styles.submitButtonText}>Create Account &rarr;</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>Already registered? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
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
    paddingBottom: 48
  },
  backButton: {
    marginBottom: 16
  },
  backButtonText: {
    color: Colors.primary.amber,
    fontSize: 14,
    fontWeight: '600'
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.slate.textMain,
    marginBottom: 6
  },
  subtitle: {
    fontSize: 14,
    color: Colors.slate.textMuted,
    lineHeight: 20
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    color: Colors.clinical.highRisk,
    fontSize: 13,
    textAlign: 'center'
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.amber,
    marginBottom: 4
  },
  sectionHint: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 17,
    marginBottom: 12
  },
  inputGroup: {
    marginBottom: 14
  },
  label: {
    color: Colors.slate.textMain,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6
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
  sexRow: {
    flexDirection: 'row',
    gap: 10
  },
  sexButton: {
    flex: 1,
    backgroundColor: Colors.slate.card,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  selectedSexButton: {
    borderColor: Colors.primary.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.12)'
  },
  sexButtonText: {
    color: Colors.slate.textMuted,
    fontSize: 14,
    fontWeight: '600'
  },
  selectedSexButtonText: {
    color: Colors.primary.amber
  },
  cardList: {
    gap: 10
  },
  selectorCard: {
    backgroundColor: Colors.slate.card,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    borderRadius: 12,
    padding: 14
  },
  selectedCard: {
    borderColor: Colors.primary.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.08)'
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  cardTitle: {
    color: Colors.slate.textMain,
    fontSize: 15,
    fontWeight: '700'
  },
  selectedCardTitle: {
    color: Colors.primary.amber
  },
  cardDesc: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    lineHeight: 16
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.slate.cardBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedRadioCircle: {
    borderColor: Colors.primary.amber
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary.amber
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagBadge: {
    backgroundColor: Colors.slate.card,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  selectedTagBadge: {
    borderColor: Colors.clinical.teal,
    backgroundColor: 'rgba(13, 148, 136, 0.15)'
  },
  tagText: {
    color: Colors.slate.textMuted,
    fontSize: 13,
    fontWeight: '500'
  },
  selectedTagText: {
    color: Colors.clinical.teal,
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: Colors.primary.amber,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12
  },
  buttonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: '700'
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16
  },
  promptText: {
    color: Colors.slate.textMuted,
    fontSize: 13
  },
  loginLink: {
    color: Colors.primary.amber,
    fontSize: 13,
    fontWeight: '700'
  }
});
