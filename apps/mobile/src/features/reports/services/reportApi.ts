import { TokenStorage } from '../../../shared/storage/secureStore';
import { apiFetch } from '../../../shared/api/apiClient';
import { HistoryApiResponse, AssessmentHistoryItem } from '../types/report.types';

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
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const res = await apiFetch(`/assessments/history?${queryParams.toString()}`, {
      method: 'GET'
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
    const res = await apiFetch(`/assessments/${id}`, {
      method: 'GET'
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
