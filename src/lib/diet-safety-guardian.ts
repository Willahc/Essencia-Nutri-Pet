import { Patient, NutritionPlanItem, Species } from "@/types";
import { DietSummaryCalculation } from "./diet-formulation";

/**
 * Guardião de Contraindicações Cruzadas e Segurança Nutricional
 * Cruza comorbidades, alergias cadastradas e laudos laboratoriais
 * contra os ingredientes e a densidade de macronutrientes da dieta formulada.
 */

export interface SafetyViolation {
  id: string;
  type: 'ALLERGEN_BLOCK' | 'DISEASE_CONTRAINDICATION' | 'NUTRIENT_LIMIT_EXCEEDED' | 'MANDATORY_SUPPLEMENT_MISSING';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  suggestedAction: string;
}

export interface DietSafetyAuditResult {
  isSafe: boolean;
  hasCriticalBlock: boolean;
  violations: SafetyViolation[];
  safetyScore: number; // 0 a 100
}

export function auditDietSafety(params: {
  patient: Patient;
  items: NutritionPlanItem[];
  summary: DietSummaryCalculation;
  serumCalciumMgDl?: number;
  serumTriglyceridesMgDl?: number;
  isRenalPatient?: boolean;
}): DietSafetyAuditResult {
  const {
    patient,
    items,
    summary,
    serumCalciumMgDl,
    serumTriglyceridesMgDl,
    isRenalPatient = false,
  } = params;

  const violations: SafetyViolation[] = [];

  // 1. CHECAGEM DE ALÉRGENOS DECLARADOS
  const declaredAllergies = patient.allergies || [];
  declaredAllergies.forEach((allergy) => {
    const normAllergy = allergy.toLowerCase().trim();
    if (!normAllergy) return;

    items.forEach((item) => {
      const normIng = item.ingredient_name.toLowerCase();
      if (normIng.includes(normAllergy) || normAllergy.includes(normIng)) {
        violations.push({
          id: `allergy-${normAllergy}-${item.ingredient_name}`,
          type: 'ALLERGEN_BLOCK',
          severity: 'CRITICAL',
          title: `Alérgeno Declarado Detectado: ${allergy}`,
          message: `O paciente possui hipersensibilidade alimentar diagnosticada a "${allergy}". O ingrediente "${item.ingredient_name}" está na dieta formulada.`,
          suggestedAction: `Remover "${item.ingredient_name}" e substituir por fonte proteica ou de carboidrato hipoalergênica (ex: coelho, cordeiro, inhame).`,
        });
      }
    });
  });

  // 2. CHECAGEM DE PANCREATITE / HIPERLIPIDEMIA
  const hasPancreatitisHistory = (patient.comorbidities || []).some((c) =>
    /pancreatite|hiperlipid|lipase/i.test(c)
  );
  const hasHighTriglycerides = serumTriglyceridesMgDl && serumTriglyceridesMgDl > 150;

  if (hasPancreatitisHistory || hasHighTriglycerides) {
    if (summary.fatGramsPer1000Kcal > 30 || summary.fatPercentEnergy > 28) {
      violations.push({
        id: 'safety-pancreatitis-fat',
        type: 'DISEASE_CONTRAINDICATION',
        severity: 'CRITICAL',
        title: 'Excesso de Gordura (Risco Pancreático)',
        message: `A dieta contém ${summary.fatGramsPer1000Kcal}g de gordura/1000 kcal (${summary.fatPercentEnergy}% do VET). Pacientes com histórico de pancreatite ou hipertrigliceridemia demandam restrição severa de gordura (< 30g/1000 kcal).`,
        suggestedAction: 'Substituir cortes de carnes gordas por peito de frango sem pele, lombo suíno magro ou peixe branco (tilápia), e suspender óleos vegetais livres.',
      });
    }
  }

  // 3. CHECAGEM DE HIPERCALCEMIA / PRODUTO FOSFOCÁLCICO
  const hasHypercalcemiaComorbidity = (patient.comorbidities || []).some((c) =>
    /hipercalc|oxalato/i.test(c)
  );
  const isHypercalcemic = (serumCalciumMgDl && serumCalciumMgDl > 12.0) || hasHypercalcemiaComorbidity;

  if (isHypercalcemic) {
    if (summary.recommendedCalciumCarbonateGrams > 1.5 || summary.calciumGramsPer1000Kcal > 2.5) {
      violations.push({
        id: 'safety-hypercalcemia-calcium',
        type: 'DISEASE_CONTRAINDICATION',
        severity: 'WARNING',
        title: 'Suplementação de Cálcio com Hipercalcemia Sérica',
        message: `O paciente possui cálcio sérico elevado ou histórico de hipercalcemia/oxalato. A suplementação empírica de cálcio (${summary.calciumGramsPer1000Kcal}g/1000 kcal) pode precipitar nefrocalcinose renal e urolitíase.`,
        suggestedAction: 'Suspender ou reduzir a adição de carbonato de cálcio livre até reavaliação do cálcio iônico sérico pelo médico-veterinário.',
      });
    }
  }

  // 4. CHECAGEM DE DOENÇA RENAL CRÔNICA (DRC / IRIS)
  const isRenal = isRenalPatient || (patient.comorbidities || []).some((c) => /renal|drc|iris/i.test(c));

  if (isRenal) {
    if (summary.phosphorusGramsPer1000Kcal > 1.2) {
      violations.push({
        id: 'safety-renal-phosphorus',
        type: 'NUTRIENT_LIMIT_EXCEEDED',
        severity: 'WARNING',
        title: 'Fósforo Dietético Acima da Meta Renal IRIS',
        message: `O fósforo formulado é de ${summary.phosphorusGramsPer1000Kcal}g/1000 kcal. Diretrizes IRIS preconizam entre 0.5g e 1.0g/1000 kcal para desacelerar a progressão da nefropatia.`,
        suggestedAction: 'Reduzir proporção de carnes ricas em fósforo e vísceras, e prescrever quelante entérico de fósforo (ex: carbonato de lantânio ou quitosana).',
      });
    }

    // Checagem de proteína excessiva em nefropatia avançada
    if (summary.proteinPercentEnergy > 45) {
      violations.push({
        id: 'safety-renal-excess-protein',
        type: 'NUTRIENT_LIMIT_EXCEEDED',
        severity: 'WARNING',
        title: 'Densidade Proteica Muito Elevada para Paciente Renal',
        message: `A proteína representa ${summary.proteinPercentEnergy}% das calorias da dieta. Em pacientes nefropatas, o excesso proteico aumenta resíduos nitrogenados e sobrecarga glomerular.`,
        suggestedAction: 'Equilibrar a dieta aumentando carboidratos de alta digestibilidade (arroz, batata doce) para efeito poupador de proteína.',
      });
    }
  }

  // 5. CHECAGEM DE TAURINA EM FELINOS
  if (patient.species === 'FELINE' && summary.taurineRequired) {
    violations.push({
      id: 'safety-feline-taurine',
      type: 'MANDATORY_SUPPLEMENT_MISSING',
      severity: 'INFO',
      title: 'Taurina Obrigatória para Dieta Felina Caseira',
      message: 'Gatos têm rota enzimática hepática limitada de síntese de taurina a partir de metionina/cisteína. Dietas cozidas perdem taurina no caldo de cocção.',
      suggestedAction: 'Adicionar obrigatoriamente 250mg a 500mg de L-Taurina em pó diariamente na refeição já fria.',
    });
  }

  const hasCriticalBlock = violations.some((v) => v.severity === 'CRITICAL');
  const warningCount = violations.filter((v) => v.severity === 'WARNING').length;

  let safetyScore = 100;
  if (hasCriticalBlock) safetyScore -= 50;
  safetyScore -= warningCount * 15;
  safetyScore = Math.max(0, Math.min(100, safetyScore));

  return {
    isSafe: violations.length === 0,
    hasCriticalBlock,
    violations,
    safetyScore,
  };
}
