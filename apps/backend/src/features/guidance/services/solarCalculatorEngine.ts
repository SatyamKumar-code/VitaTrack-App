import { SkinType, SunlightGuidance } from '../types/guidance.types';

interface PhototypeConfig {
  name: string;
  recommendedMinutes: number;
  timerDefaultMinutes: number;
  description: string;
  safeGuidance: string;
}

const PHOTOTYPE_MATRIX: Record<SkinType, PhototypeConfig> = {
  type_1: {
    name: 'Fitzpatrick Type I (Very Fair / Pale Ivory)',
    recommendedMinutes: 10,
    timerDefaultMinutes: 10,
    description:
      'Always burns severely, never tans. Has very low melanin density and high susceptibility to photochemical erythema and DNA photodamage.',
    safeGuidance:
      'Expose arms and lower legs (approx. 20% body surface area) without sunscreen for strictly 8–10 minutes during mid-morning. Once the 10-minute timer alerts, immediately apply broad-spectrum SPF 30+ or relocate to covered shade.'
  },
  type_2: {
    name: 'Fitzpatrick Type II (Fair / Pale Caucasian)',
    recommendedMinutes: 12,
    timerDefaultMinutes: 12,
    description:
      'Usually burns easily, tans minimally with difficulty. Sensitive skin barrier requiring controlled solar exposure windows.',
    safeGuidance:
      'Expose forearms and lower legs uncovered for 10–12 minutes. Avoid midday peak hours (11:30 AM – 2:00 PM) when UV Index exceeds 7.'
  },
  type_3: {
    name: 'Fitzpatrick Type III (Medium / Cream White / Light Olive)',
    recommendedMinutes: 18,
    timerDefaultMinutes: 18,
    description:
      'Burns moderately on initial exposure, gradually tans to light brown. Balanced cutaneous melanin synthesis capacity.',
    safeGuidance:
      'Expose forearms and legs uncovered for 15–20 minutes between 10:00 AM – 11:30 AM or 2:30 PM – 3:30 PM. Apply SPF 30+ if remaining outdoors beyond 20 minutes.'
  },
  type_4: {
    name: 'Fitzpatrick Type IV (Olive / Moderate Brown / Mediterranean / East Asian)',
    recommendedMinutes: 22,
    timerDefaultMinutes: 20,
    description:
      'Burns minimally, tans readily and deeply. Increased eumelanin offers natural protection against erythema while moderately attenuating UVB penetration.',
    safeGuidance:
      'Aim for 20–25 minutes of direct sunlight on exposed arms and legs. Optimal synthesis occurs mid-morning when UV Index is between 3 and 6.'
  },
  type_5: {
    name: 'Fitzpatrick Type V (Brown / Dark Brown / South Asian / Middle Eastern / Latino)',
    recommendedMinutes: 30,
    timerDefaultMinutes: 30,
    description:
      'Rarely burns, tans profusely to dark brown. Elevated epidermal eumelanin absorbs 50%–70% of incident UVB photons, requiring longer solar exposure.',
    safeGuidance:
      'Dedicate 25–35 minutes of daily outdoor exposure with uncovered forearms and legs. Given higher natural photoprotection, erythema risk is low, but consistent duration is essential to stimulate 7-DHC photolysis.'
  },
  type_6: {
    name: 'Fitzpatrick Type VI (Deeply Pigmented / Dark Brown to Black / African)',
    recommendedMinutes: 38,
    timerDefaultMinutes: 35,
    description:
      'Never burns, deeply pigmented. Dense epidermal eumelanin absorbs over 85%–90% of incident UVB photons, significantly protecting against skin cancers but necessitating extended solar exposure or supplement co-strategies.',
    safeGuidance:
      'Expose arms, legs, and face for 30–40 minutes daily outdoors during moderate-to-high solar zenith angles. Because melanin strongly filters UVB, combine outdoor time with bioavailable dietary and supplement sources.'
  }
};

export class SolarCalculatorEngine {
  /**
   * Calculates safe sunlight exposure parameters based on Fitzpatrick phototype and conservative UV guidelines.
   */
  public static calculateSunlightGuidance(
    skinType: SkinType = 'type_3'
  ): SunlightGuidance {
    const config = PHOTOTYPE_MATRIX[skinType] || PHOTOTYPE_MATRIX.type_3;

    return {
      skinType,
      skinTypeDescription: config.name,
      recommendedDailyMinutes: config.recommendedMinutes,
      optimalWindow: '10:00 AM – 11:30 AM or 2:30 PM – 3:30 PM',
      safeExposureGuidance: config.safeGuidance,
      uvThresholdNotice:
        'Avoid prolonged uncovered exposure during peak midday periods when the local UV Index reaches 8 or higher (Very High / Extreme). Solar synthesis is maximized at UV Index 3–6 with minimal thermal stress.',
      sunscreenAdvice:
        'Broad-spectrum sunscreen (SPF 30+) blocks approximately 95%–98% of cutaneous UVB synthesis. Allow your personalized uncovered window first, then apply SPF 30+ if you intend to remain outdoors for extended periods.',
      timerDefaultMinutes: config.timerDefaultMinutes
    };
  }
}
