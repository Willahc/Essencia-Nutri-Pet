import { 
  Patient, 
  NutritionPlan, 
  NutritionPlanItem, 
  ExamDocument, 
  Species 
} from "@/types";
import { INGREDIENT_DATABASE, IngredientDefinition } from "@/lib/diet-formulation";
import { calculateEnergyRequirements, getSuggestedPhysiologicalState } from "@/lib/nutrition-calc";

export interface AutoFormulationResult {
  planDraft: NutritionPlan;
  macroPercentages: {
    protein: number;
    carbohydrate: number;
    vegetables: number;
    fatAndSupplements: number;
  };
  clinicalProfileDetected: {
    isRenal: boolean;
    isOverweight: boolean;
    isOsteoarticular: boolean;
    isAllergic: boolean;
    allergensFound: string[];
    isCardiac: boolean;
    isHepatic: boolean;
  };
  clinicalRationale: string[];
  suggestedSupplements: string[];
}

/**
 * Motor Inteligente de Auto-Formulação de Dietas por IA / Zootecnia
 * Calcula e gera uma receita personalizada equilibrada (prato diário) em gramas exatas para o paciente.
 */
export function autoFormulateDiet(
  patient: Patient,
  exams: ExamDocument[] = [],
  customDailyKcal?: number,
  mealsPerDay: number = 2
): AutoFormulationResult {
  const species = patient.species;
  const currentWeight = patient.current_weight_kg || 10;
  const bcs = patient.current_bcs || 5;

  // 1. Detecta condições clínicas do paciente
  const comorbiditiesStr = (patient.comorbidities || []).join(" ").toLowerCase();
  const allergiesStr = (patient.allergies || []).join(" ").toLowerCase();
  const allergens = (patient.allergies || []).filter(Boolean);

  // Analisa se há azotemia/renopatia nos laudos
  const hasLabAzotemia = exams.some((ex) =>
    (ex.extracted_results || []).some((r) => {
      const p = r.parameter.toLowerCase();
      const val = typeof r.value === "number" ? r.value : parseFloat(String(r.value).replace(",", "."));
      if (isNaN(val)) return false;
      if (p.includes("creatinin") && val > (species === "FELINE" ? 1.6 : 1.4)) return true;
      if (p.includes("fósforo") && val > 5.5) return true;
      return false;
    })
  );

  const isRenal =
    hasLabAzotemia ||
    comorbiditiesStr.includes("renal") ||
    comorbiditiesStr.includes("iris") ||
    comorbiditiesStr.includes("azotemia");

  const isOverweight = bcs >= 6 || comorbiditiesStr.includes("sobrepeso") || comorbiditiesStr.includes("obesidade");
  const isOsteoarticular =
    comorbiditiesStr.includes("artrose") ||
    comorbiditiesStr.includes("displasia") ||
    comorbiditiesStr.includes("discopatia") ||
    comorbiditiesStr.includes("tplo");
  const isCardiac =
    comorbiditiesStr.includes("cardíac") ||
    comorbiditiesStr.includes("taquicardia") ||
    comorbiditiesStr.includes("arritmia") ||
    comorbiditiesStr.includes("ecg");
  const isHepatic =
    comorbiditiesStr.includes("hepátic") ||
    comorbiditiesStr.includes("colestase") ||
    comorbiditiesStr.includes("alt") ||
    comorbiditiesStr.includes("fígado");
  const isAllergic = allergens.length > 0 || allergiesStr.includes("alerg") || allergiesStr.includes("hipersensibilidade");

  // 2. Calcula as calorias necessárias (MER / NEM)
  let targetKcal = customDailyKcal;
  if (!targetKcal || targetKcal <= 0) {
    const suggestedState = getSuggestedPhysiologicalState(species, bcs, patient.is_neutered);
    const energy = calculateEnergyRequirements({
      species,
      weightKg: currentWeight,
      bcs,
      state: suggestedState,
      customIdealWeightKg: patient.ideal_weight_kg,
    });
    targetKcal = energy.mer_kcal_day;
  }

  // 3. Define proporções macro zootécnicas ideais no prato
  let proteinRatio = 0.45;
  let carbRatio = 0.25;
  let vegRatio = 0.25;
  let fatRatio = 0.05;

  const rationale: string[] = [];

  if (species === "FELINE") {
    // Felinos: Carnívoros estritos. Alto teor proteico, carboidratos mínimos.
    if (isRenal) {
      proteinRatio = 0.55;
      carbRatio = 0.15;
      vegRatio = 0.25;
      fatRatio = 0.05;
      rationale.push("Felino Renal: Proteína de altíssimo valor biológico com restrição estrita de fósforo e umidade elevada.");
    } else {
      proteinRatio = 0.65;
      carbRatio = 0.10;
      vegRatio = 0.20;
      fatRatio = 0.05;
      rationale.push("Metabolismo Felino: Carnívoro estrito com alta densidade proteica e reduzido teor de carboidratos.");
    }
  } else {
    // Caninos
    if (isRenal) {
      proteinRatio = 0.35;
      carbRatio = 0.35;
      vegRatio = 0.25;
      fatRatio = 0.05;
      rationale.push("Nefropatia Canina: Modulação proteica com predominância de clara de ovo e fontes com baixo teor natural de fósforo.");
    } else if (isOverweight) {
      proteinRatio = 0.45;
      carbRatio = 0.15;
      vegRatio = 0.35;
      fatRatio = 0.05;
      rationale.push("Controle Ponderal (ECC elevado): Aumento de fibras vegetais sacietógenas (abóbora/chuchu) e redução de amido.");
    } else if (isOsteoarticular) {
      proteinRatio = 0.45;
      carbRatio = 0.25;
      vegRatio = 0.25;
      fatRatio = 0.05;
      rationale.push("Suporte Osteoarticular: Densidade energética equilibrada para evitar sobrecarga nas articulações e adição de lipídios ômega-3.");
    } else {
      rationale.push("Manutenção Fisiológica Adulta: Proporções ancestrais equilibradas segundo as diretrizes NRC 2006.");
    }
  }

  // 4. Seleciona os melhores ingredientes do banco
  const avoidChicken = allergens.some((a) => a.toLowerCase().includes("frango") || a.toLowerCase().includes("ave"));
  const avoidBeef = allergens.some((a) => a.toLowerCase().includes("bov") || a.toLowerCase().includes("carne"));

  // Seleção de Proteínas
  const selectedProteins: { ing: IngredientDefinition; weightShare: number }[] = [];
  if (isRenal) {
    // Clara de ovo é obrigatória para renal pelo baixo fósforo
    const eggWhite = INGREDIENT_DATABASE.find((i) => i.id === "ing-clara-ovo")!;
    const primaryMeat = avoidChicken
      ? INGREDIENT_DATABASE.find((i) => i.id === "ing-tilapia-file")!
      : INGREDIENT_DATABASE.find((i) => i.id === "ing-frango-peito")!;
    selectedProteins.push({ ing: primaryMeat, weightShare: 0.60 });
    selectedProteins.push({ ing: eggWhite, weightShare: 0.40 });
    rationale.push(`Proteínas selecionadas: ${primaryMeat.name} + ${eggWhite.name} (baixa carga de fósforo sérico).`);
  } else if (isAllergic) {
    // Proteína única hipoalergênica
    const novelMeat = INGREDIENT_DATABASE.find((i) => i.id === "ing-coelho-carne") ||
      INGREDIENT_DATABASE.find((i) => i.id === "ing-tilapia-file") ||
      INGREDIENT_DATABASE.find((i) => i.id === "ing-cordeiro-carne")!;
    selectedProteins.push({ ing: novelMeat, weightShare: 1.0 });
    rationale.push(`Proteína hipoalergênica de exclusão: ${novelMeat.name}.`);
  } else if (isOverweight) {
    const leanMeat = avoidChicken
      ? INGREDIENT_DATABASE.find((i) => i.id === "ing-tilapia-file")!
      : INGREDIENT_DATABASE.find((i) => i.id === "ing-frango-peito")!;
    selectedProteins.push({ ing: leanMeat, weightShare: 1.0 });
  } else {
    // Padrão: Frango ou Bovino
    const defMeat = avoidChicken
      ? INGREDIENT_DATABASE.find((i) => i.id === "ing-carne-patinho")!
      : INGREDIENT_DATABASE.find((i) => i.id === "ing-frango-peito")!;
    selectedProteins.push({ ing: defMeat, weightShare: 1.0 });
  }

  // Seleção de Carboidratos
  let selectedCarb: IngredientDefinition;
  if (isRenal) {
    selectedCarb = INGREDIENT_DATABASE.find((i) => i.id === "ing-arroz-branco")!; // Baixíssimo fósforo
  } else if (isOverweight) {
    selectedCarb = INGREDIENT_DATABASE.find((i) => i.id === "ing-batata-doce")!; // Baixo IG e mais fibra
  } else {
    selectedCarb = INGREDIENT_DATABASE.find((i) => i.id === "ing-batata-doce") ||
      INGREDIENT_DATABASE.find((i) => i.id === "ing-arroz-branco")!;
  }

  // Seleção de Vegetais
  const selectedVeggies: { ing: IngredientDefinition; share: number }[] = [];
  if (isRenal) {
    const chuchu = INGREDIENT_DATABASE.find((i) => i.id === "ing-chuchu")!;
    const abobrinha = INGREDIENT_DATABASE.find((i) => i.id === "ing-abobrinha")!;
    selectedVeggies.push({ ing: chuchu, share: 0.60 });
    selectedVeggies.push({ ing: abobrinha, share: 0.40 });
  } else if (isOverweight) {
    const abobora = INGREDIENT_DATABASE.find((i) => i.id === "ing-abobora-moranga")!;
    const chuchu = INGREDIENT_DATABASE.find((i) => i.id === "ing-chuchu")!;
    selectedVeggies.push({ ing: abobora, share: 0.50 });
    selectedVeggies.push({ ing: chuchu, share: 0.50 });
  } else {
    const abobora = INGREDIENT_DATABASE.find((i) => i.id === "ing-abobora-moranga")!;
    const cenoura = INGREDIENT_DATABASE.find((i) => i.id === "ing-cenoura")!;
    selectedVeggies.push({ ing: abobora, share: 0.60 });
    selectedVeggies.push({ ing: cenoura, share: 0.40 });
  }

  // Seleção de Gordura Saudável
  const selectedFat = INGREDIENT_DATABASE.find((i) => i.id === "ing-azeite-oliva")!;

  // 5. Dimensionamento das Gramas para atingir exatamente o MER alvo
  // Densidade calórica média estimada dos grupos:
  const proteinKcal100g = selectedProteins.reduce((acc, p) => acc + p.ing.kcal_per_100g * p.weightShare, 0);
  const carbKcal100g = selectedCarb.kcal_per_100g;
  const vegKcal100g = selectedVeggies.reduce((acc, v) => acc + v.ing.kcal_per_100g * v.share, 0);
  const fatKcal100g = selectedFat.kcal_per_100g;

  // Calorias alocadas para cada macro
  const targetProteinKcal = targetKcal * proteinRatio;
  const targetCarbKcal = targetKcal * carbRatio;
  const targetVegKcal = targetKcal * vegRatio;
  const targetFatKcal = targetKcal * fatRatio;

  // Gramas de cada grupo
  const totalProteinGrams = Math.round((targetProteinKcal / (proteinKcal100g || 1)) * 100);
  const totalCarbGrams = Math.round((targetCarbKcal / (carbKcal100g || 1)) * 100);
  const totalVegGrams = Math.round((targetVegKcal / (vegKcal100g || 1)) * 100);
  const totalFatGrams = Math.max(3, Math.round((targetFatKcal / (fatKcal100g || 1)) * 100));

  // Constrói os itens do plano alimentar
  const items: NutritionPlanItem[] = [];

  // Adiciona proteínas
  selectedProteins.forEach((p) => {
    const g = Math.round(totalProteinGrams * p.weightShare);
    if (g > 0) {
      items.push({
        ingredient_name: p.ing.name,
        quantity_grams: g,
        category: p.ing.category,
        kcal_per_100g: p.ing.kcal_per_100g,
        notes: p.ing.default_note,
      });
    }
  });

  // Adiciona carboidrato
  if (totalCarbGrams > 0) {
    items.push({
      ingredient_name: selectedCarb.name,
      quantity_grams: totalCarbGrams,
      category: selectedCarb.category,
      kcal_per_100g: selectedCarb.kcal_per_100g,
      notes: selectedCarb.default_note,
    });
  }

  // Adiciona vegetais
  selectedVeggies.forEach((v) => {
    const g = Math.round(totalVegGrams * v.share);
    if (g > 0) {
      items.push({
        ingredient_name: v.ing.name,
        quantity_grams: g,
        category: v.ing.category,
        kcal_per_100g: v.ing.kcal_per_100g,
        notes: v.ing.default_note,
      });
    }
  });

  // Adiciona gordura
  if (totalFatGrams > 0) {
    items.push({
      ingredient_name: selectedFat.name,
      quantity_grams: totalFatGrams,
      category: selectedFat.category,
      kcal_per_100g: selectedFat.kcal_per_100g,
      notes: selectedFat.default_note,
    });
  }

  // 6. Lista de Suplementos Recomendados
  const suggestedSupplements: string[] = [];
  suggestedSupplements.push("Suplemento Vitamínico-Mineral Completo (adequado para cães/gatos adultos)");
  suggestedSupplements.push("Carbonato de Cálcio / Casca de Ovo Moída (balanceamento estrito da relação Ca:P 1.3:1)");

  if (isRenal) {
    suggestedSupplements.push("Carbonato de Cálcio como Quelante Entérico de Fósforo (oferecer junto à refeição)");
    suggestedSupplements.push("Ômega-3 EPA/DHA de alta pureza (anti-inflamatório renal e antiproteinúrico)");
    suggestedSupplements.push("Complexo B complementar (reposição de perdas urinárias hidrossolúveis)");
  }

  if (isOsteoarticular) {
    suggestedSupplements.push("Colágeno Não Desnaturado Tipo II (UC-II 40mg) para proteção articular");
    suggestedSupplements.push("Sulfato de Condroitina e Glicosamina");
    suggestedSupplements.push("Óleo de Peixe Marinho (alta dose de EPA para inibição de citocinas inflamatórias)");
  }

  if (isOverweight) {
    suggestedSupplements.push("L-Carnitina (50 mg/kg) para transporte mitocondrial de lipídios e preservação de massa magra");
    suggestedSupplements.push("Fibra de Psyllium para aumento da saciedade gástrica");
  }

  if (isHepatic) {
    suggestedSupplements.push("Silimarina Extrato Padronizado (80%) para suporte hepatocelular e antioxidante");
    suggestedSupplements.push("Vitamina E (Acetato de Tocoferol) em dose antioxidante");
  }

  if (species === "FELINE" || isCardiac) {
    suggestedSupplements.push("Taurina (mandatória para gatos e suporte à contratilidade miocárdica)");
  }

  const hydrationTarget = Math.round(Math.max(currentWeight * 55, targetKcal * 1.0));

  const planDraft: NutritionPlan = {
    id: `plan-ai-${Date.now()}`,
    patient_id: patient.id,
    version: 1,
    title: isRenal
      ? `Dieta Cozida Terapêutica Renal • Suporte à Função Nefrótica`
      : isOverweight
      ? `Dieta Cozida Satiety • Déficit Calórico Controlado`
      : isOsteoarticular
      ? `Dieta Cozida Anti-inflamatória • Suporte Osteoarticular`
      : isAllergic
      ? `Dieta de Exclusão Hipoalergênica • Monoproteica`
      : `Dieta Natural Cozida Personalizada • Manutenção e Longevidade`,
    feeding_type: "NATURAL_COOKED",
    daily_energy_kcal: targetKcal,
    meals_per_day: mealsPerDay,
    items,
    supplements: suggestedSupplements,
    hydration_target_ml_day: hydrationTarget,
    transition_plan_days: 7,
    professional_id: "pro-1",
    is_active: true,
    approved_at: new Date().toISOString(),
    notes: `Formulação automatizada por IA baseada no perfil zootécnico (Peso: ${currentWeight}kg, ECC: ${bcs}/9).`,
  };

  return {
    planDraft,
    macroPercentages: {
      protein: Math.round(proteinRatio * 100),
      carbohydrate: Math.round(carbRatio * 100),
      vegetables: Math.round(vegRatio * 100),
      fatAndSupplements: Math.round(fatRatio * 100),
    },
    clinicalProfileDetected: {
      isRenal,
      isOverweight,
      isOsteoarticular,
      isAllergic,
      allergensFound: allergens,
      isCardiac,
      isHepatic,
    },
    clinicalRationale: rationale,
    suggestedSupplements,
  };
}
