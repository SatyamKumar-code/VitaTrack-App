import Constants from 'expo-constants';
import { TokenStorage } from '../../../shared/storage/secureStore';
import { HistoryApiResponse, AssessmentHistoryItem } from '../types/report.types';

// Dynamically resolves host IP so physical devices on Expo Go can communicate with backend
const hostUri = Constants.expoConfig?.hostUri;
const host = hostUri ? hostUri.split(':')[0] : 'localhost';
const DEFAULT_API_BASE =
  process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes('localhost')
    ? process.env.EXPO_PUBLIC_API_URL
    : `http://${host}:4000/api/v1`;

export interface FetchHistoryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export const ReportApi = {
  /**
   * Retrieve chronological assessment history with pagination, filters, and summary metrics
   * Reference: TASK-P6-01
   */
  async getHistory(params: FetchHistoryParams = {}): Promise<HistoryApiResponse> {
    const token = await TokenStorage.getAccessToken();
    if (!token) {
      throw new Error('Authentication required. Please sign in to view assessment history.');
    }

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const url = `${DEFAULT_API_BASE}/assessments/history?${queryParams.toString()}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const json = await res.json();
    if (!res.ok) {
      const errMsg = json.error?.message || 'Failed to retrieve assessment history.';
      throw new Error(errMsg);
    }

    return json;
  },

  /**
   * Retrieve single assessment record by ID
   */
  async getAssessmentById(id: string): Promise<AssessmentHistoryItem> {
    const token = await TokenStorage.getAccessToken();
    if (!token) {
      throw new Error('Authentication required.');
    }

    const res = await fetch(`${DEFAULT_API_BASE}/assessments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const json = await res.json();
    if (!res.ok) {
      const errMsg = json.error?.message || 'Failed to retrieve assessment record.';
      throw new Error(errMsg);
    }

    return {
      id: json.data.assessmentId,
      date: json.data.timestamp,
      compositeScore: json.data.results.compositeScore,
      riskTier: json.data.results.riskTier,
      doctorAlert: json.data.results.doctorConsultationRequired,
      consultationUrgency: json.data.results.consultationUrgency,
      subScores: json.data.results.subScores,
      symptoms: json.data.symptoms,
      sunExposure: json.data.sunExposure,
      dietaryHabits: json.data.dietaryHabits,
      aiExplanation: json.data.aiExplanation
    };
  }
};
