import { BodyConditionScore, Species } from "@/types";

/**
 * Zootecnia & Nutrição Clínica de Cães e Gatos
 * Fórmulas oficiais baseadas no NRC (2006) e Diretrizes Globais de Nutrição WSAVA.
 */

export interface EnergyRequirementResult {
  rer_kcal_day: number; // Necessidade Energética Basal (RER / NEB)
  mer_kcal_day: number; // Necessidade Energética de Manutenção (MER / NEM)
  factor_used: number;
  hydration_ml_day: number;
  ideal_weight_estimate_kg: number;
  target_daily_loss_grams?: { min: number; max: number };
}

export type PhysiologicalState = 
  | 'NEUTERED_ADULT'
  | 'INTACT_ADULT'
  | 'WEIGHT_LOSS'
  | 'SENIOR'
  | 'GROWTH_YOUNG'
  | 'GROWTH_OLDER'
  | 'ACTIVE_WORK';

/**
 * Calcula a Necessidade Energética Basal (RER / NEB):
 * RER = 70 * (Peso em kg ^ 0.75)
 */
export function calculateRER(weightKg: number): number {
  if (weightKg <= 0) return 0;
  return Math.round(70 * Math.pow(weightKg, 0.75));
}

/**
 * Estima o peso ideal baseado no Escore de Condição Corporal (ECC 1 a 9).
 * No padrão WSAVA, cada ponto acima de 5 representa aproximadamente 10% a 15% de sobrepeso.
 */
export function estimateIdealWeight(currentWeightKg: number, bcs: BodyConditionScore): number {
  if (currentWeightKg <= 0) return 0;
  if (bcs === 5) return currentWeightKg;
  
  // Fator: 1 + (BCS - 5) * 0.10
  const excessFactor = 1 + (bcs - 5) * 0.10;
  return Number((currentWeightKg / excessFactor).toFixed(1));
}

/**
 * Retorna o fator multiplicador do RER para obter o MER (NEM)
 */
export function getMERFactor(species: Species, state: PhysiologicalState): number {
  if (species === 'CANINE') {
    switch (state) {
      case 'WEIGHT_LOSS': return 1.0; // 1.0 * RER no peso ideal
      case 'NEUTERED_ADULT': return 1.4; // 1.4 - 1.6 * RER
      case 'INTACT_ADULT': return 1.8;
      case 'SENIOR': return 1.4;
      case 'GROWTH_YOUNG': return 3.0; // < 4 meses
      case 'GROWTH_OLDER': return 2.0; // > 4 meses
      case 'ACTIVE_WORK': return 2.5;
    }
  } else {
    // FELINE
    switch (state) {
      case 'WEIGHT_LOSS': return 0.8; // 0.8 * RER no peso ideal (felinos requerem déficit controlado p/ evitar lipidose hepática)
      case 'NEUTERED_ADULT': return 1.2;
      case 'INTACT_ADULT': return 1.4;
      case 'SENIOR': return 1.1;
      case 'GROWTH_YOUNG': return 2.5;
      case 'GROWTH_OLDER': return 2.0;
      case 'ACTIVE_WORK': return 1.6;
    }
  }
}

/**
 * Cálculo completo das necessidades calóricas e hídricas do paciente
 */
export function calculateEnergyRequirements(params: {
  species: Species;
  weightKg: number;
  bcs: BodyConditionScore;
  state: PhysiologicalState;
  customIdealWeightKg?: number;
}): EnergyRequirementResult {
  const { species, weightKg, bcs, state, customIdealWeightKg } = params;

  const idealWeight = customIdealWeightKg ?? estimateIdealWeight(weightKg, bcs);

  // Para perda de peso, o RER deve ser calculado com base no peso meta/ideal!
  const calculationWeight = state === 'WEIGHT_LOSS' ? idealWeight : weightKg;

  const rer = calculateRER(calculationWeight);
  const factor = getMERFactor(species, state);
  const mer = Math.round(rer * factor);

  // Hidratação diária: ~50-60ml/kg ou 1ml por kcal ingerida
  const hydration = Math.round(mer * 1.0);

  // Perda de peso saudável recomendada:
  // Cães: 1.0% a 2.0% do peso corporal por semana
  // Gatos: 0.5% a 1.5% do peso corporal por semana (conservador p/ evitar lipidose)
  let target_daily_loss_grams: { min: number; max: number } | undefined;
  if (state === 'WEIGHT_LOSS' && weightKg > idealWeight) {
    const weeklyMinPercent = species === 'CANINE' ? 0.01 : 0.005;
    const weeklyMaxPercent = species === 'CANINE' ? 0.02 : 0.015;
    
    const minGramsPerDay = Math.round((weightKg * 1000 * weeklyMinPercent) / 7);
    const maxGramsPerDay = Math.round((weightKg * 1000 * weeklyMaxPercent) / 7);

    target_daily_loss_grams = { min: minGramsPerDay, max: maxGramsPerDay };
  }

  return {
    rer_kcal_day: rer,
    mer_kcal_day: mer,
    factor_used: factor,
    hydration_ml_day: hydration,
    ideal_weight_estimate_kg: idealWeight,
    target_daily_loss_grams,
  };
}

/**
 * Descrição clínica do Escore de Condição Corporal
 */
export function getBCSDescription(bcs: BodyConditionScore): { label: string; status: 'UNDERWEIGHT' | 'IDEAL' | 'OVERWEIGHT' | 'OBESE' } {
  if (bcs <= 3) return { label: 'Abaixo do peso ideal / Costelas e ossos proeminentes', status: 'UNDERWEIGHT' };
  if (bcs === 4) return { label: 'Abaixo do ideal leve / Cintura bem marcada', status: 'UNDERWEIGHT' };
  if (bcs === 5) return { label: 'Peso Ideal / Costelas palpáveis sem excesso de gordura', status: 'IDEAL' };
  if (bcs === 6) return { label: 'Sobrepeso leve / Costelas palpáveis com discreta capa de gordura', status: 'OVERWEIGHT' };
  if (bcs === 7) return { label: 'Sobrepeso evidente / Perda da linha de cintura', status: 'OVERWEIGHT' };
  return { label: 'Obesidade / Depósitos volumosos de gordura lombar e abdominal', status: 'OBESE' };
}
