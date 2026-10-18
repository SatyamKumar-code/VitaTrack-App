import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth/context/AuthContext';
import { Colors } from '../../../shared/theme/colors';
import { getFriendlyErrorMessage } from '../../../shared/utils/errorMasking';
import { HealthProfileStorage } from '../../../shared/storage/secureStore';

const SKIN_TYPES = [
  { id: 'type_3', label: 'Normal Skin', emoji: '✨', desc: 'Balanced, smooth texture, neither too dry nor too oily' },
  { id: 'type_5', label: 'Oily Skin', emoji: '💧', desc: 'Excess shine, enlarged pores, prone to oiliness' },
  { id: 'type_2', label: 'Dry Skin', emoji: '🌵', desc: 'Feels tight, rough or flaky, needs extra hydration' },
  { id: 'type_1', label: 'Sensitive Skin', emoji: '🌸', desc: 'Easily irritated, prone to redness or fast reactions' },
  { id: 'type_4', label: 'Combination Skin', emoji: '⚖️', desc: 'Oily T-zone (forehead/nose) and dry or normal cheeks' }
];

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', desc: 'Plant-based foods, dairy, pulses, grains & nuts' },
  { id: 'omnivore', label: 'Non-Vegetarian', desc: 'Includes poultry, fish, meat, eggs & dairy' }
];

const MEDICAL_CONDITIONS = [
  { id: 'celiac', label: 'Celiac Disease' },
  { id: 'crohns', label: 'Crohn’s / IBD' },
  { id: 'malabsorption', label: 'Malabsorption Syndrome' },
  { id: 'kidney_disease', label: 'Chronic Kidney Disease' },
  { id: 'obesity', label: 'High BMI (Obesity)' }
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, logout, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '1995-01-01'
  );
  const [biologicalSex, setBiologicalSex] = useState<'male' | 'female' | 'other'>(
    user?.biologicalSex || 'female'
  );
  const [skinType, setSkinType] = useState<string>(user?.skinType || 'type_3');
  const [dietaryPreference, setDietaryPreference] = useState<string>(
    user?.dietaryPreference || 'omnivore'
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    user?.medicalConditions || []
  );

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (user) {
        setFullName(user.fullName || '');
        if (user.dateOfBirth) {
          setDateOfBirth(new Date(user.dateOfBirth).toISOString().split('T')[0]);
        }
        if (user.biologicalSex) {
          setBiologicalSex(user.biologicalSex);
        }
        if (user.skinType) {
          setSkinType(user.skinType);
        }
        if (user.dietaryPreference) {
          setDietaryPreference(user.dietaryPreference);
        }
        if (user.medicalConditions) {
          setSelectedConditions(user.medicalConditions);
        }
      } else {
        // For guest user, load locally stored checkup options if already configured
        const saved = await HealthProfileStorage.getHealthProfile();
        if (saved) {
          if (saved.skinType) setSkinType(saved.skinType);
          if (saved.dietaryPreference) setDietaryPreference(saved.dietaryPreference);
          if (saved.medicalConditions) setSelectedConditions(saved.medicalConditions);
        }
      }
    }
    loadData();
  }, [user]);

  const toggleCondition = (condId: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condId) ? prev.filter((id) => id !== condId) : [...prev, condId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      if (user) {
        await updateProfile({
          ...(fullName.trim() ? { fullName: fullName.trim() } : {}),
          dateOfBirth,
          biologicalSex,
          skinType: skinType as any,
          dietaryPreference: dietaryPreference as any,
          medicalConditions: selectedConditions
        });
        await HealthProfileStorage.saveHealthProfile(
          {
            skinType,
            dietaryPreference,
            medicalConditions: selectedConditions
          },
          user.id
        );
      } else {
        // Guest user: save checkup options locally
        await HealthProfileStorage.saveHealthProfile({
          skinType,
          dietaryPreference,
          medicalConditions: selectedConditions
        });
      }

      setStatusMessage('Checkup health profile saved successfully! Ready for checkup.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      const msg = getFriendlyErrorMessage(err);
      Alert.alert('Save Failed', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Are you sure you want to log out of VitaTrack?') : true;
      if (confirmed) {
        await logout();
        router.replace('/');
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to log out of VitaTrack?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.homeLink}>
            <Text style={styles.homeLinkText}>&larr; Home</Text>
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {fullName ? fullName.charAt(0).toUpperCase() : 'G'}
            </Text>
          </View>
          <Text style={styles.userName}>{user ? (fullName || 'Patient Profile') : 'Guest Explorer'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Exploring without account'}</Text>
          <View
            style={[
              styles.roleBadge,
              !user && {
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderColor: 'rgba(245, 158, 11, 0.35)'
              }
            ]}
          >
            <Text
              style={[
                styles.roleBadgeText,
                !user && { color: Colors.primary.amber }
              ]}
            >
              {user?.role === 'admin'
                ? 'System Administrator'
                : user
                ? 'Verified Patient Account'
                : 'Guest Exploration (Zero Cloud Storage)'}
            </Text>
          </View>
        </View>

        {!user && (
          <View
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: 'rgba(245, 158, 11, 0.35)',
              padding: 16,
              marginBottom: 20
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '800',
                color: Colors.slate.textMain,
                marginBottom: 4
              }}
            >
              You are exploring as a Guest
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: Colors.slate.textMuted,
                lineHeight: 18,
                marginBottom: 12
              }}
            >
              Create an account or sign in to save your assessments, unlock longitudinal trends, and enable cloud synchronization.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors.primary.amber,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center'
                }}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0B0F19' }}>
                  Sign In &rarr;
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(30, 41, 59, 0.80)',
                  borderWidth: 1,
                  borderColor: Colors.slate.cardBorder,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center'
                }}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.slate.textMain }}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {statusMessage ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{statusMessage}</Text>
          </View>
        ) : null}

        {/* Demographic Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Demographic Baseline</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor={Colors.slate.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.slate.textMuted}
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

        {/* Skin Type */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Skin Type</Text>
          <Text style={styles.sectionDesc}>
            Select your skin type to personalize your daily sunlight and wellness guidance.
          </Text>

          <View style={styles.selectorGrid}>
            {SKIN_TYPES.map((type) => {
              const isSelected =
                skinType === type.id ||
                (type.id === 'type_5' && skinType === 'type_6');
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
                  onPress={() => setSkinType(type.id)}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 18 }}>{type.emoji}</Text>
                      <Text style={[styles.optionTitle, isSelected && styles.selectedOptionTitle]}>
                        {type.label}
                      </Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.selectedRadioCircle]}>
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>
                  </View>
                  <Text style={styles.optionDesc}>{type.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dietary Orientation */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Dietary Orientation</Text>
          <View style={styles.selectorGrid}>
            {DIETARY_OPTIONS.map((diet) => {
              const isSelected =
                dietaryPreference === diet.id ||
                (diet.id === 'vegetarian' && dietaryPreference === 'vegan') ||
                (diet.id === 'omnivore' && dietaryPreference === 'pescatarian');
              return (
                <TouchableOpacity
                  key={diet.id}
                  style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
                  onPress={() => setDietaryPreference(diet.id)}
                >
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.optionTitle, isSelected && styles.selectedOptionTitle]}>
                      {diet.label}
                    </Text>
                    <View style={[styles.radioCircle, isSelected && styles.selectedRadioCircle]}>
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>
                  </View>
                  <Text style={styles.optionDesc}>{diet.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Medical History Conditions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Medical History Flags</Text>
          <Text style={styles.sectionDesc}>
            Select conditions that may impair Vitamin D absorption or metabolism.
          </Text>

          <View style={styles.badgeRow}>
            {MEDICAL_CONDITIONS.map((cond) => {
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

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.remindersButton}
            onPress={() => router.push('/reminders')}
          >
            <Text style={styles.remindersButtonText}>🔔 Notification &amp; Reminder Settings &rarr;</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#0B0F19" />
            ) : (
              <Text style={styles.saveButtonText}>Save Checkup Health Profile</Text>
            )}
          </TouchableOpacity>

          {user ? (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Sign Out of VitaTrack</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyNoteText}>
            🔒 VitaTrack operates under strict Zero-PHI privacy boundaries. Your clinical baseline is encrypted and never accessible to administrative telemetry.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  container: {
    padding: 20,
    paddingBottom: 48
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  homeLink: {
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  homeLinkText: {
    color: Colors.primary.amber,
    fontSize: 14,
    fontWeight: '600'
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.glow,
    borderWidth: 2,
    borderColor: Colors.primary.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary.amber
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.slate.textMain,
    marginBottom: 4
  },
  userEmail: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    marginBottom: 8
  },
  roleBadge: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  roleBadgeText: {
    color: Colors.clinical.teal,
    fontSize: 12,
    fontWeight: '600'
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center'
  },
  successBannerText: {
    color: Colors.clinical.lowRisk,
    fontSize: 14,
    fontWeight: '600'
  },
  sectionCard: {
    backgroundColor: Colors.slate.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.amber,
    marginBottom: 4
  },
  sectionDesc: {
    fontSize: 12,
    color: Colors.slate.textMuted,
    lineHeight: 16,
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
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.slate.textMain,
    fontSize: 14
  },
  sexRow: {
    flexDirection: 'row',
    gap: 8
  },
  sexButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  },
  selectedSexButton: {
    borderColor: Colors.primary.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.15)'
  },
  sexButtonText: {
    color: Colors.slate.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  selectedSexButtonText: {
    color: Colors.primary.amber
  },
  selectorGrid: {
    gap: 10
  },
  optionCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    borderRadius: 10,
    padding: 12
  },
  selectedOptionCard: {
    borderColor: Colors.primary.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.1)'
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  optionTitle: {
    color: Colors.slate.textMain,
    fontSize: 14,
    fontWeight: '700'
  },
  selectedOptionTitle: {
    color: Colors.primary.amber
  },
  optionDesc: {
    color: Colors.slate.textMuted,
    fontSize: 11,
    lineHeight: 15
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.slate.cardBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedRadioCircle: {
    borderColor: Colors.primary.amber
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.amber
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagBadge: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: Colors.slate.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  selectedTagBadge: {
    borderColor: Colors.clinical.teal,
    backgroundColor: 'rgba(13, 148, 136, 0.15)'
  },
  tagText: {
    color: Colors.slate.textMuted,
    fontSize: 12,
    fontWeight: '500'
  },
  selectedTagText: {
    color: Colors.clinical.teal,
    fontWeight: '600'
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8
  },
  remindersButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  remindersButtonText: {
    color: '#818CF8',
    fontSize: 14,
    fontWeight: '700'
  },
  saveButton: {
    backgroundColor: Colors.primary.amber,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: '700'
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  logoutButtonText: {
    color: Colors.clinical.highRisk,
    fontSize: 14,
    fontWeight: '600'
  },
  privacyNote: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.5)'
  },
  privacyNoteText: {
    color: Colors.slate.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16
  }
});
