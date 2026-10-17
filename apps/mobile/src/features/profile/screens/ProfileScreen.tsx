import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth/context/AuthContext';
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
    }
  }, [user]);

  const toggleCondition = (condId: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condId) ? prev.filter((id) => id !== condId) : [...prev, condId]
    );
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      await updateProfile({
        fullName: fullName.trim(),
        dateOfBirth,
        biologicalSex,
        skinType: skinType as any,
        dietaryPreference: dietaryPreference as any,
        medicalConditions: selectedConditions
      });
      setStatusMessage('Profile updated successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      Alert.alert('Update Failed', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
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
              {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{fullName || 'Patient Profile'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'patient@example.com'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {user?.role === 'admin' ? 'System Administrator' : 'Verified Patient Account'}
            </Text>
          </View>
        </View>

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

        {/* Fitzpatrick Skin Phototype */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Fitzpatrick Skin Phototype</Text>
          <Text style={styles.sectionDesc}>
            Used to calibrate minimum erythemal dose (MED) and safe solar synthesis minutes.
          </Text>

          <View style={styles.selectorGrid}>
            {SKIN_TYPES.map((type) => {
              const isSelected = skinType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
                  onPress={() => setSkinType(type.id)}
                >
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.optionTitle, isSelected && styles.selectedOptionTitle]}>
                      {type.label}
                    </Text>
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
              const isSelected = dietaryPreference === diet.id;
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
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#0B0F19" />
            ) : (
              <Text style={styles.saveButtonText}>Save Profile Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out of VitaTrack</Text>
          </TouchableOpacity>
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
