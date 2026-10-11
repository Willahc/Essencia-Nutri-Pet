import { Species, FeedingType, NutritionPlan, NutritionPlanItem, Patient, Tutor } from "@/types";

export interface IngredientDefinition {
  id: string;
  name: string;
  category: 'PROTEIN' | 'CARBOHYDRATE' | 'VEGETABLE' | 'ORGAN' | 'FAT' | 'COMMERCIAL_FEED';
  kcal_per_100g: number;
  protein_g_per_100g: number;
  fat_g_per_100g: number;
  carb_g_per_100g: number;
  calcium_mg_per_100g: number;
  phosphorus_mg_per_100g: number;
  species: Species[];
  is_renal_safe: boolean;
  default_note: string;
}

export const INGREDIENT_DATABASE: IngredientDefinition[] = [
  // --- PROTEÍNAS ---
  {
    id: "ing-frango-peito",
    name: "Peito de frango cozido desfiado",
    category: "PROTEIN",
    kcal_per_100g: 165,
    protein_g_per_100g: 31.0,
    fat_g_per_100g: 3.6,
    carb_g_per_100g: 0.0,
    calcium_mg_per_100g: 15,
    phosphorus_mg_per_100g: 220,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Proteína magra nobre de altíssima digestibilidade",
  },
  {
    id: "ing-carne-patinho",
    name: "Carne bovina magra moída (Patinho cozido)",
    category: "PROTEIN",
    kcal_per_100g: 215,
    protein_g_per_100g: 26.0,
    fat_g_per_100g: 11.0,
    carb_g_per_100g: 0.0,
    calcium_mg_per_100g: 12,
    phosphorus_mg_per_100g: 210,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Excelente aporte de ferro heme, zinco e carnitina",
  },
  {
    id: "ing-tilapia-file",
    name: "Filé de tilápia cozido no vapor",
    category: "PROTEIN",
    kcal_per_100g: 120,
    protein_g_per_100g: 26.0,
    fat_g_per_100g: 2.0,
    carb_g_per_100g: 0.0,
    calcium_mg_per_100g: 10,
    phosphorus_mg_per_100g: 200,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Proteína leve hipoalergênica com baixíssimo teor lipídico",
  },
  {
    id: "ing-lombo-suino",
    name: "Lombo suíno magro cozido",
    category: "PROTEIN",
    kcal_per_100g: 195,
    protein_g_per_100g: 27.0,
    fat_g_per_100g: 9.0,
    carb_g_per_100g: 0.0,
    calcium_mg_per_100g: 15,
    phosphorus_mg_per_100g: 240,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Excelente fonte de tiamina (Vitamina B1) e palatabilidade",
  },
  {
    id: "ing-ovo-cozido",
    name: "Ovo de galinha cozido inteiro",
    category: "PROTEIN",
    kcal_per_100g: 155,
    protein_g_per_100g: 13.0,
    fat_g_per_100g: 11.0,
    carb_g_per_100g: 1.1,
    calcium_mg_per_100g: 50,
    phosphorus_mg_per_100g: 198,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Padrão ouro de valor biológico proteico (albumina e colina)",
  },
  {
    id: "ing-peru-peito",
    name: "Peito de peru desossado cozido",
    category: "PROTEIN",
    kcal_per_100g: 140,
    protein_g_per_100g: 28.0,
    fat_g_per_100g: 2.5,
    carb_g_per_100g: 0.0,
    calcium_mg_per_100g: 15,
    phosphorus_mg_per_100g: 215,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Proteína magra hipoalergênica para controle ponderal",
  },

  // --- CARBOIDRATOS & ENERGIA ---
  {
    id: "ing-arroz-branco",
    name: "Arroz branco cozido",
    category: "CARBOHYDRATE",
    kcal_per_100g: 130,
    protein_g_per_100g: 2.6,
    fat_g_per_100g: 0.4,
    carb_g_per_100g: 28.0,
    calcium_mg_per_100g: 4,
    phosphorus_mg_per_100g: 35,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Carboidrato de digestão rápida e baixíssimo fósforo vegetal (ideal para nefropatas)",
  },
  {
    id: "ing-batata-doce",
    name: "Batata doce cozida sem casca",
    category: "CARBOHYDRATE",
    kcal_per_100g: 86,
    protein_g_per_100g: 1.4,
    fat_g_per_100g: 0.1,
    carb_g_per_100g: 20.0,
    calcium_mg_per_100g: 30,
    phosphorus_mg_per_100g: 47,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Carboidrato de baixo índice glicêmico e rico em fibras solúveis",
  },
  {
    id: "ing-mandioca",
    name: "Mandioca / Aipim cozido",
    category: "CARBOHYDRATE",
    kcal_per_100g: 160,
    protein_g_per_100g: 1.2,
    fat_g_per_100g: 0.3,
    carb_g_per_100g: 38.0,
    calcium_mg_per_100g: 16,
    phosphorus_mg_per_100g: 27,
    species: ["CANINE"],
    is_renal_safe: true,
    default_note: "Alta densidade energética com baixíssimo fósforo para cães ativos",
  },
  {
    id: "ing-aveia-cozida",
    name: "Aveia em flocos cozida em água",
    category: "CARBOHYDRATE",
    kcal_per_100g: 71,
    protein_g_per_100g: 2.5,
    fat_g_per_100g: 1.4,
    carb_g_per_100g: 12.0,
    calcium_mg_per_100g: 20,
    phosphorus_mg_per_100g: 75,
    species: ["CANINE"],
    is_renal_safe: false,
    default_note: "Rica em betaglucanas prebióticas para modulação da microbiota",
  },

  // --- VEGETAIS & FIBRAS ---
  {
    id: "ing-abobora-cabotia",
    name: "Abóbora cabotiá cozida",
    category: "VEGETABLE",
    kcal_per_100g: 35,
    protein_g_per_100g: 1.2,
    fat_g_per_100g: 0.5,
    carb_g_per_100g: 7.5,
    calcium_mg_per_100g: 18,
    phosphorus_mg_per_100g: 25,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Excelente fibra solúvel, alta palatabilidade e auxílio na excreção de ureia fecal",
  },
  {
    id: "ing-abobora-moranga",
    name: "Abóbora moranga cozida",
    category: "VEGETABLE",
    kcal_per_100g: 26,
    protein_g_per_100g: 1.0,
    fat_g_per_100g: 0.2,
    carb_g_per_100g: 6.0,
    calcium_mg_per_100g: 15,
    phosphorus_mg_per_100g: 20,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Volume gástrico com poucas calorias para saciedade saudável",
  },
  {
    id: "ing-cenoura-cozida",
    name: "Cenoura cozida picada",
    category: "VEGETABLE",
    kcal_per_100g: 35,
    protein_g_per_100g: 0.8,
    fat_g_per_100g: 0.2,
    carb_g_per_100g: 8.0,
    calcium_mg_per_100g: 30,
    phosphorus_mg_per_100g: 35,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Fonte de pró-vitamina A (betacaroteno) e fibras prebióticas",
  },
  {
    id: "ing-abobrinha-cozida",
    name: "Abobrinha italiana cozida",
    category: "VEGETABLE",
    kcal_per_100g: 17,
    protein_g_per_100g: 1.2,
    fat_g_per_100g: 0.2,
    carb_g_per_100g: 3.0,
    calcium_mg_per_100g: 15,
    phosphorus_mg_per_100g: 38,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Altíssimo teor hídrico (94%), ideal para hidratação e dietas de emagrecimento",
  },
  {
    id: "ing-chuchu-cozido",
    name: "Chuchu cozido em cubos",
    category: "VEGETABLE",
    kcal_per_100g: 19,
    protein_g_per_100g: 0.7,
    fat_g_per_100g: 0.1,
    carb_g_per_100g: 4.0,
    calcium_mg_per_100g: 12,
    phosphorus_mg_per_100g: 18,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Baixíssimo resíduo mineral e alta água funcional",
  },
  {
    id: "ing-brocolis-vapor",
    name: "Brócolis cozido no vapor",
    category: "VEGETABLE",
    kcal_per_100g: 35,
    protein_g_per_100g: 2.4,
    fat_g_per_100g: 0.4,
    carb_g_per_100g: 7.0,
    calcium_mg_per_100g: 47,
    phosphorus_mg_per_100g: 66,
    species: ["CANINE"],
    is_renal_safe: false,
    default_note: "Rico em sulforafano e fitoquímicos antioxidantes",
  },

  // --- VÍSCERAS ---
  {
    id: "ing-figado-frango",
    name: "Fígado de frango cozido",
    category: "ORGAN",
    kcal_per_100g: 167,
    protein_g_per_100g: 24.0,
    fat_g_per_100g: 6.5,
    carb_g_per_100g: 0.8,
    calcium_mg_per_100g: 18,
    phosphorus_mg_per_100g: 290,
    species: ["CANINE", "FELINE"],
    is_renal_safe: false, // Alto fósforo, limitar em renais
    default_note: "Vitamina A, complexo B, ferro e palatabilizante natural indispensável",
  },
  {
    id: "ing-figado-bovino",
    name: "Fígado bovino cozido",
    category: "ORGAN",
    kcal_per_100g: 175,
    protein_g_per_100g: 27.0,
    fat_g_per_100g: 5.0,
    carb_g_per_100g: 3.8,
    calcium_mg_per_100g: 6,
    phosphorus_mg_per_100g: 387,
    species: ["CANINE", "FELINE"],
    is_renal_safe: false,
    default_note: "Multivitamínico da natureza com altas doses de B12 e cobre",
  },
  {
    id: "ing-moela-frango",
    name: "Moela de frango cozida",
    category: "ORGAN",
    kcal_per_100g: 145,
    protein_g_per_100g: 28.0,
    fat_g_per_100g: 3.0,
    carb_g_per_100g: 0.0,
    calcium_mg_per_100g: 12,
    phosphorus_mg_per_100g: 150,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Víscera muscular magra rica em colágeno e textura mastigável",
  },

  // --- GORDURAS SAUDÁVEIS ---
  {
    id: "ing-azeite-oliva",
    name: "Azeite de oliva extravirgem",
    category: "FAT",
    kcal_per_100g: 884,
    protein_g_per_100g: 0.0,
    fat_g_per_100g: 100.0,
    carb_g_per_100g: 0.0,
    calcium_mg_per_100g: 1,
    phosphorus_mg_per_100g: 0,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Ácido oleico (ômega-9) e antioxidantes fenólicos",
  },
  {
    id: "ing-oleo-coco",
    name: "Óleo de coco extravirgem",
    category: "FAT",
    kcal_per_100g: 862,
    protein_g_per_100g: 0.0,
    fat_g_per_100g: 100.0,
    carb_g_per_100g: 0.0,
    calcium_mg_per_100g: 0,
    phosphorus_mg_per_100g: 0,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Triglicerídeos de cadeia média (TCM) de fácil absorção energética",
  },
  {
    id: "ing-banha-suina",
    name: "Banha suína pura culinária",
    category: "FAT",
    kcal_per_100g: 900,
    protein_g_per_100g: 0.0,
    fat_g_per_100g: 100.0,
    carb_g_per_100g: 0.0,
    calcium_mg_per_100g: 0,
    phosphorus_mg_per_100g: 0,
    species: ["CANINE", "FELINE"],
    is_renal_safe: true,
    default_note: "Gordura animal de alta palatabilidade e estabilidade térmica",
  },

  // --- RAÇÕES COMERCIAIS & ALIMENTOS INDUSTRIALIZADOS ---
  {
    id: "ing-racao-cao-adulto",
    name: "Ração Super Premium Adulto Cães",
    category: "COMMERCIAL_FEED",
    kcal_per_100g: 385,
    protein_g_per_100g: 26.0,
    fat_g_per_100g: 14.0,
    carb_g_per_100g: 40.0,
    calcium_mg_per_100g: 1200,
    phosphorus_mg_per_100g: 900,
    species: ["CANINE"],
    is_renal_safe: false,
    default_note: "Alimento completo extrusado seco para manutenção de cães adultos",
  },
  {
    id: "ing-racao-cao-renal",
    name: "Ração Seca Coadjuvante Renal Cães",
    category: "COMMERCIAL_FEED",
    kcal_per_100g: 390,
    protein_g_per_100g: 14.0,
    fat_g_per_100g: 18.0,
    carb_g_per_100g: 50.0,
    calcium_mg_per_100g: 700,
    phosphorus_mg_per_100g: 300,
    species: ["CANINE"],
    is_renal_safe: true,
    default_note: "Alimento com fósforo reduzido e proteína moderada de alto valor",
  },
  {
    id: "ing-racao-gato-adulto",
    name: "Ração Super Premium Adulto Gatos",
    category: "COMMERCIAL_FEED",
    kcal_per_100g: 400,
    protein_g_per_100g: 32.0,
    fat_g_per_100g: 16.0,
    carb_g_per_100g: 32.0,
    calcium_mg_per_100g: 1000,
    phosphorus_mg_per_100g: 800,
    species: ["FELINE"],
    is_renal_safe: false,
    default_note: "Alimento completo extrusado seco com taurina e acidificante urinário",
  },
  {
    id: "ing-racao-gato-renal",
    name: "Ração Seca Coadjuvante Renal Gatos",
    category: "COMMERCIAL_FEED",
    kcal_per_100g: 410,
    protein_g_per_100g: 28.0,
    fat_g_per_100g: 20.0,
    carb_g_per_100g: 35.0,
    calcium_mg_per_100g: 600,
    phosphorus_mg_per_100g: 350,
    species: ["FELINE"],
    is_renal_safe: true,
    default_note: "Alimento terapêutico com fósforo estritamente restrito e alta palatabilidade",
  },
  {
    id: "ing-sache-renal-gato",
    name: "Sachê Úmido Coadjuvante Renal Gatos",
    category: "COMMERCIAL_FEED",
    kcal_per_100g: 85,
    protein_g_per_100g: 7.5,
    fat_g_per_100g: 6.0,
    carb_g_per_100g: 4.0,
    calcium_mg_per_100g: 150,
    phosphorus_mg_per_100g: 90,
    species: ["FELINE"],
    is_renal_safe: true,
    default_note: "Alimento úmido terapêutico com 80% de umidade para hidratação ativa",
  },
];

export interface DietSummaryCalculation {
  totalGrams: number;
  totalKcal: number;
  gramsPerMeal: number;
  kcalPerMeal: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  proteinPercentEnergy: number;
  fatPercentEnergy: number;
  carbPercentEnergy: number;
  totalDebonedMeatGrams: number;
  recommendedCalciumCarbonateGrams: number;
  recommendedOmega3DoseMg: number;
  taurineRequired: boolean;
  estimatedPhosphorusMg: number;
  estimatedCalciumMg: number;
  estimatedCaPRatio: string;
}

export function getIngredientById(id: string): IngredientDefinition | undefined {
  return INGREDIENT_DATABASE.find((item) => item.id === id);
}

export function getIngredientByName(name: string): IngredientDefinition | undefined {
  const norm = name.toLowerCase().trim();
  return INGREDIENT_DATABASE.find((item) => {
    const itemNorm = item.name.toLowerCase();
    return itemNorm === norm || itemNorm.includes(norm) || norm.includes(itemNorm);
  });
}

/**
 * Calcula calorias e macronutrientes de um item individual do plano
 */
export function calculateItemNutrition(item: NutritionPlanItem): {
  kcal: number;
  protein_g: number;
  fat_g: number;
  carb_g: number;
  ca_mg: number;
  p_mg: number;
} {
  const matched = getIngredientByName(item.ingredient_name);
  const factor = item.quantity_grams / 100;

  if (matched) {
    return {
      kcal: Math.round(matched.kcal_per_100g * factor),
      protein_g: Number((matched.protein_g_per_100g * factor).toFixed(1)),
      fat_g: Number((matched.fat_g_per_100g * factor).toFixed(1)),
      carb_g: Number((matched.carb_g_per_100g * factor).toFixed(1)),
      ca_mg: Math.round(matched.calcium_mg_per_100g * factor),
      p_mg: Math.round(matched.phosphorus_mg_per_100g * factor),
    };
  }

  // Estimativa de fallback se for ingrediente livre não catalogado
  const kcalPer100 = item.kcal_per_100g || 140;
  return {
    kcal: Math.round(kcalPer100 * factor),
    protein_g: Number((20 * factor).toFixed(1)),
    fat_g: Number((5 * factor).toFixed(1)),
    carb_g: Number((5 * factor).toFixed(1)),
    ca_mg: Math.round(15 * factor),
    p_mg: Math.round(150 * factor),
  };
}

/**
 * Calcula o sumário completo da dieta formulada
 */
export function calculateDietSummary(params: {
  items: NutritionPlanItem[];
  mealsPerDay: number;
  species: Species;
  weightKg: number;
  isRenalPatient?: boolean;
}): DietSummaryCalculation {
  const { items, mealsPerDay, species, weightKg, isRenalPatient = false } = params;

  let totalGrams = 0;
  let totalKcal = 0;
  let proteinGrams = 0;
  let fatGrams = 0;
  let carbGrams = 0;
  let estimatedCalciumMg = 0;
  let estimatedPhosphorusMg = 0;
  let totalDebonedMeatGrams = 0;

  items.forEach((item) => {
    totalGrams += item.quantity_grams;
    const nut = calculateItemNutrition(item);
    totalKcal += nut.kcal;
    proteinGrams += nut.protein_g;
    fatGrams += nut.fat_g;
    carbGrams += nut.carb_g;
    estimatedCalciumMg += nut.ca_mg;
    estimatedPhosphorusMg += nut.p_mg;

    const matched = getIngredientByName(item.ingredient_name);
    if (matched && (matched.category === 'PROTEIN' || matched.category === 'ORGAN')) {
      totalDebonedMeatGrams += item.quantity_grams;
    } else if (item.category === 'PROTEIN' || item.category === 'ORGAN') {
      totalDebonedMeatGrams += item.quantity_grams;
    }
  });

  const meals = Math.max(1, mealsPerDay);
  const gramsPerMeal = Math.round(totalGrams / meals);
  const kcalPerMeal = Math.round(totalKcal / meals);

  // Calorias por macronutriente (Atwater modificado: Proteína 3.5-4, Gordura 8.5-9, Carb 3.5-4)
  const proteinKcal = proteinGrams * 4.0;
  const fatKcal = fatGrams * 9.0;
  const carbKcal = carbGrams * 4.0;
  const sumNutKcal = proteinKcal + fatKcal + carbKcal || 1;

  const proteinPercentEnergy = Math.round((proteinKcal / sumNutKcal) * 100);
  const fatPercentEnergy = Math.round((fatKcal / sumNutKcal) * 100);
  const carbPercentEnergy = Math.round((carbKcal / sumNutKcal) * 100);

  // Recomendação zootécnica de Carbonato de Cálcio (ou casca de ovo em pó)
  // Regra clássica: 1.0g de Carbonato de Cálcio puro (aprox 400mg Ca elementar) para cada 100g de carne desossada.
  const recommendedCalciumCarbonateGrams = Number(
    ((totalDebonedMeatGrams / 100) * 1.0).toFixed(1)
  );

  // Suplementação com Carbonato de Cálcio adiciona 400mg Ca elementar por grama
  const calciumAddedWithSupplement = recommendedCalciumCarbonateGrams * 400;
  const finalCa = estimatedCalciumMg + calciumAddedWithSupplement;
  const finalP = estimatedPhosphorusMg || 1;
  const caToPRatio = (finalCa / finalP).toFixed(1) + " : 1";

  // Ômega-3 (EPA + DHA) dosagem recomendada:
  // Manutenção: 40-50 mg/kg
  // Suporte renal ou anti-inflamatório articular: 100-140 mg/kg
  const omegaDosePerKg = isRenalPatient ? 100 : (species === 'CANINE' ? 40 : 50);
  const recommendedOmega3DoseMg = Math.round(weightKg * omegaDosePerKg);

  // Taurina: obrigatória para gatos se houver ingredientes de preparo caseiro
  const hasHomemadeIngredients = items.some((i) => {
    const matched = getIngredientByName(i.ingredient_name);
    return !matched || matched.category !== 'COMMERCIAL_FEED';
  });
  const taurineRequired = species === 'FELINE' && hasHomemadeIngredients;

  return {
    totalGrams,
    totalKcal,
    gramsPerMeal,
    kcalPerMeal,
    proteinGrams: Number(proteinGrams.toFixed(1)),
    fatGrams: Number(fatGrams.toFixed(1)),
    carbGrams: Number(carbGrams.toFixed(1)),
    proteinPercentEnergy,
    fatPercentEnergy,
    carbPercentEnergy,
    totalDebonedMeatGrams,
    recommendedCalciumCarbonateGrams,
    recommendedOmega3DoseMg,
    taurineRequired,
    estimatedPhosphorusMg,
    estimatedCalciumMg: finalCa,
    estimatedCaPRatio: caToPRatio,
  };
}

/**
 * Cria preset automático com base na espécie, peso, calorias e condição clínica
 */
export function generateDietPreset(params: {
  species: Species;
  weightKg: number;
  merKcal: number;
  feedingType: FeedingType;
  clinicalCondition: 'MAINTENANCE' | 'WEIGHT_LOSS' | 'RENAL_SUPPORT';
}): {
  title: string;
  items: NutritionPlanItem[];
  supplements: string[];
  mealsPerDay: number;
  hydrationTargetMl: number;
  transitionDays: number;
  notes: string;
} {
  const { species, weightKg, merKcal, feedingType, clinicalCondition } = params;

  if (feedingType === 'COMMERCIAL_DRY') {
    const isRenal = clinicalCondition === 'RENAL_SUPPORT';
    const feed = INGREDIENT_DATABASE.find(
      (i) => i.species.includes(species) && (isRenal ? i.is_renal_safe : !i.is_renal_safe) && i.category === 'COMMERCIAL_FEED' && !i.name.includes('Sachê')
    ) || INGREDIENT_DATABASE[INGREDIENT_DATABASE.length - 2];

    const gramsNeeded = Math.round((merKcal / feed.kcal_per_100g) * 100);
    const meals = species === 'FELINE' ? 3 : 2;

    return {
      title: isRenal
        ? `Protocolo de Ração Coadjuvante Renal (${species === 'CANINE' ? 'Canino' : 'Felino'})`
        : `Manejo com Ração Comercial Super Premium (${species === 'CANINE' ? 'Canino' : 'Felino'})`,
      items: [
        {
          ingredient_name: feed.name,
          quantity_grams: gramsNeeded,
          category: 'COMMERCIAL_FEED',
          kcal_per_100g: feed.kcal_per_100g,
          notes: feed.default_note,
        },
      ],
      supplements: [
        `Ômega-3 EPA+DHA: ${Math.round(weightKg * (isRenal ? 100 : 40))} mg/dia`,
        "Água limpa e filtrada ofertada em múltiplas tigelas ou fonte corrente",
      ],
      mealsPerDay: meals,
      hydrationTargetMl: Math.round(merKcal * 1.0),
      transitionDays: 7,
      notes: "Dividir a ração seca rigorosamente na balança de precisão culinária. Nunca deixar o alimento exposto o dia todo no comedouro.",
    };
  }

  if (feedingType === 'MIXED_FEEDING') {
    // 50% Ração + 50% AN Cozida
    const kcalHalf = Math.round(merKcal * 0.5);
    const feed = INGREDIENT_DATABASE.find(
      (i) => i.species.includes(species) && i.category === 'COMMERCIAL_FEED' && !i.name.includes('Sachê')
    )!;
    const feedGrams = Math.round((kcalHalf / feed.kcal_per_100g) * 100);

    const protein = species === 'FELINE'
      ? INGREDIENT_DATABASE.find((i) => i.id === 'ing-frango-peito')!
      : INGREDIENT_DATABASE.find((i) => i.id === 'ing-frango-peito')!;
    const veg = INGREDIENT_DATABASE.find((i) => i.id === 'ing-abobora-cabotia')!;

    // 70% da AN em proteína e 30% em abóbora
    const protKcal = Math.round(kcalHalf * 0.7);
    const vegKcal = Math.round(kcalHalf * 0.3);
    const protGrams = Math.round((protKcal / protein.kcal_per_100g) * 100);
    const vegGrams = Math.round((vegKcal / veg.kcal_per_100g) * 100);

    return {
      title: `Dieta Mista Balanceada (50% Ração Comercial + 50% Alimento Úmido Natural)`,
      items: [
        {
          ingredient_name: feed.name,
          quantity_grams: feedGrams,
          category: 'COMMERCIAL_FEED',
          kcal_per_100g: feed.kcal_per_100g,
          notes: "Aporte de micronutrientes equilibrados pela ração extrusada",
        },
        {
          ingredient_name: protein.name,
          quantity_grams: protGrams,
          category: 'PROTEIN',
          kcal_per_100g: protein.kcal_per_100g,
          notes: "Proteína fresca cozida para saciedade e digestibilidade",
        },
        {
          ingredient_name: veg.name,
          quantity_grams: vegGrams,
          category: 'VEGETABLE',
          kcal_per_100g: veg.kcal_per_100g,
          notes: "Fibras funcionais para saúde do trato gastrointestinal",
        },
      ],
      supplements: [
        "Carbonato de Cálcio 1.0g para cada 100g de carne natural oferecida",
        `Ômega-3 (EPA/DHA): ${Math.round(weightKg * 50)} mg/dia`,
      ],
      mealsPerDay: 2,
      hydrationTargetMl: Math.round(merKcal * 1.0),
      transitionDays: 7,
      notes: "A ração e a alimentação natural podem ser fornecidas em refeições separadas ou combinadas no mesmo horário.",
    };
  }

  // ALIMENTAÇÃO NATURAL COZIDA
  if (species === 'FELINE') {
    if (clinicalCondition === 'RENAL_SUPPORT') {
      // Felino renal: ex. Raposo Tavares (220 kcal)
      // 60% frango + 20% tilápia + 10% arroz branco + 10% abóbora cabotiá + 2g azeite
      return {
        title: "Protocolo Nutricional para Suporte e Proteção Renal Felina",
        items: [
          {
            ingredient_name: "Peito de frango cozido desfiado",
            quantity_grams: 75,
            category: "PROTEIN",
            kcal_per_100g: 165,
            notes: "Proteína nobre de baixo resíduo e excelente digestibilidade",
          },
          {
            ingredient_name: "Filé de tilápia cozido no vapor",
            quantity_grams: 35,
            category: "PROTEIN",
            kcal_per_100g: 120,
            notes: "Proteína leve com perfil lipídico favorável e baixo fósforo",
          },
          {
            ingredient_name: "Arroz branco cozido",
            quantity_grams: 30,
            category: "CARBOHYDRATE",
            kcal_per_100g: 130,
            notes: "Fonte limpa de energia com baixíssimo fósforo vegetal",
          },
          {
            ingredient_name: "Abóbora cabotiá cozida",
            quantity_grams: 25,
            category: "VEGETABLE",
            kcal_per_100g: 35,
            notes: "Fibra solúvel para redução de toxinas urêmicas entéricas",
          },
          {
            ingredient_name: "Azeite de oliva extravirgem",
            quantity_grams: 2,
            category: "FAT",
            kcal_per_100g: 884,
            notes: "Aporte de ácidos graxos monoinsaturados e densidade calórica",
          },
        ],
        supplements: [
          "Carbonato de Cálcio Micronizado: 1.1g ao dia misturado na carne (balanceador Ca:P e quelante intestinal de fósforo)",
          "Taurina 500mg ao dia (aminoácido essencial para manutenção miocárdica e retiniana)",
          `Ômega-3 alta concentração (EPA+DHA ${Math.round(weightKg * 100)}mg) - ação anti-inflamatória renal`,
          "Suplemento vitamínico e mineral quelatado específico para felinos renais (isento de fósforo adicionado)",
        ],
        mealsPerDay: 3,
        hydrationTargetMl: Math.max(250, Math.round(merKcal * 1.1)),
        transitionDays: 10,
        notes: "Restrição terapêutica de fósforo com monitoramento sérico periódico. Servir levemente amornado para realçar aromas e estimular o apetite.",
      };
    } else {
      // Felino Manutenção
      return {
        title: "Alimentação Natural Cozida Balanceada para Felinos Adultos",
        items: [
          {
            ingredient_name: "Peito de frango cozido desfiado",
            quantity_grams: 80,
            category: "PROTEIN",
            kcal_per_100g: 165,
            notes: "Proteína de alto valor biológico",
          },
          {
            ingredient_name: "Fígado de frango cozido",
            quantity_grams: 10,
            category: "ORGAN",
            kcal_per_100g: 167,
            notes: "Aporte natural de vitamina A e complexo B",
          },
          {
            ingredient_name: "Arroz branco cozido",
            quantity_grams: 20,
            category: "CARBOHYDRATE",
            kcal_per_100g: 130,
            notes: "Digestão suave",
          },
          {
            ingredient_name: "Abobrinha italiana cozida",
            quantity_grams: 20,
            category: "VEGETABLE",
            kcal_per_100g: 17,
            notes: "Hidratação e fibra para prevenção de bolas de pelos",
          },
          {
            ingredient_name: "Azeite de oliva extravirgem",
            quantity_grams: 2,
            category: "FAT",
            kcal_per_100g: 884,
            notes: "Ácidos graxos essenciais",
          },
        ],
        supplements: [
          "Carbonato de Cálcio: 1.0g ao dia (balanceador Ca:P)",
          "Taurina 500mg/dia (obrigatória para felinos)",
          `Ômega-3 EPA+DHA: ${Math.round(weightKg * 50)}mg/dia`,
          "Complexo vitamínico completo para felinos",
        ],
        mealsPerDay: 3,
        hydrationTargetMl: Math.round(merKcal * 1.1),
        transitionDays: 7,
        notes: "Gatos são carnívoros estritos. Manter alta umidade e variedade de fontes proteicas.",
      };
    }
  }

  // CANINO
  if (clinicalCondition === 'WEIGHT_LOSS') {
    // Cão em emagrecimento: alta proteína, alta fibra, baixo carboidrato
    const meatGrams = Math.round((merKcal * 0.55 / 165) * 100);
    const vegGrams = Math.round((merKcal * 0.30 / 25) * 100);
    const carbGrams = Math.round((merKcal * 0.15 / 130) * 100);

    return {
      title: "Plano Dietético de Saciedade para Emagrecimento Saudável Canino",
      items: [
        {
          ingredient_name: "Peito de frango cozido desfiado",
          quantity_grams: meatGrams,
          category: "PROTEIN",
          kcal_per_100g: 165,
          notes: "Preserva a massa muscular magra durante o déficit calórico",
        },
        {
          ingredient_name: "Abobrinha italiana cozida",
          quantity_grams: Math.round(vegGrams * 0.6),
          category: "VEGETABLE",
          kcal_per_100g: 17,
          notes: "Grande volume gástrico com pouquíssimas calorias",
        },
        {
          ingredient_name: "Abóbora moranga cozida",
          quantity_grams: Math.round(vegGrams * 0.4),
          category: "VEGETABLE",
          kcal_per_100g: 26,
          notes: "Fibras para desacelerar o esvaziamento gástrico e manter saciedade",
        },
        {
          ingredient_name: "Arroz branco cozido",
          quantity_grams: carbGrams,
          category: "CARBOHYDRATE",
          kcal_per_100g: 130,
          notes: "Energia controlada para sustentar atividade física",
        },
      ],
      supplements: [
        `Carbonato de cálcio: ${Number(((meatGrams / 100) * 1.0).toFixed(1))}g/dia`,
        `Ômega-3 EPA+DHA: ${Math.round(weightKg * 50)}mg/dia (ação anti-inflamatória)`,
        "Suplemento vitamínico e mineral completo para cães adultos",
      ],
      mealsPerDay: 2,
      hydrationTargetMl: Math.round(merKcal * 1.2),
      transitionDays: 7,
      notes: "Pesar todas as porções rigorosamente após o cozimento. Petiscos devem ser substituídos por chuchu ou abobrinha crua crocante.",
    };
  }

  // Cão manutenção (ex. Kate 14.5kg, ~580 kcal)
  return {
    title: "Plano Nutricional Balanceado para Manutenção de Peso Adulto",
    items: [
      {
        ingredient_name: "Peito de frango cozido desfiado",
        quantity_grams: 180,
        category: "PROTEIN",
        kcal_per_100g: 165,
        notes: "Proteína magra nobre de altíssima digestibilidade",
      },
      {
        ingredient_name: "Arroz branco cozido",
        quantity_grams: 130,
        category: "CARBOHYDRATE",
        kcal_per_100g: 130,
        notes: "Fonte de energia de fácil digestão",
      },
      {
        ingredient_name: "Abóbora moranga cozida",
        quantity_grams: 90,
        category: "VEGETABLE",
        kcal_per_100g: 26,
        notes: "Fibras solúveis para saúde intestinal",
      },
      {
        ingredient_name: "Cenoura cozida picada",
        quantity_grams: 60,
        category: "VEGETABLE",
        kcal_per_100g: 35,
        notes: "Betacaroteno e palatabilidade",
      },
      {
        ingredient_name: "Azeite de oliva extravirgem",
        quantity_grams: 4,
        category: "FAT",
        kcal_per_100g: 884,
        notes: "Ácidos graxos monoinsaturados",
      },
    ],
    supplements: [
      "Suplemento vitamínico e mineral completo para cães adultos",
      `Ômega 3 (EPA + DHA ${Math.round(weightKg * 40)}mg) - 1 cápsula a cada 24h`,
      "Carbonato de Cálcio 1.8g ao dia (balanceador Ca:P 1.2:1 com o fósforo das carnes)",
    ],
    mealsPerDay: 2,
    hydrationTargetMl: Math.round(merKcal * 1.2),
    transitionDays: 7,
    notes: "Dieta formulada para manutenção da condição corporal com excelente digestibilidade.",
  };
}

/**
 * Gera mensagem formatada para WhatsApp direcionada ao Tutor
 */
export function generateWhatsAppDietMessage(params: {
  plan: NutritionPlan;
  patient: Patient;
  tutor: Tutor;
  professionalName?: string;
  crmv?: string;
}): string {
  const { plan, patient, tutor, professionalName = "Dra. Veronica Correia Pitorri", crmv = "CRMV-SP 41403" } = params;

  const totalGrams = plan.items.reduce((acc, i) => acc + i.quantity_grams, 0);
  const gramsPerMeal = Math.round(totalGrams / plan.meals_per_day);
  const speciesLabel = patient.species === 'CANINE' ? 'cão' : 'gato';

  const itemsList = plan.items
    .map((item) => `  ▫️ *${item.ingredient_name}*: ${item.quantity_grams}g`)
    .join("\n");

  const supplementsList = plan.supplements
    .map((sup) => `  💊 ${sup}`)
    .join("\n");

  const message = `🌿 *ESSÊNCIA NUTRI PET* • Prescrição Nutricional Personalizada

Olá, *${tutor.name.split(" ")[0]}*! Tudo bem?
Aqui está o cardápio e plano alimentar aprovado para o(a) *${patient.name}* (${patient.current_weight_kg} kg).

📋 *${plan.title}*
• *Modalidade:* ${plan.feeding_type === 'NATURAL_COOKED' ? 'Alimentação Natural Cozida' : plan.feeding_type === 'MIXED_FEEDING' ? 'Dieta Mista (Ração + Natural)' : 'Ração Comercial Orientada'}
• *Meta Calórica:* ${plan.daily_energy_kcal} kcal/dia
• *Frequência:* Dividir em *${plan.meals_per_day} refeições ao dia*
• *Porção por refeição:* ~*${gramsPerMeal}g* por porção
• *Meta Hídrica:* *${plan.hydration_target_ml_day} mL/dia* de água fresca

⚖️ *QUANTIDADE DIÁRIA (PESO DOS ALIMENTOS JÁ COZIDOS):*
${itemsList}
*Volume Diário Total:* ${totalGrams}g/dia

✨ *SUPLEMENTAÇÃO E BALANCEAMENTO OBRIGATÓRIO:*
${supplementsList}

⚠️ *INSTRUÇÕES ESSENCIAIS DE PREPARO:*
1. *Pesagem:* Sempre pese os ingredientes *após o cozimento*, escorridos e mornos/frios.
2. *Temperos proibidos:* Jamais use cebola, alho, cebolinha, alho-poró, pimentas ou caldos prontos (são tóxicos para ${speciesLabel}s!). Cozinhe em água ou vapor com uma pitadinha muito leve de sal marinho iodado, se recomendado.
3. *Suplementos:* Misture os suplementos e o carbonato de cálcio *na hora de servir*, com o prato já morno ou frio (o calor excessivo desnatura as vitaminas).
4. *Armazenamento:* As porções diárias podem ser congeladas em potes individuais etiquetados por até 30 dias no freezer. Para consumo, descongele sob refrigeração e consuma em até 48 a 72 horas.
5. *Transição:* Se estiver trocando de ração para alimento natural, faça a transição em ${plan.transition_plan_days || 7} dias gradativamente.

Qualquer dúvida no preparo, estou à disposição! 🐾💚

Responsável Técnico:
*${professionalName}*
${crmv}
Essência Nutri Pet`;

  return message;
}

/**
 * Gera código HTML para impressão do Cartão de Receita (Geladeira / Pasta do Pet)
 */
export function generatePrintableRecipeCardHtml(params: {
  plan: NutritionPlan;
  patient: Patient;
  tutor: Tutor;
  professionalName?: string;
  crmv?: string;
}): string {
  const { plan, patient, tutor, professionalName = "Dra. Veronica Correia Pitorri", crmv = "CRMV-SP 41403" } = params;
  const totalGrams = plan.items.reduce((acc, i) => acc + i.quantity_grams, 0);
  const gramsPerMeal = Math.round(totalGrams / plan.meals_per_day);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Receita Nutricional - ${patient.name}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body class="bg-white p-6 max-w-3xl mx-auto font-sans text-slate-900 text-xs">
  <div class="mb-4 flex justify-between items-center print:hidden">
    <button onclick="window.close()" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold cursor-pointer">
      Fechar Janela
    </button>
    <button onclick="window.print()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm">
      🖨️ Imprimir Cartão de Receita
    </button>
  </div>

  <div class="border-2 border-emerald-600 rounded-2xl p-6 bg-gradient-to-b from-emerald-50/40 to-white">
    <!-- Header -->
    <div class="flex justify-between items-start border-b border-emerald-200 pb-4 mb-4">
      <div>
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base">
            🌿
          </div>
          <div>
            <h1 class="text-xl font-extrabold text-emerald-950">Essência Nutri Pet</h1>
            <p class="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Cartão de Receita e Manejo Nutricional</p>
          </div>
        </div>
      </div>
      <div class="text-right">
        <span class="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
          Versão v${plan.version}.0 Ativa
        </span>
        <p class="text-[10px] text-slate-400 mt-1">Data: ${new Date(plan.approved_at).toLocaleDateString("pt-BR")}</p>
      </div>
    </div>

    <!-- Identificação -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 mb-4 text-xs">
      <div>
        <span class="text-[10px] text-slate-400 uppercase font-bold block">Paciente</span>
        <strong class="text-slate-800 text-sm">${patient.name}</strong> (${patient.species === 'CANINE' ? 'Canino' : 'Felino'})
      </div>
      <div>
        <span class="text-[10px] text-slate-400 uppercase font-bold block">Tutor(a)</span>
        <strong class="text-slate-800">${tutor.name}</strong>
      </div>
      <div>
        <span class="text-[10px] text-slate-400 uppercase font-bold block">Peso Atual</span>
        <strong class="text-slate-800">${patient.current_weight_kg} kg</strong> (ECC ${patient.current_bcs}/9)
      </div>
      <div>
        <span class="text-[10px] text-slate-400 uppercase font-bold block">Meta Calórica</span>
        <strong class="text-emerald-700 text-sm">${plan.daily_energy_kcal} kcal/dia</strong>
      </div>
    </div>

    <!-- Resumo de Servir -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
        <span class="text-[10px] text-emerald-800 font-bold uppercase block">Volume Diário</span>
        <span class="text-lg font-black text-emerald-900">${totalGrams} g/dia</span>
      </div>
      <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
        <span class="text-[10px] text-emerald-800 font-bold uppercase block">Por Refeição (${plan.meals_per_day}x)</span>
        <span class="text-lg font-black text-emerald-900">~${gramsPerMeal} g</span>
      </div>
      <div class="bg-cyan-50 border border-cyan-200 p-3 rounded-xl text-center">
        <span class="text-[10px] text-cyan-800 font-bold uppercase block">Meta de Água</span>
        <span class="text-lg font-black text-cyan-900">${plan.hydration_target_ml_day} mL/dia</span>
      </div>
    </div>

    <!-- Tabela de Alimentos -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
      <div class="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-[11px] uppercase tracking-wider flex justify-between">
        <span>Alimento (Pesado após Cozimento)</span>
        <span>Quantidade / Dia</span>
      </div>
      <table class="w-full text-left text-xs">
        <tbody class="divide-y divide-slate-100">
          ${plan.items.map(i => `
            <tr class="hover:bg-slate-50">
              <td class="px-4 py-2.5 font-semibold text-slate-800">
                ${i.ingredient_name}
                ${i.notes ? `<span class="block text-[10px] font-normal text-slate-400">${i.notes}</span>` : ''}
              </td>
              <td class="px-4 py-2.5 text-right font-extrabold text-slate-900 text-sm">
                ${i.quantity_grams} g
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Suplementação -->
    <div class="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 mb-4">
      <h3 class="font-bold text-amber-900 text-xs uppercase tracking-wider mb-2">
        💊 Suplementação Diária Obrigatória
      </h3>
      <ul class="space-y-1 text-xs text-amber-950 font-medium">
        ${plan.supplements.map(s => `
          <li class="flex items-start">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2 shrink-0"></span>
            <span>${s}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <!-- Dicas e Observações -->
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 mb-4">
      <strong class="text-slate-800 block mb-1">Orientações do Especialista:</strong>
      <p>${plan.notes || "Não fornecer petiscos industrializados ou alimentos condimentados. Manter acompanhamento do peso corporal semanalmente."}</p>
    </div>

    <!-- Rodapé e Assinatura -->
    <div class="flex justify-between items-end pt-3 border-t border-slate-200 text-[10px] text-slate-400">
      <div>
        <p>Essência Nutri Pet • Prescrição Nutricional Supervisionada</p>
        <p>Dúvidas e orientações: contato com a equipe clínica</p>
      </div>
      <div class="text-right">
        <strong class="text-slate-700 text-xs block">${professionalName}</strong>
        <span>${crmv}</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}
