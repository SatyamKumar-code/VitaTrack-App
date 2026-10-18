import { AssessmentDraft } from '../types/assessment.types';
import { AssessmentScoringResults } from '../../scoring/types/scoring.types';

export interface EphemeralGuestAssessment {
  draft: AssessmentDraft;
  results: AssessmentScoringResults;
  aiExplanation: string;
  timestamp: string;
}

/**
 * Strict Zero-DB Storage Policy:
 * Ephemeral in-memory store for guest assessments.
 * Under no circumstances are unauthenticated guest assessments sent to MongoDB.
 */
let inMemoryGuestAssessment: EphemeralGuestAssessment | null = null;

export class GuestStore {
  public static setGuestAssessment(assessment: EphemeralGuestAssessment): void {
    inMemoryGuestAssessment = assessment;
  }

  public static getGuestAssessment(): EphemeralGuestAssessment | null {
    return inMemoryGuestAssessment;
  }

  public static hasGuestAssessment(): boolean {
    return inMemoryGuestAssessment !== null;
  }

  public static clearGuestAssessment(): void {
    inMemoryGuestAssessment = null;
  }
}
