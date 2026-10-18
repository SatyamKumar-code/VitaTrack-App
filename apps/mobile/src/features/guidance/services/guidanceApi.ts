import { apiFetch } from '../../../shared/api/apiClient';
import {
  DietaryPreference,
  SkinType,
  PersonalizedGuidancePayload,
  EducationalArticle
} from '../types/guidance.types';

export const GuidanceApi = {
  /**
   * Fetch current personalized guidance, with optional overrides for exploring diet or phototypes
   */
  async fetchCurrentGuidance(
    diet?: DietaryPreference,
    skinType?: SkinType
  ): Promise<PersonalizedGuidancePayload> {
    const queryParams: string[] = [];
    if (diet) queryParams.push(`diet=${diet}`);
    if (skinType) queryParams.push(`skinType=${skinType}`);
    const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';

    try {
      const res = await apiFetch(`/recommendations/current${queryString}`, {
        method: 'GET'
      });

      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    } catch {
      // Return clinical fallback if backend is unreachable
      return GuidanceApi.getOfflineFallbackGuidance(diet, skinType);
    }
  },

  /**
   * Fetch educational article catalog
   */
  async fetchEducationalArticles(
    category?: 'synthesis' | 'clinical' | 'nutrition' | 'safety'
  ): Promise<EducationalArticle[]> {
    const query = category ? `?category=${category}` : '';
    try {
      const res = await apiFetch(`/recommendations/education${query}`, {
        method: 'GET'
      });

      if (!res.ok) {
        throw new Error(`Education API responded with status ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    } catch {
      return GuidanceApi.getOfflineFallbackArticles();
    }
  },

  /**
   * Safe offline fallback payload ensuring the UI never fails
   */
  getOfflineFallbackGuidance(
    diet: DietaryPreference = 'omnivore',
    skinType: SkinType = 'type_3'
  ): PersonalizedGuidancePayload {
    return {
      nutrition: {
        dietType: diet,
        targetDailyIU: '1,000 - 2,000 IU / day (dietary + safe solar synthesis)',
        priorityFoods: [
          {
            name: 'UV-Exposed Portobello Mushrooms',
            vitaminDContent: '400 - 800 IU',
            servingSize: '100g',
            category: 'Produce',
            bioavailabilityNote:
              'Synthesizes natural Ergocalciferol (D2). Sauté with moderate healthy fats.'
          },
          {
            name: 'Fortified Milk (Plant or Dairy)',
            vitaminDContent: '120 IU / glass',
            servingSize: '240 ml',
            category: diet === 'vegan' ? 'Plant-based' : 'Dairy',
            bioavailabilityNote:
              'Bio-equivalent vitamin D paired with dietary calcium.'
          },
          {
            name:
              diet === 'omnivore'
                ? 'Wild-Caught Sockeye Salmon'
                : 'Lichen-Derived Vegan Cholecalciferol (D3)',
            vitaminDContent: diet === 'omnivore' ? '600 - 900 IU' : '1000 IU / dose',
            servingSize: diet === 'omnivore' ? '100g fillet' : 'Daily dropper',
            category: diet === 'omnivore' ? 'Seafood' : 'Plant-based',
            bioavailabilityNote:
              'Dense bioavailable Vitamin D3 for optimal cellular absorption.'
          }
        ],
        coFactors: [
          'Magnesium (350–420 mg/day): Essential enzyme activator. Sources: pumpkin seeds, spinach, almonds.',
          'Vitamin K2 (MK-7): Directs calcium into bone and prevents arterial calcification. Sources: natto, fermented hard cheeses.'
        ],
        absorptionTips:
          'Vitamin D is fat-soluble. Always consume nutrient-rich meals with healthy fats (extra virgin olive oil, nuts, or avocado) to optimize intestinal absorption.',
        supplementGuidance: {
          recommended: true,
          reason:
            'Lifestyle and seasonal limitations often necessitate targeted nutritional support.',
          caution:
            'Never exceed 4,000 IU daily from unprescribed supplements without consulting a doctor.'
        }
      },
      sunlight: {
        skinType,
        skinTypeDescription: 'Medium / Cream White (Fitzpatrick Type III)',
        recommendedDailyMinutes: 18,
        optimalWindow: '10:00 AM – 11:30 AM or 2:30 PM – 3:30 PM',
        safeExposureGuidance:
          'Expose forearms and lower legs without sunscreen for 15–20 minutes mid-morning. Apply SPF 30+ if staying outdoors longer.',
        uvThresholdNotice:
          'Avoid direct uncovered exposure when UV Index exceeds 8.',
        sunscreenAdvice:
          'Broad-spectrum SPF 30+ filters 97% of UVB. Enjoy your safe uncovered window first.',
        timerDefaultMinutes: 18
      },
      exercise: {
        focus:
          'Mechanotransductive Weight-Bearing & Osteogenic Bone Density Support',
        suggestions: [
          {
            id: 'ex-brisk-walk',
            name: 'Brisk Outdoor Solar Walk',
            category: 'Weight-Bearing',
            durationMinutes: 30,
            frequency: '4–5 days / week',
            difficulty: 'beginner',
            boneImpact:
              'Ground reaction forces stimulate osteoblast bone deposition at the femoral neck and lumbar spine.',
            instructions: [
              'Walk at a purposeful brisk pace in comfortable sunlight.',
              'Maintain upright spine and rhythmic arm swings.'
            ],
            outdoorSynergy: true
          },
          {
            id: 'ex-bodyweight-squats',
            name: 'Bodyweight Squats & Chair Sits',
            category: 'Weight-Bearing',
            durationMinutes: 15,
            frequency: '3 days / week',
            difficulty: 'intermediate',
            boneImpact:
              'Axial loading on femur and pelvis promotes mineral density.',
            instructions: [
              'Lower hips back as if sitting, keeping chest tall.',
              'Push through heels to return to standing.'
            ],
            outdoorSynergy: false
          }
        ],
        safetyPrecautions:
          'If experiencing joint stiffness, start with gentle walking and avoid high-impact jumping.',
        tailoredNote:
          'Consistent weight-bearing exercise stimulates bone remodeling alongside Vitamin D.'
      },
      riskTier: 'moderate',
      generatedAt: new Date().toISOString()
    };
  },

  getOfflineFallbackArticles(): EducationalArticle[] {
    return [
      {
        id: 'art-synthesis',
        title: 'How Sunlight Becomes Vitamin D3: The Biochemical Pathway',
        subtitle:
          'From 7-dehydrocholesterol photolysis in the epidermis to active calcitriol hormone.',
        category: 'synthesis',
        readTimeMinutes: 4,
        summary:
          'Explore how solar ultraviolet-B radiation transforms skin sterols into active hormone calcitriol.',
        contentSections: [
          {
            heading: '1. Cutaneous Photolysis in the Epidermis',
            body:
              'UVB photons (290–315 nm) break the B-ring of 7-dehydrocholesterol to create pre-vitamin D3. Glass absorbs UVB, so direct outdoor exposure is required.',
            keyTakeaway: 'Indoor sunlight through glass does not produce Vitamin D.'
          },
          {
            heading: '2. Activation in Liver and Kidneys',
            body:
              'Pre-vitamin D3 isomerizes to cholecalciferol, which travels to the liver for 25-hydroxylation [25(OH)D], and then the kidneys for conversion to active calcitriol.',
            keyTakeaway: '25(OH)D is the key storage marker measured in blood tests.'
          }
        ],
        scientificReferences: [
          'Holick MF. Vitamin D deficiency. N Engl J Med. 2007;357(3):266-281.'
        ]
      },
      {
        id: 'art-blood-test',
        title: 'Decoding the 25(OH)D Blood Test: Clinical Interpretation',
        subtitle:
          'Understanding your lab results and optimal reference brackets.',
        category: 'clinical',
        readTimeMinutes: 5,
        summary:
          'Why serum 25(OH)D is the gold standard diagnostic test and how to interpret brackets.',
        contentSections: [
          {
            heading: '1. Standard Reference Ranges',
            body:
              '• <20 ng/mL: Deficient\n• 20–29 ng/mL: Insufficient\n• 30–50 ng/mL: Optimal Physiological Window\n• >100 ng/mL: Toxicity Risk',
            keyTakeaway: 'Targeting 30–50 ng/mL optimizes skeletal and immune health.'
          }
        ],
        scientificReferences: [
          'Holick MF, et al. J Clin Endocrinol Metab. 2011;96(7):1911-1930.'
        ]
      }
    ];
  }
};
