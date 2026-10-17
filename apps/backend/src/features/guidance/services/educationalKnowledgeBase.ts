import { EducationalArticle } from '../types/guidance.types';

export const EDUCATIONAL_ARTICLES: EducationalArticle[] = [
  {
    id: 'art-synthesis',
    title: 'How Sunlight Becomes Vitamin D3: The Biochemical Pathway',
    subtitle:
      'From 7-dehydrocholesterol photolysis in the epidermis to the active calcitriol hormone.',
    category: 'synthesis',
    readTimeMinutes: 4,
    summary:
      'Explore the multi-organ cascade where solar ultraviolet-B radiation transforms sterols in your skin into the active steroid hormone calcitriol.',
    contentSections: [
      {
        heading: '1. Cutaneous Photolysis in the Epidermis',
        body:
          'When ultraviolet-B (UVB) photons at wavelengths of 290–315 nm penetrate the stratum basale and stratum spinosum of the epidermis, they break the B-ring of 7-dehydrocholesterol (provitamin D3). This creates pre-vitamin D3, an unstable intermediate.',
        keyTakeaway:
          'UVB radiation must be directly absorbed by uncovered skin; glass windows absorb nearly 100% of UVB, rendering indoor sunlight ineffective for synthesis.'
      },
      {
        heading: '2. Thermal Isomerization to Cholecalciferol',
        body:
          'Over a 24- to 48-hour period at normal body temperature (37°C), pre-vitamin D3 undergoes a spontaneous thermal isomerization into cholecalciferol (Vitamin D3). It then enters dermal capillary circulation bound to Vitamin D-binding protein (DBP).',
        keyTakeaway:
          'Warm skin facilitates efficient isomerization into circulation.'
      },
      {
        heading: '3. Liver 25-Hydroxylation',
        body:
          'In the hepatocytes of the liver, microsomal and mitochondrial enzymes (primarily CYP2R1 and CYP27A1) add a hydroxyl group to carbon-25, producing 25-hydroxyvitamin D3 [25(OH)D or calcifediol]. This is the primary circulating form measured in clinical blood tests.',
        keyTakeaway:
          '25(OH)D has a serum half-life of 2–3 weeks, making it the definitive metric of your bodily storage.'
      },
      {
        heading: '4. Kidney 1α-Hydroxylation to Active Calcitriol',
        body:
          'Finally, renal tubular cells express the enzyme 1α-hydroxylase (CYP27B1), tightly regulated by Parathyroid Hormone (PTH), calcium, and fibroblast growth factor 23 (FGF23). This converts 25(OH)D into 1,25-dihydroxyvitamin D [1,25(OH)₂D or calcitriol], the biologically potent steroid hormone that binds to nuclear Vitamin D Receptors (VDR) throughout the body.',
        keyTakeaway:
          'Calcitriol acts as a master transcription factor modulating over 1,000 human genes.'
      }
    ],
    scientificReferences: [
      'Holick MF. Vitamin D deficiency. N Engl J Med. 2007;357(3):266-281.',
      'Bikle DD. Vitamin D metabolism, mechanism of action, and clinical applications. Chem Biol. 2014;21(3):319-329.'
    ]
  },
  {
    id: 'art-blood-test',
    title: 'Decoding the 25(OH)D Blood Test: Clinical Interpretation',
    subtitle:
      'Understanding your laboratory results, reference ranges, and when to test.',
    category: 'clinical',
    readTimeMinutes: 5,
    summary:
      'Why total serum 25-hydroxyvitamin D is the gold standard diagnostic test, how to interpret clinical thresholds, and the importance of professional monitoring.',
    contentSections: [
      {
        heading: '1. Why Test 25(OH)D Instead of Calcitriol?',
        body:
          'Patients often wonder why doctors order total 25(OH)D rather than 1,25(OH)₂D (active calcitriol). Active calcitriol has a very short circulating half-life (under 4–6 hours) and is often maintained at normal or elevated levels by compensatory parathyroid hormone even when tissue stores are severely depleted. Total 25(OH)D reflects actual whole-body storage.',
        keyTakeaway:
          'Always verify that your requisition is for "25-hydroxyvitamin D, Total" (not 1,25-dihydroxy).'
      },
      {
        heading: '2. Standard Clinical Stratification Brackets',
        body:
          'The Endocrine Society and International Osteoporosis Foundation classify serum 25(OH)D as follows:\n• < 20 ng/mL (< 50 nmol/L): Deficient. Heightened risk of rickets, osteomalacia, secondary hyperparathyroidism, and muscle weakness.\n• 20 – 29 ng/mL (50 – 74 nmol/L): Insufficient. Sub-optimal for bone remodeling and calcium absorption.\n• 30 – 50 ng/mL (75 – 125 nmol/L): Optimal / Sufficient. Minimizes PTH secretion and maximizes bone mineral density.\n• > 100 ng/mL (> 250 nmol/L): Excess / Potential Toxicity. Risk of hypercalcemia, kidney stones, and soft tissue calcification.',
        keyTakeaway:
          'Targeting 30–50 ng/mL represents the consensus optimal physiological window.'
      },
      {
        heading: '3. When and How Often to Test',
        body:
          'If beginning corrective high-dose supplementation under medical guidance, re-testing should be conducted at 8 to 12 weeks to assess therapeutic response, followed by maintenance checks annually.',
        keyTakeaway:
          'Consult a licensed physician for a lab requisition before starting high-dose regimens (>4,000 IU/day).'
      }
    ],
    scientificReferences: [
      'Holick MF, et al. Evaluation, treatment, and prevention of vitamin D deficiency: an Endocrine Society clinical practice guideline. J Clin Endocrinol Metab. 2011;96(7):1911-1930.',
      'Dawson-Hughes B, et al. IOF position statement: vitamin D recommendations for older adults. Osteoporos Int. 2010;21(7):1151-1154.'
    ]
  },
  {
    id: 'art-bone-axis',
    title: 'The Bone-Mineral Axis: Vitamin D, Magnesium & Vitamin K2',
    subtitle:
      'How synergistic co-factors prevent arterial calcification and build skeletal density.',
    category: 'nutrition',
    readTimeMinutes: 4,
    summary:
      'Taking high-dose Vitamin D alone is insufficient; learn how Magnesium activates enzymes and Vitamin K2 ensures calcium deposits in bone rather than arteries.',
    contentSections: [
      {
        heading: '1. The Magnesium Dependency',
        body:
          'Every enzymatic step in the activation and deactivation of Vitamin D requires Magnesium as an essential cofactor. If cellular magnesium stores are low, Vitamin D remains stored and inactive, leading to refractory low serum levels despite supplementation.',
        keyTakeaway:
          'Pair Vitamin D with magnesium-rich foods: raw pumpkin seeds, dark leafy greens, whole almonds, and cacao.'
      },
      {
        heading: '2. Vitamin K2 (Menaquinone-7) and Calcium Routing',
        body:
          'Vitamin D dramatically boosts the intestinal absorption of dietary calcium. However, Vitamin D alone cannot specify where that calcium is deposited. Vitamin K2 activates Osteocalcin, a protein that binds calcium into hydroxyapatite bone crystal. Concurrently, K2 activates Matrix Gla Protein (MGP) in blood vessel walls, which inhibits arterial calcification.',
        keyTakeaway:
          'Vitamin K2 ensures calcium goes into bones and teeth, preventing soft-tissue calcification.'
      },
      {
        heading: '3. Dietary Sources vs. Supplement Balance',
        body:
          'Natural K2 (MK-7) is concentrated in traditional fermented foods like Japanese natto, fermented whole-milk cheeses (Gouda, Edam), and pasture-raised egg yolks. Combining dietary D3 with K2 and magnesium provides complete skeletal protection.',
        keyTakeaway:
          'Always balance fat-soluble vitamins with balanced whole-food micronutrient intake.'
      }
    ],
    scientificReferences: [
      'Uwitonze AM, Razzaque MS. Role of Magnesium in Vitamin D Activation and Function. J Am Osteopath Assoc. 2018;118(3):181-189.',
      'Theuwissen E, et al. The role of vitamin K in soft-tissue calcification. Adv Nutr. 2012;3(2):166-173.'
    ]
  },
  {
    id: 'art-sunscreen-synthesis',
    title: 'Sunscreen vs. Synthesis: Safe Outdoor Sun Exposure',
    subtitle:
      'Balancing cutaneous photochemistry with melanoma prevention.',
    category: 'safety',
    readTimeMinutes: 3,
    summary:
      'Learn how the "Uncovered Window" allows your skin to safely generate thousands of units of Vitamin D3 before applying sunscreen.',
    contentSections: [
      {
        heading: '1. The Sunscreen Dilemma',
        body:
          'Sunscreen with SPF 30 absorbs or reflects approximately 97% of incoming UVB radiation, reducing cutaneous Vitamin D synthesis by up to 95–98%. While essential for preventing sunburn and malignant melanoma, continuous full sunscreen application can contribute to widespread deficiency.',
        keyTakeaway:
          'Sun protection is critical, but smart timing allows both synthesis and protection.'
      },
      {
        heading: '2. The "Uncovered Window" Protocol',
        body:
          'Dermatological researchers recommend spending 10 to 20 minutes (depending on your individual Fitzpatrick phototype) with arms and lower legs uncovered in mid-morning sunlight without sunscreen. Once this target is reached, immediately seek shade or apply broad-spectrum SPF 30+ to prevent cellular DNA erythema.',
        keyTakeaway:
          'Never stay outdoors long enough to allow skin to turn pink or burn.'
      },
      {
        heading: '3. What About Facial Skin?',
        body:
          'Facial skin contributes only about 9% of total body surface area and has thinner epidermal layers prone to premature photoaging. You can safely protect your face with sunscreen or a wide-brimmed hat while exposing your forearms and calves for cutaneous synthesis.',
        keyTakeaway:
          'Protect the face; utilize larger surface areas like arms and legs for synthesis.'
      }
    ],
    scientificReferences: [
      'Neale RE, et al. The effect of sunscreen on vitamin D: a review. Br J Dermatol. 2019;181(5):907-915.',
      'Rhodes LE, et al. Recommended summer sunlight exposure levels can produce sufficient (>or=20 ng/ml) but not the proposed optimal (>or=32 ng/ml) 25(OH)D levels in UK white Caucasians. J Invest Dermatol. 2010;130(5):1411-1418.'
    ]
  },
  {
    id: 'art-deficiency-symptoms',
    title: 'Recognizing Hidden Symptoms: Beyond Bone Pain',
    subtitle:
      'How deficiency impacts immune resilience, muscle force, and mood regulation.',
    category: 'clinical',
    readTimeMinutes: 4,
    summary:
      'Vitamin D receptors are expressed in virtually every human tissue. Learn why systemic deficiency manifests as chronic fatigue, frequent respiratory infections, and mood shifts.',
    contentSections: [
      {
        heading: '1. Bone and Musculoskeletal Aches',
        body:
          'Vitamin D deficiency impairs osteoid matrix mineralization. When hydration forces expand unmineralized osteoid tissue against the pain-sensitive periosteum, it causes a characteristic deep, throbbing, symmetrical ache in the sternum, tibias, and lumbar spine.',
        keyTakeaway:
          'Periosteal tenderness on the anterior shinbone is a classic physical screening marker.'
      },
      {
        heading: '2. Proximal Muscle Weakness & Sarcopenia',
        body:
          'Skeletal muscle fibers express VDRs. Low calcitriol impairs calcium influx into the sarcoplasmic reticulum during muscle contraction, leading to difficulty rising from a chair or climbing stairs.',
        keyTakeaway:
          'Muscle weakness often responds rapidly to serum restoration.'
      },
      {
        heading: '3. Immune Susceptibility & Cathelicidin',
        body:
          'Calcitriol triggers the transcription of cathelicidin (hCAP-18) and defensins—antimicrobial peptides that break bacterial and viral cell envelopes in macrophages and airway epithelial cells.',
        keyTakeaway:
          'Deficiency is strongly correlated with increased frequency of upper respiratory infections.'
      },
      {
        heading: '4. Neurotransmitter Synthesis and Mood',
        body:
          'Vitamin D activates tryptophan hydroxylase 2 (TPH2) in the brain, which converts tryptophan to serotonin. Low winter solar exposure decreases central serotonin synthesis, contributing to seasonal mood alterations.',
        keyTakeaway:
          'Consistent solar exposure and nutrition support neurochemical balance.'
      }
    ],
    scientificReferences: [
      'Ginde AA, et al. Association between serum 25-hydroxyvitamin D level and upper respiratory tract infection in the Third National Health and Nutrition Examination Survey. Arch Intern Med. 2009;169(4):384-390.',
      'Patrick RP, Ames BN. Vitamin D and the omega-3 fatty acids control serotonin synthesis and action, part 2: relevance for ADHD, bipolar, schizophrenia, and impulsive behavior. FASEB J. 2015;29(6):2207-2222.'
    ]
  }
];

export class EducationalKnowledgeBase {
  public static getAllArticles(): EducationalArticle[] {
    return EDUCATIONAL_ARTICLES;
  }

  public static getArticleById(id: string): EducationalArticle | undefined {
    return EDUCATIONAL_ARTICLES.find((a) => a.id === id);
  }

  public static getArticlesByCategory(
    category: 'synthesis' | 'clinical' | 'nutrition' | 'safety'
  ): EducationalArticle[] {
    return EDUCATIONAL_ARTICLES.filter((a) => a.category === category);
  }
}
