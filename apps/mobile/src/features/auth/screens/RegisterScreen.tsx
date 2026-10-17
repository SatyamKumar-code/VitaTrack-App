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

const SKIN_TYPES = [
  { id: 'type_1', label: 'Type I', desc: 'Pale white skin, burns easily, never tans' },
  { id: 'type_2', label: 'Type II', desc: 'Fair skin, burns easily, tans minimally' },
  { id: 'type_3', label: 'Type III', desc: 'Medium white/olive, burns moderately, tans gradually' },
  { id: 'type_4', label: 'Type IV', desc: 'Olive skin, rarely burns, tans easily' },
  { id: 'type_5', label: 'Type V', desc: 'Brown skin, very rarely burns, tans profusely' },
  { id: 'type_6', label: 'Type VI', desc: 'Deeply pigmented dark skin, never burns' }
];

const DIETARY_OPTIONS = [
  { id: 'omnivore', label: 'Omnivore', desc: 'Fish, meat, dairy, eggs & plants' },
  { id: 'pescatarian', label: 'Pescatarian', desc: 'Fish, dairy, eggs & plants' },
  { id: 'vegetarian', label: 'Vegetarian', desc: 'Dairy, eggs & plants (no meat/fish)' },
  { id: 'vegan', label: 'Vegan', desc: 'Exclusively plant-based' }
];

const COMMON_CONDITIONS = [
  { id: 'celiac', label: 'Celiac Disease' },
  { id: 'crohns', label: 'Crohn’s / IBD' },
  { id: 'malabsorption', label: 'Malabsorption' },
  { id: 'kidney_disease', label: 'Kidney Disease' },
  { id: 'obesity', label: 'High BMI (Obesity)' }
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1996-05-20');
  const [biologicalSex, setBiologicalSex] = useState<'male' | 'female' | 'other'>('female');
  const [skinType, setSkinType] = useState('type_3');
  const [dietaryPreference, setDietaryPreference] = useState('omnivore');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleCondition = (condId: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condId) ? prev.filter((id) => id !== condId) : [...prev, condId]
    );
  };

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
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        dateOfBirth,
        biologicalSex,
        skinType,
        dietaryPreference,
        medicalConditions: selectedConditions
      });
      router.replace('/profile');
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

          {/* Fitzpatrick Skin Phototype */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Fitzpatrick Skin Phototype</Text>
            <Text style={styles.sectionHint}>
              Crucial for calculating safe ultraviolet (UV) exposure minutes without causing erythema/sunburn.
            </Text>

            <View style={styles.cardList}>
              {SKIN_TYPES.map((type) => {
                const isSelected = skinType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.selectorCard, isSelected && styles.selectedCard]}
                    onPress={() => setSkinType(type.id)}
                  >
                    <View style={styles.cardHeaderRow}>
                      <Text style={[styles.cardTitle, isSelected && styles.selectedCardTitle]}>
                        {type.label}
                      </Text>
                      <View style={[styles.radioCircle, isSelected && styles.selectedRadioCircle]}>
                        {isSelected ? <View style={styles.radioInner} /> : null}
                      </View>
                    </View>
                    <Text style={styles.cardDesc}>{type.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Dietary Preference */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Dietary Orientation</Text>
            <View style={styles.cardList}>
              {DIETARY_OPTIONS.map((diet) => {
                const isSelected = dietaryPreference === diet.id;
                return (
                  <TouchableOpacity
                    key={diet.id}
                    style={[styles.selectorCard, isSelected && styles.selectedCard]}
                    onPress={() => setDietaryPreference(diet.id)}
                  >
                    <View style={styles.cardHeaderRow}>
                      <Text style={[styles.cardTitle, isSelected && styles.selectedCardTitle]}>
                        {diet.label}
                      </Text>
                      <View style={[styles.radioCircle, isSelected && styles.selectedRadioCircle]}>
                        {isSelected ? <View style={styles.radioInner} /> : null}
                      </View>
                    </View>
                    <Text style={styles.cardDesc}>{diet.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Medical History Conditions */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Relevant Medical Flags (Optional)</Text>
            <Text style={styles.sectionHint}>
              Certain gastrointestinal or metabolic factors reduce intestinal absorption of Vitamin D.
            </Text>

            <View style={styles.badgeRow}>
              {COMMON_CONDITIONS.map((cond) => {
                const isChecked = selectedConditions.includes(cond.id);
                return (
                  <TouchableOpacity
                    key={cond.id}
                    style={[styles.tagBadge, isChecked && styles.selectedTagBadge]}
                    onPress={() => toggleCondition(cond.id)}
                  >
                    <Text style={[styles.tagText, isChecked && styles.selectedTagText]}>
                      {isChecked ? '✓ ' : '+ '}
                      {cond.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
              <Text style={styles.submitButtonText}>Create Account &amp; Save Profile</Text>
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
