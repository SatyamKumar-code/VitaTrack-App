import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AssessmentDraft } from '../types/assessment.types';

const DRAFT_STORAGE_KEY = 'vitasun_assessment_draft';

// Fallback in-memory storage for web/node environments
let inMemoryDraft: string | null = null;

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    inMemoryDraft = value;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore if localStorage unavailable
    }
    return;
  }
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK
  });
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return (
      inMemoryDraft ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null)
    );
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    inMemoryDraft = null;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const DraftStorage = {
  /**
   * Auto-save partial survey progress to local device storage (TASK-P3-06)
   */
  async saveDraft(draft: AssessmentDraft): Promise<void> {
    try {
      const payload: AssessmentDraft = {
        ...draft,
        lastSavedAt: new Date().toISOString()
      };
      await setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to auto-save assessment draft to local storage:', err);
    }
  },

  /**
   * Load partial survey progress if interrupted
   */
  async loadDraft(): Promise<AssessmentDraft | null> {
    try {
      const raw = await getItem(DRAFT_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AssessmentDraft;
    } catch {
      return null;
    }
  },

  /**
   * Clear draft after successful submission or explicit restart
   */
  async clearDraft(): Promise<void> {
    try {
      await deleteItem(DRAFT_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear assessment draft:', err);
    }
  }
};
