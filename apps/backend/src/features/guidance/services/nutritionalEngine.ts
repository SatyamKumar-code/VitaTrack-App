import {
  DietaryPreference,
  NutritionGuidance,
  PriorityFoodItem
} from '../types/guidance.types';

const VEGAN_FOODS: PriorityFoodItem[] = [
  {
    name: 'UV-Exposed Portobello & Maitake Mushrooms',
    vitaminDContent: '400 - 800 IU',
    servingSize: '100g (1 cup sliced)',
    category: 'Produce',
    bioavailabilityNote:
      'Mushrooms synthesize Ergocalciferol (Vitamin D2) when exposed to pulsed UVB light. Sauté lightly in olive oil to enhance lipid-soluble absorption.'
  },
  {
    name: 'Fortified Soy or Pea Protein Milk',
    vitaminDContent: '120 - 140 IU',
    servingSize: '240 ml (1 glass)',
    category: 'Plant-based',
    bioavailabilityNote:
      'Fortified with bio-equivalent Vitamin D2 or plant-derived D3. Provides 6g+ protein per serving alongside essential calcium.'
  },
  {
    name: 'Fortified Almond or Oat Milk',
    vitaminDContent: '100 - 120 IU',
    servingSize: '240 ml (1 glass)',
    category: 'Plant-based',
    bioavailabilityNote:
      'Opt for unsweetened varieties fortified with both Vitamin D and Tricalcium phosphate.'
  },
  {
    name: 'Fortified 100% Pure Orange Juice',
    vitaminDContent: '100 IU',
    servingSize: '240 ml (1 cup)',
    category: 'Fortified',
    bioavailabilityNote:
      'High in Vitamin C which aids cellular antioxidant defence, though contains natural sugars. Consume with whole meals.'
  },
  {
    name: 'Lichen-Derived Vegan Cholecalciferol (D3)',
    vitaminDContent: '1000 - 2000 IU / dose',
    servingSize: 'Per doctor-prescribed dropper or softgel',
    category: 'Plant-based',
    bioavailabilityNote:
      'Plant-sourced cholecalciferol extracted from organic wild lichen. Offers superior bioavailability matching animal-derived D3 without animal origin.'
  },
  {
    name: 'Fortified Whole Grain Breakfast Cereals',
    vitaminDContent: '80 - 100 IU',
    servingSize: '30g (1 serving)',
    category: 'Fortified',
    bioavailabilityNote:
      'Provides dietary fiber and B vitamins. Combine with fortified plant milk for dual nutrient delivery.'
  }
];

const VEGETARIAN_FOODS: PriorityFoodItem[] = [
  {
    name: 'UV-Treated Brown & Button Mushrooms',
    vitaminDContent: '400 - 600 IU',
    servingSize: '100g',
    category: 'Produce',
    bioavailabilityNote:
      'Excellent plant-derived source of ergocalciferol. Cooking with moderate butter or ghee assists bioavailability.'
  },
  {
    name: 'Fortified Whole Organic Cow Milk',
    vitaminDContent: '120 - 130 IU',
    servingSize: '240 ml (1 cup)',
    category: 'Dairy',
    bioavailabilityNote:
      'Whole milk fat acts as a natural lipid carrier, enhancing small intestine micellar uptake of cholecalciferol by up to 32%.'
  },
  {
    name: 'Pasture-Raised Organic Egg Yolks',
    vitaminDContent: '45 - 60 IU per yolk',
    servingSize: '2 large eggs (90-120 IU)',
    category: 'Eggs',
    bioavailabilityNote:
      'Hens with outdoor pasture access produce yolks with 3-4x higher Vitamin D3, rich in choline and lutein.'
  },
  {
    name: 'Fortified Greek Yogurt',
    vitaminDContent: '80 - 100 IU',
    servingSize: '170g (1 container)',
    category: 'Dairy',
    bioavailabilityNote:
      'Delivers 15g protein and active probiotics alongside Vitamin D and calcium for optimal bone mineral maintenance.'
  },
  {
    name: 'Fortified Cheddar & Ricotta Cheese',
    vitaminDContent: '25 - 40 IU',
    servingSize: '50g',
    category: 'Dairy',
    bioavailabilityNote:
      'Natural source of Vitamin K2 (MK-4) and bioavailable calcium which synergistically direct calcium into bone matrix.'
  },
  {
    name: 'Fortified Soy or Oat Beverage',
    vitaminDContent: '100 - 120 IU',
    servingSize: '240 ml',
    category: 'Plant-based',
    bioavailabilityNote:
      'Versatile dairy alternative delivering stable micronutrient levels.'
  }
];

const OMNIVORE_FOODS: PriorityFoodItem[] = [
  {
    name: 'Wild-Caught Sockeye Salmon',
    vitaminDContent: '600 - 900 IU',
    servingSize: '100g (3.5 oz cooked fillet)',
    category: 'Seafood',
    bioavailabilityNote:
      'One of the richest natural sources of Vitamin D3. Packed with anti-inflammatory EPA and DHA omega-3 fatty acids that enhance absorption.'
  },
  {
    name: 'Atlantic Mackerel Fillet',
    vitaminDContent: '500 - 650 IU',
    servingSize: '100g cooked',
    category: 'Seafood',
    bioavailabilityNote:
      'High-oil cold-water fish delivering dense cholecalciferol with zero carbohydrate load.'
  },
  {
    name: 'Canned Sardines in Extra Virgin Olive Oil',
    vitaminDContent: '200 - 300 IU',
    servingSize: '1 can (90g drained)',
    category: 'Seafood',
    bioavailabilityNote:
      'Edible soft bones provide 350mg bioavailable calcium, creating the perfect biological ratio for bone mineralisation.'
  },
  {
    name: 'Pastured Egg Yolks',
    vitaminDContent: '45 - 60 IU per yolk',
    servingSize: '2 whole eggs',
    category: 'Eggs',
    bioavailabilityNote:
      'Contains natural lecithin and phospholipids that optimize fat-soluble vitamin emulsification in the duodenum.'
  },
  {
    name: 'Fortified Organic Whole Milk',
    vitaminDContent: '120 - 130 IU',
    servingSize: '240 ml (1 glass)',
    category: 'Dairy',
    bioavailabilityNote:
      'Natural dairy fats create an ideal emulsion for consistent intestinal absorption.'
  },
  {
    name: 'UV-Exposed Portobello Mushrooms',
    vitaminDContent: '400 IU',
    servingSize: '100g',
    category: 'Produce',
    bioavailabilityNote:
      'Plant-based complementary source of ergocalciferol with rich dietary beta-glucans.'
  }
];

export class NutritionalEngine {
  /**
   * Generates tailored dietary recommendations based on dietary preference, risk tier, and medical conditions.
   */
  public static generateNutritionalGuidance(
    dietType: DietaryPreference = 'omnivore',
    riskTier: 'low' | 'moderate' | 'high' = 'moderate',
    medicalConditions: string[] = []
  ): NutritionGuidance {
    let priorityFoods: PriorityFoodItem[];

    switch (dietType) {
      case 'vegan':
        priorityFoods = VEGAN_FOODS;
        break;
      case 'vegetarian':
        priorityFoods = VEGETARIAN_FOODS;
        break;
      case 'omnivore':
      default:
        priorityFoods = OMNIVORE_FOODS;
        break;
    }

    // Determine target daily IU recommendations
    let targetDailyIU = '1,000 - 2,000 IU / day (dietary sources + safe solar synthesis)';
    if (riskTier === 'high') {
      targetDailyIU =
        '2,000 - 4,000 IU / day (Clinical guidance advised; combine bioavailable foods with physician-supervised supplementation)';
    } else if (riskTier === 'moderate') {
      targetDailyIU =
        '1,500 - 2,500 IU / day (Active lifestyle optimization with fortified foods and daily outdoor exposure)';
    }

    const hasMalabsorption = medicalConditions.some((c) =>
      ['celiac_disease', 'crohns_disease', 'malabsorption_syndrome', 'ibs'].includes(
        c.toLowerCase()
      )
    );

    const coFactors = [
      'Magnesium (350–420 mg/day): Essential cofactor for liver 25-hydroxylase & kidney 1α-hydroxylase enzymes. Sources: pumpkin seeds, spinach, dark chocolate, almonds.',
      'Vitamin K2 - Menaquinone-7 (90–120 µg/day): Activates osteocalcin to bind calcium into hydroxyapatite bone matrix and activates MGP to prevent arterial calcification. Sources: natto, fermented hard cheeses, egg yolks.',
      'Dietary Calcium (1,000 mg/day): Synergistic bone-building partner. Balance via fortified plant/dairy milk, sesame seeds, almonds, or soft-bone fish.',
      'Zinc & Boron: Trace minerals supporting Vitamin D receptor (VDR) expression and half-life.'
    ];

    const absorptionTips = hasMalabsorption
      ? 'Because you have a reported gastrointestinal or malabsorption condition, fat-soluble vitamin absorption may be reduced. Always consume Vitamin D alongside a meal containing healthy dietary fats (extra virgin olive oil, avocado, or nuts), and ask your physician about micellized or sublingual liquid Vitamin D drops.'
      : 'Vitamin D is strictly fat-soluble. Consuming fortified foods or supplements alongside healthy dietary lipids (avocado, nuts, olive oil, or whole eggs) increases intestinal micelle formation and bioavailability by up to 32% compared to taking it on an empty stomach.';

    const supplementGuidance = {
      recommended: riskTier !== 'low' || dietType === 'vegan',
      reason:
        dietType === 'vegan'
          ? 'Purely plant-based diets naturally contain negligible natural D3; regular intake of fortified foods or lichen-derived D3 drops is strongly recommended.'
          : riskTier === 'high'
          ? 'Your assessment indicates high deficiency risk where dietary intake alone is usually insufficient to restore normal serum 25(OH)D levels (≥30 ng/mL).'
          : 'Moderate deficiency likelihood can be addressed with mindful nutrition and consistent outdoor morning sunlight.',
      caution:
        'Never exceed 4,000 IU daily from unprescribed supplements without periodic serum 25(OH)D blood testing to avoid hypercalcemia.'
    };

    return {
      dietType,
      targetDailyIU,
      priorityFoods,
      coFactors,
      absorptionTips,
      supplementGuidance
    };
  }
}
