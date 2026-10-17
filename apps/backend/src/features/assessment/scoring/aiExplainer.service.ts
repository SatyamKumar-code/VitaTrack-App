import {
  AssessmentAiExplanation,
  AssessmentScoringResults
} from '../types/assessment.types';
import { AssessmentSubmissionInput } from '../validators/assessment.validation';
import { DemographicContext } from './deterministicScoring.engine';
import { logger } from '../../../core/logger/logger';

export class AiExplainerService {
  private static readonly GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  /**
   * Generates patient-centered plain-language explanation of risk score.
   * Uses Google Gemini Flash API if GEMINI_API_KEY is configured;
   * seamlessly falls back to deterministic rule synthesis on failure/absence.
   */
  public static async generateExplanation(
    input: AssessmentSubmissionInput,
    results: AssessmentScoringResults,
    primaryContributors: string[],
    demographics?: DemographicContext
  ): Promise<AssessmentAiExplanation> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 0 && apiKey !== 'your_gemini_api_key_here') {
      try {
        const geminiResult = await this.callGeminiApi(
          apiKey,
          input,
          results,
          primaryContributors,
          demographics
        );
        if (geminiResult) {
          return geminiResult;
        }
      } catch (err: any) {
        logger.warn(
          `Gemini AI Explainer service invocation failed, falling back to rule synthesis: ${err?.message || err}`
        );
      }
    }

    // Deterministic fallback synthesis
    return this.synthesizeDeterministicExplanation(results, primaryContributors);
  }

  /**
   * Invokes Google Gemini API with zero-PHI sanitized clinical prompt
   */
  private static async callGeminiApi(
    apiKey: string,
    input: AssessmentSubmissionInput,
    results: AssessmentScoringResults,
    primaryContributors: string[],
    demographics?: DemographicContext
  ): Promise<AssessmentAiExplanation | null> {
    const prompt = this.constructSanitizedPrompt(
      input,
      results,
      primaryContributors,
      demographics
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    try {
      const response = await fetch(`${this.GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 350
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn(`Gemini API returned HTTP ${response.status}: ${response.statusText}`);
        return null;
      }

      const data: any = await response.json();
      const textContent =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        return null;
      }

      return this.parseGeminiResponse(textContent, results, primaryContributors);
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Constructs prompt adhering strictly to Zero-PHI and medical safety guardrails
   */
  private static constructSanitizedPrompt(
    input: AssessmentSubmissionInput,
    results: AssessmentScoringResults,
    primaryContributors: string[],
    demographics?: DemographicContext
  ): string {
    return `
You are an expert, empathetic clinical AI wellness assistant for VitaTrack, a Vitamin D risk assessment app.
Synthesize a plain-language explanation for a patient who just completed an assessment.

STRICT CLINICAL SAFETY RULES:
1. VitaTrack is an informational screening aid, NOT a diagnostic medical device. Do NOT make definitive medical diagnoses.
2. Emphasize that only laboratory serum 25-hydroxyvitamin D [25(OH)D] blood tests confirm clinical deficiency.
3. Keep the summary under 3 sentences: clear, empathetic, and constructive.
4. Output in valid JSON format ONLY with keys "summary" (string) and "keyContributors" (array of 2-4 strings).

ASSESSMENT RESULTS:
- Composite Risk Score: ${results.compositeScore}/100
- Stratified Tier: ${results.riskTier.toUpperCase()}
- Sub-Scores:
  - Symptom Severity Index: ${results.subScores.symptomScore}/45
  - Solar Insufficiency Index: ${results.subScores.solarDeficitScore}/25
  - Dietary Deficit Index: ${results.subScores.dietaryDeficitScore}/20
  - Biological Multiplier: ${results.subScores.medicalMultiplierScore}/10
- Reported Symptoms: Fatigue (${input.symptoms.fatigueLevel}), Bone Pain (${input.symptoms.bonePainLevel}), Muscle Weakness (${input.symptoms.muscleWeaknessLevel}), Frequent Infections (${input.symptoms.frequentInfections})
- Outdoor Sun: ${input.sunExposure.dailyMinutesOutdoors} min/day, Coverage (${input.sunExposure.clothingCoverage}), Sunscreen (${input.sunExposure.regularSunscreenSPF30})
- Dietary Habits: Fatty fish (${input.dietaryHabits.fattyFishServingsPerWeek}/wk), Fortified dairy (${input.dietaryHabits.fortifiedMilkServingsPerWeek}/wk), Egg yolks (${input.dietaryHabits.eggYolksPerWeek}/wk), Supplements (${input.dietaryHabits.takesVitaminDSupplement})
${demographics?.age ? `- Patient Age: ${demographics.age}` : ''}
${demographics?.skinType ? `- Skin Phototype: ${demographics.skinType}` : ''}

Output ONLY valid JSON without markdown fences.
`.trim();
  }

  /**
   * Safely parses JSON response from LLM, falling back to clean text extraction
   */
  private static parseGeminiResponse(
    rawText: string,
    results: AssessmentScoringResults,
    fallbackContributors: string[]
  ): AssessmentAiExplanation {
    try {
      // Remove possible markdown formatting e.g. ```json ... ```
      const cleaned = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      if (parsed.summary && Array.isArray(parsed.keyContributors)) {
        return {
          summary: String(parsed.summary),
          keyContributors: parsed.keyContributors.map((k: any) => String(k))
        };
      }
    } catch {
      // Fallback if model output was not strict JSON
    }

    return this.synthesizeDeterministicExplanation(results, fallbackContributors);
  }

  /**
   * Deterministic fallback explanation synthesis based on clinical rules
   */
  public static synthesizeDeterministicExplanation(
    results: AssessmentScoringResults,
    primaryContributors: string[]
  ): AssessmentAiExplanation {
    let summary = '';

    if (results.riskTier === 'high') {
      summary = `Your assessment indicates an elevated risk profile (Score: ${results.compositeScore}/100) primarily driven by reported symptom severity, minimal UV-B exposure, and nutritional gaps. A clinical blood serum test and doctor consultation are strongly recommended.`;
    } else if (results.riskTier === 'moderate') {
      summary = `Your assessment reflects a moderate risk profile (Score: ${results.compositeScore}/100). Limited midday sunlight exposure and moderate symptom markers suggest borderline sufficiency. Targeted lifestyle adjustments and medical review are advised.`;
    } else {
      summary = `Your assessment reflects a low risk profile (Score: ${results.compositeScore}/100). Your reported sunlight exposure and nutrient habits effectively support healthy Vitamin D equilibrium. Continue safe solar practices.`;
    }

    return {
      summary,
      keyContributors:
        primaryContributors.length > 0
          ? primaryContributors
          : ['Healthy lifestyle and balanced dietary intake maintain optimal equilibrium.']
    };
  }
}
