import { NutritionalEngine } from '../../src/features/guidance/services/nutritionalEngine';
import { SolarCalculatorEngine } from '../../src/features/guidance/services/solarCalculatorEngine';
import { ExerciseGuideModule } from '../../src/features/guidance/services/exerciseGuideModule';
import { EducationalKnowledgeBase } from '../../src/features/guidance/services/educationalKnowledgeBase';

describe('Personalized Guidance Subsystems Unit Suite (Phase 5)', () => {
  describe('TASK-P5-01 / TC-REC-01: Nutritional Recommendation Engine', () => {
    it('TC-REC-01: should generate vegan dietary plan featuring UV mushrooms, fortified plant milk, lichen D3, and zero animal foods', () => {
      const guidance = NutritionalEngine.generateNutritionalGuidance(
        'vegan',
        'moderate',
        []
      );

      expect(guidance.dietType).toBe('vegan');
      expect(guidance.priorityFoods.length).toBeGreaterThanOrEqual(4);

      // Verify vegan priority foods include UV mushrooms, fortified plant milk, and lichen D3
      const foodNames = guidance.priorityFoods.map((f) => f.name.toLowerCase());
      const hasUvMushrooms = foodNames.some((n) => n.includes('mushroom'));
      const hasPlantMilk = foodNames.some((n) => n.includes('milk'));
      const hasLichenD3 = foodNames.some((n) => n.includes('lichen'));
      expect(hasUvMushrooms).toBe(true);
      expect(hasPlantMilk).toBe(true);
      expect(hasLichenD3).toBe(true);

      // Verify strict absence of animal meat, fish, poultry, or dairy
      const hasFish = foodNames.some(
        (n) => n.includes('salmon') || n.includes('fish') || n.includes('sardine')
      );
      const hasMeat = foodNames.some((n) => n.includes('beef') || n.includes('chicken'));
      const hasDairy = foodNames.some(
        (n) => n.includes('cow') || n.includes('yogurt') || n.includes('cheese')
      );
      expect(hasFish).toBe(false);
      expect(hasMeat).toBe(false);
      expect(hasDairy).toBe(false);

      // Verify co-factors (Magnesium & K2)
      expect(guidance.coFactors.some((c) => c.includes('Magnesium'))).toBe(true);
      expect(guidance.coFactors.some((c) => c.includes('Vitamin K2'))).toBe(true);
      expect(guidance.supplementGuidance.recommended).toBe(true);
      expect(guidance.supplementGuidance.reason).toContain('plant-based');
    });

    it('should generate vegetarian dietary plan with fortified dairy, egg yolks, UV mushrooms, and zero fish/meat', () => {
      const guidance = NutritionalEngine.generateNutritionalGuidance(
        'vegetarian',
        'moderate',
        []
      );

      expect(guidance.dietType).toBe('vegetarian');
      const foodNames = guidance.priorityFoods.map((f) => f.name.toLowerCase());

      expect(foodNames.some((n) => n.includes('egg'))).toBe(true);
      expect(foodNames.some((n) => n.includes('milk'))).toBe(true);
      expect(foodNames.some((n) => n.includes('mushroom'))).toBe(true);
      expect(foodNames.some((n) => n.includes('salmon') || n.includes('sardine'))).toBe(
        false
      );
      expect(foodNames.some((n) => n.includes('beef'))).toBe(false);
    });

    it('should generate omnivore dietary plan rich in oily cold-water fish and pastured eggs', () => {
      const guidance = NutritionalEngine.generateNutritionalGuidance(
        'omnivore',
        'low',
        []
      );

      expect(guidance.dietType).toBe('omnivore');
      const foodNames = guidance.priorityFoods.map((f) => f.name.toLowerCase());

      expect(foodNames.some((n) => n.includes('salmon'))).toBe(true);
      expect(foodNames.some((n) => n.includes('mackerel'))).toBe(true);
      expect(foodNames.some((n) => n.includes('sardines'))).toBe(true);
      expect(foodNames.some((n) => n.includes('egg'))).toBe(true);
    });

    it('should adjust target daily IU and advice for high-risk profiles', () => {
      const guidance = NutritionalEngine.generateNutritionalGuidance(
        'omnivore',
        'high',
        ['malabsorption_syndrome']
      );

      expect(guidance.targetDailyIU).toContain('2,000 - 4,000 IU');
      expect(guidance.supplementGuidance.recommended).toBe(true);
      expect(guidance.absorptionTips).toContain('malabsorption');
    });
  });

  describe('TASK-P5-02 / TC-REC-02: Safe Sunlight Exposure Calculator', () => {
    it('TC-REC-02: should calculate shorter exposure for Type I (Fair) vs extended duration for Type VI (Dark)', () => {
      const fairSkin = SolarCalculatorEngine.calculateSunlightGuidance('type_1');
      const darkSkin = SolarCalculatorEngine.calculateSunlightGuidance('type_6');

      expect(fairSkin.recommendedDailyMinutes).toBe(10);
      expect(darkSkin.recommendedDailyMinutes).toBe(38);
      expect(fairSkin.recommendedDailyMinutes).toBeLessThan(
        darkSkin.recommendedDailyMinutes
      );

      // Verify safety instructions
      expect(fairSkin.safeExposureGuidance).toContain('SPF 30+');
      expect(darkSkin.safeExposureGuidance).toContain('30–40 minutes');
    });

    it('should scale duration monotonically across all Fitzpatrick phototypes I through VI', () => {
      const t1 = SolarCalculatorEngine.calculateSunlightGuidance('type_1');
      const t2 = SolarCalculatorEngine.calculateSunlightGuidance('type_2');
      const t3 = SolarCalculatorEngine.calculateSunlightGuidance('type_3');
      const t4 = SolarCalculatorEngine.calculateSunlightGuidance('type_4');
      const t5 = SolarCalculatorEngine.calculateSunlightGuidance('type_5');
      const t6 = SolarCalculatorEngine.calculateSunlightGuidance('type_6');

      expect(t1.recommendedDailyMinutes).toBeLessThanOrEqual(t2.recommendedDailyMinutes);
      expect(t2.recommendedDailyMinutes).toBeLessThanOrEqual(t3.recommendedDailyMinutes);
      expect(t3.recommendedDailyMinutes).toBeLessThanOrEqual(t4.recommendedDailyMinutes);
      expect(t4.recommendedDailyMinutes).toBeLessThanOrEqual(t5.recommendedDailyMinutes);
      expect(t5.recommendedDailyMinutes).toBeLessThanOrEqual(t6.recommendedDailyMinutes);
    });

    it('should include conservative UV thresholds and sunscreen application rules', () => {
      const guidance = SolarCalculatorEngine.calculateSunlightGuidance('type_3');

      expect(guidance.uvThresholdNotice).toContain('UV Index');
      expect(guidance.sunscreenAdvice).toContain('SPF 30+');
      expect(guidance.optimalWindow).toContain('10:00 AM');
      expect(guidance.timerDefaultMinutes).toBe(18);
    });
  });

  describe('TASK-P5-03: Musculoskeletal Exercise Guide Module', () => {
    it('should provide full osteogenic protocol when no severe pain is reported', () => {
      const exercise = ExerciseGuideModule.generateExerciseGuidance('none', 'none');

      expect(exercise.suggestions.length).toBeGreaterThanOrEqual(4);
      const names = exercise.suggestions.map((s) => s.name.toLowerCase());
      expect(names.some((n) => n.includes('walk'))).toBe(true);
      expect(names.some((n) => n.includes('squat'))).toBe(true);
      expect(names.some((n) => n.includes('stair'))).toBe(true);
      expect(exercise.suggestions.some((s) => s.outdoorSynergy)).toBe(true);
    });

    it('should filter out high-impact stairs and recommend low-impact mobility for severe bone pain', () => {
      const exercise = ExerciseGuideModule.generateExerciseGuidance('severe', 'mild');

      const names = exercise.suggestions.map((s) => s.name.toLowerCase());
      expect(names.some((n) => n.includes('gentle joint mobility'))).toBe(true);
      expect(names.some((n) => n.includes('stair climbing'))).toBe(false);
      expect(exercise.tailoredNote).toContain('significant bone pain');
      expect(exercise.safetyPrecautions).toContain('Never push through sharp or throbbing');
    });
  });

  describe('TASK-P5-05: Educational Content Hub', () => {
    it('should return all 5 required educational articles with detailed sections and references', () => {
      const articles = EducationalKnowledgeBase.getAllArticles();
      expect(articles.length).toBe(5);

      const articleIds = articles.map((a) => a.id);
      expect(articleIds).toContain('art-synthesis');
      expect(articleIds).toContain('art-blood-test');
      expect(articleIds).toContain('art-bone-axis');
      expect(articleIds).toContain('art-sunscreen-synthesis');
      expect(articleIds).toContain('art-deficiency-symptoms');

      articles.forEach((art) => {
        expect(art.title.length).toBeGreaterThan(10);
        expect(art.contentSections.length).toBeGreaterThanOrEqual(3);
        expect(art.scientificReferences.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should filter articles by category and retrieve article by ID', () => {
      const clinicalArticles = EducationalKnowledgeBase.getArticlesByCategory('clinical');
      expect(clinicalArticles.length).toBe(2);

      const synthesisArt = EducationalKnowledgeBase.getArticleById('art-synthesis');
      expect(synthesisArt).toBeDefined();
      expect(synthesisArt?.title).toContain('Biochemical Pathway');
    });
  });
});
