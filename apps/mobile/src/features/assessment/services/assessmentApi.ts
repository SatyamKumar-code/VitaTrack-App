import { Platform } from 'react-native';
import { TokenStorage } from '../../../shared/storage/secureStore';
import {
  AssessmentPayload,
  AssessmentResponse
} from '../types/assessment.types';

const DEFAULT_API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000/api/v1' : 'http://localhost:4000/api/v1';

export const AssessmentApi = {
  /**
   * Submit questionnaire responses to the backend
   */
  async submitAssessment(payload: AssessmentPayload): Promise<AssessmentResponse> {
    const token = await TokenStorage.getAccessToken();
    if (!token) {
      throw new Error('Authentication required. Please sign in to submit your assessment.');
    }

    const res = await fetch(`${DEFAULT_API_BASE}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
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
    const token = await TokenStorage.getAccessToken();
    if (!token) return null;

    const res = await fetch(`${DEFAULT_API_BASE}/assessments/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 404) return null;

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
    const token = await TokenStorage.getAccessToken();
    if (!token) return { data: [], pagination: { total: 0, page: 1, pages: 1 } };

    const res = await fetch(`${DEFAULT_API_BASE}/assessments/history?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Failed to retrieve assessment history.');
    }

    return json;
  }
};
