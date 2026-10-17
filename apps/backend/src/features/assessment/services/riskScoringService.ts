import { AssessmentSubmissionInput } from '../validators/assessment.validation';
import {
  AssessmentScoringResults,
  AssessmentSubScores
} from '../types/assessment.types';
import {
  DeterministicScoringEngine,
  DemographicContext
} from '../scoring/deterministicScoring.engine';
import { SCORING_WEIGHTS } from '../scoring/scoringRules.config';

export class RiskScoringService {
  /**
   * Primary entry point for calculating deterministic risk scores
   */
  public static calculateRiskScore(
    input: AssessmentSubmissionInput,
    demographics?: DemographicContext
  ): {
    results: AssessmentScoringResults;
    primaryContributors: string[];
  } {
    return DeterministicScoringEngine.computeScore(input, demographics);
  }

  /**
   * Helper to retrieve sub-score breakdown directly
   */
  public static getSubScores(
    input: AssessmentSubmissionInput,
    demographics?: DemographicContext
  ): AssessmentSubScores {
    const { results } = this.calculateRiskScore(input, demographics);
    return results.subScores;
  }

  /**
   * Retrieve scoring weight rules configuration
   */
  public static getScoringWeights() {
    return SCORING_WEIGHTS;
  }
}
