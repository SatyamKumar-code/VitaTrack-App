import { ExerciseGuidance, ExerciseRoutineItem } from '../types/guidance.types';

const MASTER_EXERCISE_ROUTINES: ExerciseRoutineItem[] = [
  {
    id: 'ex-brisk-walk',
    name: 'Brisk Outdoor Solar Walk',
    category: 'Weight-Bearing',
    durationMinutes: 30,
    frequency: '4–5 days / week',
    difficulty: 'beginner',
    boneImpact:
      'Generates 1.2x to 1.5x body weight ground reaction force on the femoral neck and lumbar vertebrae, stimulating osteoblast mineral deposition.',
    instructions: [
      'Dress in short sleeves and shorts when outdoor temperature allows to capture solar UVB.',
      'Maintain an upright posture, engaging your core and swinging arms rhythmically.',
      'Pace should be purposeful: you can comfortably speak a short sentence, but cannot sing.',
      'Walk on natural paths, grass, or sidewalks for consistent ground feedback.'
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
      'Direct axial compressive load across the femoral shaft, pelvis, and lumbar spine, triggering bone mineral thickening.',
    instructions: [
      'Stand with feet shoulder-width apart, toes pointing slightly outward (15 degrees).',
      'Hinge at the hips and lower down as if sitting into an invisible chair until thighs are parallel to floor.',
      'Keep knees tracking inline with your second toe and chest proud.',
      'Push through the heels to stand tall, contracting glutes at the top.',
      'Perform 3 sets of 10–12 repetitions with 60 seconds rest between sets.'
    ],
    outdoorSynergy: false
  },
  {
    id: 'ex-resistance-band',
    name: 'Resistance Band Rows & Overhead Pulls',
    category: 'Resistance',
    durationMinutes: 20,
    frequency: '3 days / week',
    difficulty: 'intermediate',
    boneImpact:
      'Muscular tensile traction on the thoracic spine, scapula, and humeral bones stimulates periosteal bone formation.',
    instructions: [
      'Anchor a medium resistance band at chest height or loop around your feet.',
      'Pull elbows straight back, squeezing shoulder blades together for a 2-second hold.',
      'Slowly release forward over 3 seconds to maximize eccentric mechanical tension.',
      'Switch to overhead pull-aparts to reinforce posterior postural muscles.',
      'Perform 3 sets of 12–15 repetitions.'
    ],
    outdoorSynergy: false
  },
  {
    id: 'ex-stair-climbing',
    name: 'Stair Climbing & Step-Ups',
    category: 'Weight-Bearing',
    durationMinutes: 15,
    frequency: '3–4 days / week',
    difficulty: 'intermediate',
    boneImpact:
      'Delivers vertical impact forces of 2x body weight during ascending drive, strengthening the hip socket and calcaneus.',
    instructions: [
      'Find a stable staircase or sturdy 15–20cm exercise step box.',
      'Step up firmly placing the entire foot on the step, pushing down through the heel.',
      'Bring the opposite foot up, then step back down softly under muscular control.',
      'Alternate leading leg every 10 steps. Perform 3 sets of 20 total steps.'
    ],
    outdoorSynergy: false
  },
  {
    id: 'ex-heel-drops',
    name: 'Osteogenic Heel Drops',
    category: 'Weight-Bearing',
    durationMinutes: 8,
    frequency: 'Daily (morning & afternoon)',
    difficulty: 'beginner',
    boneImpact:
      'High strain rate mechanical shockwaves propagate up the tibia and femur, activating Piezo1 mechanoreceptors in osteocytes.',
    instructions: [
      'Stand barefoot or in thin socks holding onto the back of a sturdy chair for balance.',
      'Rise up smoothly onto the balls of both feet until fully extended.',
      'Drop down deliberately onto your heels with knees slightly relaxed, feeling the firm floor impact.',
      'Perform 2 sets of 15 drops twice daily.'
    ],
    outdoorSynergy: false
  },
  {
    id: 'ex-gentle-mobility',
    name: 'Gentle Joint Mobility & Isometric Posture',
    category: 'Low-Impact Mobility',
    durationMinutes: 15,
    frequency: 'Daily',
    difficulty: 'beginner',
    boneImpact:
      'Maintains synovial fluid circulation and protects joint cartilage without jarring articular surfaces.',
    instructions: [
      'Perform seated cat-cow spinal flexions to relieve stiffness in the back.',
      'Gently rotate shoulders and perform seated leg extensions holding for 5 seconds.',
      'Practice gentle wall push-ups to load wrists and forearms safely without falling risk.',
      'Ideal starting routine for days with severe musculoskeletal discomfort.'
    ],
    outdoorSynergy: false
  }
];

export class ExerciseGuideModule {
  /**
   * Selects and curates bone mineral density exercises tailored to the user's reported symptom severity.
   */
  public static generateExerciseGuidance(
    bonePainLevel: 'none' | 'mild' | 'moderate' | 'severe' = 'none',
    muscleWeaknessLevel: 'none' | 'mild' | 'moderate' | 'severe' = 'none'
  ): ExerciseGuidance {
    const hasSeverePainOrWeakness =
      bonePainLevel === 'severe' || muscleWeaknessLevel === 'severe';
    const hasModeratePain =
      bonePainLevel === 'moderate' || muscleWeaknessLevel === 'moderate';

    let suggestions: ExerciseRoutineItem[];
    let tailoredNote: string;
    let safetyPrecautions: string;

    if (hasSeverePainOrWeakness) {
      // Prioritize low-impact, joint-safe mobility and gentle isometric loading
      suggestions = [
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-gentle-mobility')!,
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-brisk-walk')!,
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-resistance-band')!
      ];
      tailoredNote =
        'Because you reported significant bone pain or muscle weakness, high-impact jumping and heavy axial loading have been filtered out. Focus on joint lubrication, low-impact outdoor walking, and gentle isometric postural holds.';
      safetyPrecautions =
        'Never push through sharp or throbbing bone pain. If joint ache intensifies, pause and rest. Consult a physical therapist or rheumatologist if pain persists at rest.';
    } else if (hasModeratePain) {
      suggestions = [
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-brisk-walk')!,
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-bodyweight-squats')!,
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-resistance-band')!,
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-heel-drops')!
      ];
      tailoredNote =
        'Moderate bone stiffness benefits greatly from steady ground impact and axial bone loading. Pair your daily outdoor walk with gentle bodyweight squats and heel drops.';
      safetyPrecautions =
        'Wear well-cushioned supportive footwear during walking and stair climbing to distribute peak joint pressure evenly.';
    } else {
      // Full bone density protocol
      suggestions = [
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-brisk-walk')!,
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-bodyweight-squats')!,
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-stair-climbing')!,
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-resistance-band')!,
        MASTER_EXERCISE_ROUTINES.find((r) => r.id === 'ex-heel-drops')!
      ];
      tailoredNote =
        'Your musculoskeletal baseline supports a full osteogenic exercise regimen combining weight-bearing ground impact, eccentric stair loading, and resistance band traction.';
      safetyPrecautions =
        'Warm up for 3–5 minutes with dynamic arm circles and knee marches before beginning resistance exercises. Maintain proper hydration.';
    }

    return {
      focus:
        'Mechanotransductive Weight-Bearing & Osteogenic Bone Density Support',
      suggestions,
      safetyPrecautions,
      tailoredNote
    };
  }
}
