import { Species } from "@/types";

/**
 * Motor Especialista de Nefrologia Zootécnica - Diretrizes IRIS 2023
 * (International Renal Interest Society - Staging of CKD in Dogs and Cats)
 */

export type IRISStageNumber = 1 | 2 | 3 | 4;
export type IRISProteinuriaSubstage = 'NON_PROTEINURIC' | 'BORDERLINE' | 'PROTEINURIC' | 'NOT_EVALUATED';
export type IRISBloodPressureSubstage = 'NORMOTENSIVE' | 'PREHYPERTENSIVE' | 'HYPERTENSIVE' | 'SEVERELY_HYPERTENSIVE' | 'NOT_EVALUATED';

export interface IRISStagingResult {
  stage: IRISStageNumber;
  stage_label: string;
  stage_description: string;
  is_azotemic: boolean;
  proteinuria_substage: IRISProteinuriaSubstage;
  proteinuria_label: string;
  blood_pressure_substage: IRISBloodPressureSubstage;
  blood_pressure_label: string;
  target_serum_phosphorus_mg_dl: { min: number; max: number; label: string };
  serum_phosphorus_status?: 'ON_TARGET' | 'ELEVATED' | 'CRITICAL';
  phosphocalcic_product?: number; // Ca x P
  phosphocalcic_risk?: boolean; // > 55 mg2/dL2
  dietary_guidelines: {
    phosphorus_target: string; // g/1000 kcal
    protein_target: string;
    sodium_target: string;
    omega3_dose_mg_kg: number;
    recommended_phosphate_binder: string;
  };
  clinical_recommendations: string[];
}

/**
 * Classifica o paciente no estadiamento IRIS 2023 baseado em biomarcadores séricos e urinários
 */
export function classifyIRISStage(params: {
  species: Species;
  creatinineMgDl: number;
  sdmaUgDl?: number;
  upcr?: number; // Relação Proteína:Creatinina Urinária (RPCU)
  serumPhosphorusMgDl?: number;
  serumCalciumTotalMgDl?: number;
  serumCalciumIonizedMmolL?: number;
  systolicBpMmhg?: number;
}): IRISStagingResult {
  const {
    species,
    creatinineMgDl,
    sdmaUgDl,
    upcr,
    serumPhosphorusMgDl,
    serumCalciumTotalMgDl,
    systolicBpMmhg
  } = params;

  const isCanine = species === 'CANINE';

  // 1. ESTADIAMENTO POR CREATININA (e SDMA)
  let stage: IRISStageNumber = 1;
  let stageLabel = "Estágio 1 (Não Azotêmico)";
  let stageDesc = "Função renal diminuída sem azotemia evidente. Perda de reserva funcional renal.";
  let isAzotemic = false;

  if (isCanine) {
    if (creatinineMgDl < 1.4) {
      stage = (sdmaUgDl && sdmaUgDl > 18) ? 2 : 1;
    } else if (creatinineMgDl <= 2.8) {
      stage = 2;
    } else if (creatinineMgDl <= 5.0) {
      stage = 3;
    } else {
      stage = 4;
    }
  } else {
    // FELINO
    if (creatinineMgDl < 1.6) {
      stage = (sdmaUgDl && sdmaUgDl > 18) ? 2 : 1;
    } else if (creatinineMgDl <= 2.8) {
      stage = 2;
    } else if (creatinineMgDl <= 5.0) {
      stage = 3;
    } else {
      stage = 4;
    }
  }

  switch (stage) {
    case 1:
      stageLabel = "Estágio IRIS 1 (Incipiente)";
      stageDesc = "Néfrons remanescentes compensando. Sem azotemia sérica clínica.";
      isAzotemic = false;
      break;
    case 2:
      stageLabel = "Estágio IRIS 2 (Leve)";
      stageDesc = "Azotemia renal leve. Sinais clínicos mínimos, poliúria/polidipsia compensatória.";
      isAzotemic = true;
      break;
    case 3:
      stageLabel = "Estágio IRIS 3 (Moderado)";
      stageDesc = "Azotemia renal moderada a grave. Risco elevado de uremia, acidose metabólica e perda muscular.";
      isAzotemic = true;
      break;
    case 4:
      stageLabel = "Estágio IRIS 4 (Avançado / Terminal)";
      stageDesc = "Insuficiência renal avançada com risco iminente de crise urêmica e distúrbios cardiovasculares.";
      isAzotemic = true;
      break;
  }

  // 2. SUBESTADIAMENTO DE PROTEINÚRIA (RPCU / UPCR)
  let protSubstage: IRISProteinuriaSubstage = 'NOT_EVALUATED';
  let protLabel = "RPCU não avaliado";

  if (upcr !== undefined) {
    if (isCanine) {
      if (upcr < 0.2) {
        protSubstage = 'NON_PROTEINURIC';
        protLabel = `Não Proteinúrico (RPCU ${upcr.toFixed(2)} < 0.20)`;
      } else if (upcr <= 0.5) {
        protSubstage = 'BORDERLINE';
        protLabel = `Proteinúria Limítrofe (RPCU ${upcr.toFixed(2)} [0.20 - 0.50])`;
      } else {
        protSubstage = 'PROTEINURIC';
        protLabel = `Proteinúrico Grave (RPCU ${upcr.toFixed(2)} > 0.50)`;
      }
    } else {
      // FELINO (Ponto de corte é 0.4)
      if (upcr < 0.2) {
        protSubstage = 'NON_PROTEINURIC';
        protLabel = `Não Proteinúrico (RPCU ${upcr.toFixed(2)} < 0.20)`;
      } else if (upcr <= 0.4) {
        protSubstage = 'BORDERLINE';
        protLabel = `Proteinúria Limítrofe (RPCU ${upcr.toFixed(2)} [0.20 - 0.40])`;
      } else {
        protSubstage = 'PROTEINURIC';
        protLabel = `Proteinúrico Grave (RPCU ${upcr.toFixed(2)} > 0.40)`;
      }
    }
  }

  // 3. SUBESTADIAMENTO DE PRESSÃO ARTERIAL SISTÓLICA (PAS)
  let bpSubstage: IRISBloodPressureSubstage = 'NOT_EVALUATED';
  let bpLabel = "Pressão arterial não informada";

  if (systolicBpMmhg !== undefined) {
    if (systolicBpMmhg < 140) {
      bpSubstage = 'NORMOTENSIVE';
      bpLabel = `Normotenso (${systolicBpMmhg} mmHg)`;
    } else if (systolicBpMmhg <= 159) {
      bpSubstage = 'PREHYPERTENSIVE';
      bpLabel = `Pré-hipertenso / Risco Mínimo (${systolicBpMmhg} mmHg)`;
    } else if (systolicBpMmhg <= 179) {
      bpSubstage = 'HYPERTENSIVE';
      bpLabel = `Hipertenso / Risco Moderado de Lesão de Órgão Alvo (${systolicBpMmhg} mmHg)`;
    } else {
      bpSubstage = 'SEVERELY_HYPERTENSIVE';
      bpLabel = `Hipertensão Grave / Alto Risco de Lesão (${systolicBpMmhg} mmHg)`;
    }
  }

  // 4. METAS DE FÓSFORO SÉRICO POR ESTÁGIO (DIRETRIZES IRIS)
  let targetP = { min: 2.7, max: 4.6, label: "2.7 a 4.6 mg/dL (Faixa Fisiológica)" };
  if (stage === 2) {
    targetP = { min: 2.7, max: 4.5, label: "< 4.5 mg/dL (Meta IRIS Estágio 2)" };
  } else if (stage === 3) {
    targetP = { min: 2.7, max: 5.0, label: "< 5.0 mg/dL (Meta IRIS Estágio 3)" };
  } else if (stage === 4) {
    targetP = { min: 2.7, max: 6.0, label: "< 6.0 mg/dL (Meta IRIS Estágio 4)" };
  }

  let pStatus: 'ON_TARGET' | 'ELEVATED' | 'CRITICAL' | undefined;
  if (serumPhosphorusMgDl !== undefined) {
    if (serumPhosphorusMgDl <= targetP.max) {
      pStatus = 'ON_TARGET';
    } else if (serumPhosphorusMgDl <= targetP.max + 1.5) {
      pStatus = 'ELEVATED';
    } else {
      pStatus = 'CRITICAL';
    }
  }

  // 5. PRODUTO FOSFOCÁLCICO (Ca x P)
  let caTimesP: number | undefined;
  let caRisk = false;
  if (serumPhosphorusMgDl && serumCalciumTotalMgDl) {
    caTimesP = Number((serumPhosphorusMgDl * serumCalciumTotalMgDl).toFixed(1));
    if (caTimesP > 55) {
      caRisk = true;
    }
  }

  // 6. DIRETRIZES NUTRICIONAIS ZOOTÉCNICAS CUSTOMIZADAS
  const recs: string[] = [];

  let pDietTarget = "0.8 a 1.2 g / 1000 kcal";
  let protDietTarget = "50 a 65 g / 1000 kcal (Alto valor biológico)";
  let binderRec = "Restrição dietética suficiente inicialmente";

  if (stage >= 2) {
    pDietTarget = "< 0.8 g / 1000 kcal (Restrição moderada a severa de fósforo)";
    protDietTarget = isCanine 
      ? "35 a 45 g / 1000 kcal (Proteína controlada, ovos e aves)" 
      : "55 a 65 g / 1000 kcal (Felinos não toleram restrição proteica extrema)";
    recs.push("Transição obrigatória para alimento renal úmido funcional.");
    recs.push("Estimular ingestão hídrica para manutenção da densidade urinária e débito glomerular.");
  }

  if (pStatus === 'ELEVATED' || pStatus === 'CRITICAL' || stage >= 3) {
    binderRec = caRisk 
      ? "QUELANTE LIVRE DE CÁLCIO (Carbonato de Lantânio ou Hidróxido de Alumínio) - Produto Ca x P elevado!" 
      : "Quelante entérico de fósforo (Carbonato de Cálcio 1.0g/100g carne ou Quitosana com carbonato de cálcio)";
    recs.push(`Fósforo acima da meta terapêutica (${targetP.label}). Administrar quelante entérico estritamente com a refeição.`);
  }

  if (protSubstage === 'PROTEINURIC') {
    recs.push(`Proteinúria grave confirmada (${protLabel}). Adicionar Ômega-3 EPA/DHA (120-150 mg/kg) para modulação da hemodinâmica glomerular e redução da pressão intracapilar.`);
  }

  if (caRisk) {
    recs.push(`ALERTA ZOOTÉCNICO: Produto Fosfocálcico Ca x P = ${caTimesP} mg²/dL² (> 55). Alto risco de calcificação renal nefrogênica! Não suplementar cálcio oral sem controle laboratorial rigoroso.`);
  }

  return {
    stage,
    stage_label: stageLabel,
    stage_description: stageDesc,
    is_azotemic: isAzotemic,
    proteinuria_substage: protSubstage,
    proteinuria_label: protLabel,
    blood_pressure_substage: bpSubstage,
    blood_pressure_label: bpLabel,
    target_serum_phosphorus_mg_dl: targetP,
    serum_phosphorus_status: pStatus,
    phosphocalcic_product: caTimesP,
    phosphocalcic_risk: caRisk,
    dietary_guidelines: {
      phosphorus_target: pDietTarget,
      protein_target: protDietTarget,
      sodium_target: "0.20% a 0.35% da Matéria Seca",
      omega3_dose_mg_kg: stage >= 2 ? 120 : 50,
      recommended_phosphate_binder: binderRec,
    },
    clinical_recommendations: recs,
  };
}
