import { BodyConditionScore, Species } from "@/types";

/**
 * Zootecnia & Nutrição Clínica de Cães e Gatos
 * Fórmulas oficiais baseadas no NRC (2006), FEDIAF (2024) e Diretrizes Globais de Nutrição WSAVA.
 */

export interface EnergyRequirementResult {
  rer_kcal_day: number; // Necessidade Energética Basal (RER / NEB)
  mer_kcal_day: number; // Necessidade Energética de Manutenção (MER / NEM)
  factor_used: number;
  hydration_ml_day: number;
  ideal_weight_estimate_kg: number;
  target_daily_loss_grams?: { min: number; max: number };
  hepatic_lipidosis_risk?: boolean;
  zootecnic_notes?: string[];
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
 * - Cães: RER = 70 * (Peso em kg ^ 0.75) (NRC 2006 / Kleiber)
 * - Gatos: RER = 100 * (Peso em kg ^ 0.67) (NRC 2006 Padrão Ouro para Felinos)
 */
export function calculateRER(weightKg: number, species: Species = 'CANINE'): number {
  if (weightKg <= 0) return 0;
  if (species === 'FELINE') {
    // Equação metabólica exponencial felina do NRC (2006)
    return Math.round(100 * Math.pow(weightKg, 0.67));
  }
  return Math.round(70 * Math.pow(weightKg, 0.75));
}

/**
 * Estima o peso ideal baseado no Escore de Condição Corporal (ECC 1 a 9).
 * No padrão WSAVA, cada ponto acima de 5 representa aproximadamente 10% a 15% de sobrepeso.
 */
export function estimateIdealWeight(currentWeightKg: number, bcs: BodyConditionScore): number {
  if (currentWeightKg <= 0) return 0;
  if (bcs === 5) return currentWeightKg;
  
  // Fator WSAVA: 1 + (BCS - 5) * 0.10
  const excessFactor = 1 + (bcs - 5) * 0.10;
  return Number((currentWeightKg / excessFactor).toFixed(1));
}

/**
 * Sugere o estado fisiológico ótimo inicial baseado no ECC e espécie
 */
export function getSuggestedPhysiologicalState(
  species: Species, 
  bcs: BodyConditionScore, 
  isNeutered: boolean = true,
  ageYears?: number
): PhysiologicalState {
  if (ageYears !== undefined && ageYears < 0.5) return 'GROWTH_YOUNG';
  if (ageYears !== undefined && ageYears < 1.0) return 'GROWTH_OLDER';
  if (bcs >= 6) return 'WEIGHT_LOSS';
  if (ageYears !== undefined && ageYears >= 8) return 'SENIOR';
  return isNeutered ? 'NEUTERED_ADULT' : 'INTACT_ADULT';
}

/**
 * Retorna o fator multiplicador do RER para obter o MER (NEM) conforme diretrizes zootécnicas
 */
export function getMERFactor(species: Species, state: PhysiologicalState): number {
  if (species === 'CANINE') {
    switch (state) {
      case 'WEIGHT_LOSS': return 1.0; // 1.0 * RER no peso ideal
      case 'NEUTERED_ADULT': return 1.4; // 1.4 - 1.6 * RER
      case 'INTACT_ADULT': return 1.8;
      case 'SENIOR': return 1.3;
      case 'GROWTH_YOUNG': return 3.0; // < 4 meses
      case 'GROWTH_OLDER': return 2.0; // > 4 meses
      case 'ACTIVE_WORK': return 2.5;
    }
  } else {
    // FELINE
    switch (state) {
      case 'WEIGHT_LOSS': return 0.8; // 0.8 * RER no peso ideal (déficit controlado para proteção hepática)
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
 * Converte a porcentagem de um nutriente da Matéria Original (MO / base úmida) para a Base Matéria Seca (MS)
 * Fórmula NRC / FEDIAF: % Nutriente na MS = (% Nutriente na MO / (100 - % Umidade)) * 100
 */
export function convertToDryMatter(nutrientOriginalPercent: number, moisturePercent: number): number {
  const dryMatterPercent = 100 - moisturePercent;
  if (dryMatterPercent <= 0) return 0;
  return Number(((nutrientOriginalPercent / dryMatterPercent) * 100).toFixed(1));
}

/**
 * Calcula a densidade de um nutriente expressa em gramas por 1000 kcal
 * Métrica mandatória do NRC (2006) e FEDIAF para formulação clínica
 */
export function calculateGramsPer1000Kcal(nutrientGrams: number, totalKcal: number): number {
  if (totalKcal <= 0) return 0;
  return Number(((nutrientGrams / totalKcal) * 1000).toFixed(1));
}

/**
 * Cálculo completo das necessidades calóricas, hídricas e zootécnicas do paciente
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

  const rer = calculateRER(calculationWeight, species);
  const factor = getMERFactor(species, state);
  const mer = Math.round(rer * factor);

  // Hidratação diária de manutenção: ~50-60ml/kg ou 1ml por kcal ingerida (mínimo zootécnico)
  const hydration = Math.round(Math.max(weightKg * 50, mer * 1.0));

  const notes: string[] = [];

  // Perda de peso saudável recomendada:
  // Cães: 1.0% a 2.0% do peso corporal por semana
  // Gatos: 0.5% a 1.5% do peso corporal por semana (conservador p/ evitar lipidose hepática)
  let target_daily_loss_grams: { min: number; max: number } | undefined;
  let hepatic_lipidosis_risk = false;

  if (state === 'WEIGHT_LOSS' && weightKg > idealWeight) {
    const weeklyMinPercent = species === 'CANINE' ? 0.01 : 0.005;
    const weeklyMaxPercent = species === 'CANINE' ? 0.02 : 0.015;
    
    const minGramsPerDay = Math.round((weightKg * 1000 * weeklyMinPercent) / 7);
    const maxGramsPerDay = Math.round((weightKg * 1000 * weeklyMaxPercent) / 7);

    target_daily_loss_grams = { min: minGramsPerDay, max: maxGramsPerDay };

    if (species === 'FELINE') {
      notes.push("Alerta Zootécnico: Perda de peso felina monitorada (máximo 1.5%/semana) para prevenção de Lipidose Hepática.");
      if (mer < calculateRER(weightKg, 'FELINE') * 0.70) {
        hepatic_lipidosis_risk = true;
        notes.push("AVISO CRÍTICO: Ingestão calórica inferior a 70% do RER do peso atual. Risco iminente de mobilização excessiva de triglicerídeos e infiltração gordurosa hepática!");
      }
    } else {
      notes.push("Protocolo Canino de Restrição Calórica Segura: Alvo de 1% a 2% de perda semanal com preservação de massa magra.");
    }
  }

  return {
    rer_kcal_day: rer,
    mer_kcal_day: mer,
    factor_used: factor,
    hydration_ml_day: hydration,
    ideal_weight_estimate_kg: idealWeight,
    target_daily_loss_grams,
    hepatic_lipidosis_risk,
    zootecnic_notes: notes,
  };
}

/**
 * Descrição clínica do Escore de Condição Corporal (WSAVA 1-9)
 */
export function getBCSDescription(bcs: BodyConditionScore): { label: string; status: 'UNDERWEIGHT' | 'IDEAL' | 'OVERWEIGHT' | 'OBESE' } {
  if (bcs <= 3) return { label: 'Abaixo do peso ideal / Costelas e ossos proeminentes (Emaciação)', status: 'UNDERWEIGHT' };
  if (bcs === 4) return { label: 'Abaixo do ideal leve / Cintura bem marcada', status: 'UNDERWEIGHT' };
  if (bcs === 5) return { label: 'Peso Ideal / Costelas facilmente palpáveis com fina cobertura adiposa', status: 'IDEAL' };
  if (bcs === 6) return { label: 'Sobrepeso leve / Costelas palpáveis com discreta capa de gordura', status: 'OVERWEIGHT' };
  if (bcs === 7) return { label: 'Sobrepeso evidente / Perda da linha de cintura vista dorsalmente', status: 'OVERWEIGHT' };
  return { label: 'Obesidade / Depósitos volumosos de gordura lombar e distensão abdominal', status: 'OBESE' };
}
