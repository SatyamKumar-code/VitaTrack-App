import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { TokenStorage } from '../../../shared/storage/secureStore';
import { apiFetch } from '../../../shared/api/apiClient';
import {
  AssessmentPayload,
  AssessmentResponse
} from '../types/assessment.types';

export const AssessmentApi = {
  /**
   * Submit questionnaire responses to the backend
   */
  async submitAssessment(payload: AssessmentPayload): Promise<AssessmentResponse> {
    const res = await apiFetch(`/assessments`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) {
      const errMsg =
        json.error?.message ||
        (json.error?.details && json.error.details.map((d: any) => d.message).join(', ')) ||
        'Failed to submit assessment.';
      throw new Error(errMsg);
    }

    return json.data;
  },

  /**
   * Retrieve latest assessment record for the user
   */
  async getLatestAssessment(): Promise<any | null> {
    const res = await apiFetch(`/assessments/latest`, {
      method: 'GET'
    });

    if (res.status === 404 || res.status === 401) return null;

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Failed to retrieve latest assessment.');
    }

    return json.data;
  },

  /**
   * Retrieve paginated history of assessments
   */
  async getAssessmentHistory(page = 1, limit = 10): Promise<any> {
    const res = await apiFetch(`/assessments/history?page=${page}&limit=${limit}`, {
      method: 'GET'
    });

    if (res.status === 401) return { data: [], pagination: { total: 0, page: 1, pages: 1 } };

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Failed to retrieve assessment history.');
    }

    return json;
  }
};
