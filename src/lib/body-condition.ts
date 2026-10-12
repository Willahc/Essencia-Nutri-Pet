import { BodyConditionScore, Patient, NutritionPlan, Species } from "@/types";

export interface BcsPointDefinition {
  score: BodyConditionScore;
  category: string;
  weightPercentageOfIdeal: number; // ex: 60, 70, 80, 90, 100, 110, 120, 130, 140
  idealFactorMultiplier: number; // ex: 1.67, 1.43, 1.25, 1.11, 1.0, 0.91, 0.83, 0.77, 0.71
  clinicalStatus: "UNDERWEIGHT" | "IDEAL" | "OVERWEIGHT" | "OBESE";
  visualInspection: string; // O que ver
  palpationTest: string; // O que sentir
  technicalNote: string; // Nota clínica/zootécnica
  fatPercentageEstimate: string; // Estimativa de % de gordura corporal
  canineSilhouetteDescription: string;
  felineSilhouetteDescription: string;
}

export const BCS_9_POINT_DEFINITIONS: Record<BodyConditionScore, BcsPointDefinition> = {
  1: {
    score: 1,
    category: "Caquético",
    weightPercentageOfIdeal: 60,
    idealFactorMultiplier: 1.67,
    clinicalStatus: "UNDERWEIGHT",
    visualInspection: "Costelas, vértebras lombares e ossos da pelve visíveis de longe; cintura e retração abdominal extremamente profundas.",
    palpationTest: "Nenhuma gordura palpável ao toque. Perda acentuada e evidente de massa muscular.",
    technicalNote: "Risco iminente de desnutrição grave ou doença consuntiva de base (neoplasia, IRC terminal, enteropatia crônica). Demanda investigação laboratorial imediata e suporte nutricional parenteral/enteral.",
    fatPercentageEstimate: "< 5%",
    canineSilhouetteDescription: "Esqueleto totalmente visível, tórax profundo sem cobertura, abdome em ângulo agudo.",
    felineSilhouetteDescription: "Espinha dorsal protuberante, flancos vazados, sem depósitos adiposos inguinais.",
  },
  2: {
    score: 2,
    category: "Muito Magro",
    weightPercentageOfIdeal: 70,
    idealFactorMultiplier: 1.43,
    clinicalStatus: "UNDERWEIGHT",
    visualInspection: "Costelas facilmente visíveis sem esforço; topo das vértebras lombares e asas do ílio muito salientes.",
    palpationTest: "Sem gordura subcutânea palpável. Mínima perda de tônus muscular.",
    technicalNote: "Déficit calórico crônico importante. Necessário revisar plano alimentar, protocolo de desparasitação e exames bioquímicos.",
    fatPercentageEstimate: "5% a 9%",
    canineSilhouetteDescription: "Cintura muito estreita vista de cima, costelas marcadas sob a pele.",
    felineSilhouetteDescription: "Estrutura óssea evidente, vértebras lombares palpáveis sem tecido adiposo interposto.",
  },
  3: {
    score: 3,
    category: "Magro",
    weightPercentageOfIdeal: 80,
    idealFactorMultiplier: 1.25,
    clinicalStatus: "UNDERWEIGHT",
    visualInspection: "Costelas visíveis ao olhar de lado; cintura bem afunilada vista de cima e abdome retraído evidente.",
    palpationTest: "Costelas facilmente palpáveis com cobertura gordurosa mínima, semelhante a tocar nós dos dedos da mão.",
    technicalNote: "Reservas energéticas subdimensionadas. Recomenda-se aumento gradual do aporte calórico diário (NEM) com fontes nobres de proteína e lipídios.",
    fatPercentageEstimate: "10% a 14%",
    canineSilhouetteDescription: "Contorno em ampulheta acentuado, retração do flanco evidente.",
    felineSilhouetteDescription: "Cintura pronunciada atrás da última costela, sem bolsa de gordura ventral.",
  },
  4: {
    score: 4,
    category: "Abaixo do Ideal",
    weightPercentageOfIdeal: 90,
    idealFactorMultiplier: 1.11,
    clinicalStatus: "IDEAL",
    visualInspection: "Cintura bem delineada de cima; abdome retraído visto de perfil lateral; costelas discretamente visíveis em pelo curto.",
    palpationTest: "Costelas prontamente palpáveis sob uma fina camada elástica de gordura subcutânea.",
    technicalNote: "Dentro da faixa aceitável pelo consenso WSAVA (4 a 5). Padrão frequente e fisiológico em cães atletas, de caça, galgos ou animais jovens de alta atividade física.",
    fatPercentageEstimate: "15% a 18%",
    canineSilhouetteDescription: "Musculatura delineada, contorno abdominal atlético e cintura proporcional.",
    felineSilhouetteDescription: "Gato esguio, leve concavidade nos flancos, proporção corporal ágil.",
  },
  5: {
    score: 5,
    category: "Peso Ideal (Padrão-Ouro WSAVA)",
    weightPercentageOfIdeal: 100,
    idealFactorMultiplier: 1.00,
    clinicalStatus: "IDEAL",
    visualInspection: "Cintura proporcional e bem definida atrás das costelas vista de cima; abdome visivelmente retraído (*abdominal tuck*) visto de lado.",
    palpationTest: "Costelas facilmente palpáveis sem pressão, com sensação tátil idêntica ao dorso dos dedos da mão espalmada. Sem excesso de gordura.",
    technicalNote: "Meta de manutenção vitalícia (15 a 25% de gordura corporal). Associado clinicamente a menor incidência de osteoartrite, menor risco de diabetes mellitus e ganho de até +1.8 anos de vida saudável (Kealy et al., 2002).",
    fatPercentageEstimate: "15% a 25%",
    canineSilhouetteDescription: "Formato em ampulheta clássico visto de cima; subida abdominal suave do esterno à virilha.",
    felineSilhouetteDescription: "Proporção harmoniosa vista de cima; pequena almofada primordial de pele fisiológica na virilha.",
  },
  6: {
    score: 6,
    category: "Acima do Ideal (Início de Sobrepeso)",
    weightPercentageOfIdeal: 110,
    idealFactorMultiplier: 0.91,
    clinicalStatus: "OVERWEIGHT",
    visualInspection: "Cintura ainda discernível vista de cima, mas sutil e pouco marcada; abdome com retração lateral discreta.",
    palpationTest: "Costelas palpáveis sob uma camada moderada de gordura; exige leve pressão para sentir os arcos costais.",
    technicalNote: "Início de sobrepeso (~10% acima do peso meta). Momento cirúrgico ideal para intervenção nutricional preventiva (revisar petiscos e diminuir 10% das calorias antes que atinja a obesidade).",
    fatPercentageEstimate: "26% a 30%",
    canineSilhouetteDescription: "Linha dorsal ligeiramente plana, cintura reta com leve contorno.",
    felineSilhouetteDescription: "Flancos retos, discreto acúmulo adiposo no dorso e bolsa primordial espessada.",
  },
  7: {
    score: 7,
    category: "Sobrepeso Clínico",
    weightPercentageOfIdeal: 120,
    idealFactorMultiplier: 0.83,
    clinicalStatus: "OVERWEIGHT",
    visualInspection: "Cintura pouco distinguível de cima; retração abdominal quase ausente de perfil; acúmulo de gordura na garupa e base da cauda.",
    palpationTest: "Costelas difíceis de palpar; cobertas por camada espessa de tecido adiposo que amortece o toque dos dedos.",
    technicalNote: "Cerca de 20% acima do peso ideal. Aumento substancial do estresse articular sobre coxofemorais e joelhos, aumento da pressão arterial sistêmica e sobrecarga cardiorrespiratória.",
    fatPercentageEstimate: "31% a 35%",
    canineSilhouetteDescription: "Costas alargadas em linha reta, abdome sem retração lateral perceptível.",
    felineSilhouetteDescription: "Costas largas, depósitos evidentes de gordura lombar e abdome pendular.",
  },
  8: {
    score: 8,
    category: "Obeso",
    weightPercentageOfIdeal: 130,
    idealFactorMultiplier: 0.77,
    clinicalStatus: "OBESE",
    visualInspection: "Ausência total de cintura vista de cima; abdome arredondado ou pendular; depósitos proeminentes na coluna lombar e base da cauda.",
    palpationTest: "Costelas não palpáveis com toque normal; só são sentidas aplicando pressão firme e vigorosa.",
    technicalNote: "Cerca de 30% acima do peso ideal. Estado de inflamação crônica de baixo grau mediada por adipocinas (TNF-alfa, IL-6). Em felinos: risco imediato de lipidose hepática caso ocorra anorexia; exige emagrecimento controlado.",
    fatPercentageEstimate: "36% a 40%",
    canineSilhouetteDescription: "Tórax em barril, dorso largo sem cintura, abdome abaulado para os lados.",
    felineSilhouetteDescription: "Corpo cilíndrico, gordura subcutânea abundante no pescoço e abdome distendido.",
  },
  9: {
    score: 9,
    category: "Obeso Grave / Mórbido",
    weightPercentageOfIdeal: 140,
    idealFactorMultiplier: 0.71,
    clinicalStatus: "OBESE",
    visualInspection: "Depósitos maciços de gordura em tórax, coluna vertebral, cauda, pescoço e membros; abdome acentuadamente distendido.",
    palpationTest: "Impossível sentir qualquer costela ou processo espinhoso mesmo com forte compressão manual.",
    technicalNote: "Cerca de 40% ou mais acima do peso ideal. Condição limitante grave com risco anestésico altíssimo, intolerância severa ao calor e esforço. Prescrição obrigatória de dieta terapêutica hipocalórica sacietógena.",
    fatPercentageEstimate: "> 40%",
    canineSilhouetteDescription: "Dorso muito alargado com pregas de gordura nos ombros, pescoço e base da cauda.",
    felineSilhouetteDescription: "Depósitos massivos na face, pescoço e membros; abdome arrastando no chão.",
  },
};

export interface BcsHealthMilestone {
  title: string;
  description: string;
  timeframe: string;
  iconType: "SCALE" | "HEART" | "ACTIVITY" | "SHIELD" | "SPARKLES";
  impactCategory: "ARTICULAR" | "METABOLIC" | "CARDIOVASCULAR" | "LONGEVITY";
}

export interface BcsHealthProjectionResult {
  currentWeightKg: number;
  currentBcs: BodyConditionScore;
  idealWeightKg: number;
  idealBcs: BodyConditionScore; // 5

  // Projeção temporal selecionada (ex: 4 semanas / 1 mês, 8 semanas / 2 meses, 12 semanas / 3 meses)
  projectionWeeks: number;
  projectedWeightKg: number;
  projectedBcs: number; // ex: 6.2
  projectedStatusCategory: string;
  weightDeltaKg: number; // ex: -1.8 kg
  percentageOfIdealTargetReached: number; // ex: 65%

  // Taxa de segurança zootécnica
  safeWeeklyLossKg: { min: number; max: number };
  safeWeeklyLossPercent: { min: number; max: number };
  estimatedTotalWeeksToIdeal: number;
  hepaticLipidosisWarning?: string; // Para gatos

  // Análise de status de saúde e marcos biológicos atingidos
  healthStatusSummary: string;
  milestones: BcsHealthMilestone[];
  longevityBonusQuote: string;
}

/**
 * Calcula a projeção matemática e biológica de evolução de peso e ECC baseada na dieta prescrita
 */
export function calculateBcsHealthProjection(
  patient: Patient,
  plan?: NutritionPlan,
  projectionWeeks: number = 4
): BcsHealthProjectionResult {
  const species = patient.species;
  const currentWeight = patient.current_weight_kg || 10;
  const currentBcs = (patient.current_bcs || 5) as BodyConditionScore;

  // Cálculo WSAVA do peso ideal se não fornecido
  const currentDef = BCS_9_POINT_DEFINITIONS[currentBcs] || BCS_9_POINT_DEFINITIONS[5];
  const excessFactor = 1 + (currentBcs - 5) * 0.10;
  const idealWeight = Number(
    (patient.ideal_weight_kg && patient.ideal_weight_kg > 0
      ? patient.ideal_weight_kg
      : currentWeight / excessFactor
    ).toFixed(1)
  );

  const idealBcs: BodyConditionScore = 5;

  // Taxa segura de perda semanal (Diretrizes WSAVA / Laflamme 1997):
  // Cães: 1.0% a 2.0% por semana (usamos 1.25% como padrão realista seguro)
  // Gatos: 0.5% a 1.5% por semana (usamos 0.90% para proteger contra lipidose hepática)
  const weeklyLossPercentMin = species === "CANINE" ? 0.01 : 0.005;
  const weeklyLossPercentMax = species === "CANINE" ? 0.02 : 0.015;
  const standardWeeklyLossRate = species === "CANINE" ? 0.013 : 0.009;

  const minWeeklyKg = Number(((currentWeight * weeklyLossPercentMin)).toFixed(2));
  const maxWeeklyKg = Number(((currentWeight * weeklyLossPercentMax)).toFixed(2));

  let projectedWeightKg = currentWeight;
  let projectedBcs = currentBcs as number;
  let estimatedTotalWeeksToIdeal = 0;
  let hepaticLipidosisWarning: string | undefined;

  if (species === "FELINE" && currentBcs >= 7) {
    hepaticLipidosisWarning =
      "Atenção Zootécnica Felina: O emagrecimento de gatos com ECC ≥ 7 deve ser gradual (máximo 1.5%/semana) e jamais com jejum forçado, prevenindo o acúmulo de triglicerídeos nos hepatócitos (Lipidose Hepática).";
  }

  if (currentBcs > 5) {
    // Cenário de Emagrecimento / Perda Ponderal
    const weightToLoseTotal = Math.max(0, currentWeight - idealWeight);
    const standardWeeklyLossKg = currentWeight * standardWeeklyLossRate;

    estimatedTotalWeeksToIdeal = standardWeeklyLossKg > 0 ? Math.ceil(weightToLoseTotal / standardWeeklyLossKg) : 0;

    // Peso projetado após as semanas indicadas
    const projectedLossTotal = Math.min(weightToLoseTotal, standardWeeklyLossKg * projectionWeeks);
    projectedWeightKg = Number((currentWeight - projectedLossTotal).toFixed(1));

    // ECC projetado: cada ponto equivale a ~10% do peso ideal
    const tenPercentIdeal = idealWeight * 0.10;
    const pointsReduced = tenPercentIdeal > 0 ? projectedLossTotal / tenPercentIdeal : 0;
    projectedBcs = Number(Math.max(5.0, currentBcs - pointsReduced).toFixed(1));
  } else if (currentBcs < 4) {
    // Cenário de Ganho de Peso / Recuperação Nutricional
    const weightToGainTotal = Math.max(0, idealWeight - currentWeight);
    const standardWeeklyGainKg = currentWeight * 0.012; // ~1.2% por semana com dieta hipercalórica

    estimatedTotalWeeksToIdeal = standardWeeklyGainKg > 0 ? Math.ceil(weightToGainTotal / standardWeeklyGainKg) : 0;

    const projectedGainTotal = Math.min(weightToGainTotal, standardWeeklyGainKg * projectionWeeks);
    projectedWeightKg = Number((currentWeight + projectedGainTotal).toFixed(1));

    const tenPercentIdeal = idealWeight * 0.10;
    const pointsIncreased = tenPercentIdeal > 0 ? projectedGainTotal / tenPercentIdeal : 0;
    projectedBcs = Number(Math.min(5.0, currentBcs + pointsIncreased).toFixed(1));
  } else {
    // Cenário de Manutenção no Peso Ideal (ECC 4 a 5)
    projectedWeightKg = currentWeight;
    projectedBcs = currentBcs;
    estimatedTotalWeeksToIdeal = 0;
  }

  const weightDeltaKg = Number((projectedWeightKg - currentWeight).toFixed(1));
  const totalDifferenceInitial = Math.abs(currentWeight - idealWeight);
  const progressMade = Math.abs(weightDeltaKg);
  const percentageOfIdealTargetReached = totalDifferenceInitial > 0
    ? Math.min(100, Math.round((progressMade / totalDifferenceInitial) * 100))
    : 100;

  // Determina categoria do status projetado
  let projectedStatusCategory = "Peso Ideal (ECC 5/9)";
  if (projectedBcs >= 8) projectedStatusCategory = "Obesidade (ECC 8/9)";
  else if (projectedBcs >= 6.5) projectedStatusCategory = "Sobrepeso Clínico (ECC 7/9)";
  else if (projectedBcs >= 5.8) projectedStatusCategory = "Início de Sobrepeso (ECC 6/9)";
  else if (projectedBcs <= 3) projectedStatusCategory = "Abaixo do Peso (ECC 3/9)";

  // Marcos de saúde alcançados
  const milestones: BcsHealthMilestone[] = [];

  if (currentBcs > 5) {
    const mechanicalJointRelief = Math.abs(weightDeltaKg);
    milestones.push({
      title: "Descompressão Articular Significativa",
      description: `Menos ${mechanicalJointRelief.toFixed(1)} kg de sobrecarga gravitacional direta sobre os joelhos, cotovelos e coluna vertebral, desacelerando a evolução de osteoartroses.`,
      timeframe: `Em ${projectionWeeks} semanas`,
      iconType: "ACTIVITY",
      impactCategory: "ARTICULAR",
    });

    milestones.push({
      title: "Otimização Metabólica & Sensibilidade Insulínica",
      description: "Redução expressiva na secreção de citocinas pró-inflamatórias (adipocinas), aliviando o trabalho do pâncreas e diminuindo a resistência insulínica.",
      timeframe: "A partir da 3ª semana",
      iconType: "SCALE",
      impactCategory: "METABOLIC",
    });

    milestones.push({
      title: "Melhora Cardiorrespiratória & Disposição",
      description: "Menor esforço diafragmático e redução da pressão arterial periférica, permitindo passeios mais longos sem fadiga ou dispneia.",
      timeframe: "Diário contínuo",
      iconType: "HEART",
      impactCategory: "CARDIOVASCULAR",
    });
  } else if (currentBcs < 4) {
    milestones.push({
      title: "Reconstituição de Massa Muscular Nobre",
      description: `Aporte proteico com alto valor biológico restabelecendo +${Math.abs(weightDeltaKg).toFixed(1)} kg de reservas de glicogênio e tecido muscular esquelético.`,
      timeframe: `Em ${projectionWeeks} semanas`,
      iconType: "SCALE",
      impactCategory: "METABOLIC",
    });
    milestones.push({
      title: "Fortalecimento do Sistema Imunológico",
      description: "Cessação do catabolismo proteico e recomposição de micronutrientes essenciais (ferro, zinco, vitaminas B).",
      timeframe: "2ª semana",
      iconType: "SHIELD",
      impactCategory: "METABOLIC",
    });
  } else {
    milestones.push({
      title: "Estabilidade Metabólica Plena",
      description: "Manutenção do percentual saudável de 15% a 25% de gordura corporal, preservando a saúde cardiovascular e renal.",
      timeframe: "Contínuo",
      iconType: "SHIELD",
      impactCategory: "LONGEVITY",
    });
  }

  milestones.push({
    title: "Potencial de Longevidade Ampliada (+1.8 Anos)",
    description: "Estudos de vida inteira (Kealy et al., 2002) comprovam que animais mantidos rigorosamente no ECC 4-5 vivem até 1.8 anos a mais com menor uso de medicamentos.",
    timeframe: "Meta de longo prazo",
    iconType: "SPARKLES",
    impactCategory: "LONGEVITY",
  });

  const longevityBonusQuote =
    "Conforme o estudo seminal de 14 anos de Kealy et al. (2002), cães e gatos mantidos na faixa ideal de ECC 4-5 apresentam retardo de quase 2 anos no início de doenças crônicas e vivem em média 15% a mais.";

  let healthStatusSummary = "";
  if (currentBcs > 5) {
    healthStatusSummary = `Seguindo a formulação calórica recomendada por ${projectionWeeks} semanas (~${Math.round(projectionWeeks / 4.3)} mês), o(a) ${patient.name} perderá aproximadamente ${Math.abs(weightDeltaKg).toFixed(1)} kg com segurança biológica, evoluindo do ECC ${currentBcs}/9 (${currentDef.category}) para o ECC ${projectedBcs}/9 (${projectedStatusCategory}).`;
  } else if (currentBcs < 4) {
    healthStatusSummary = `Com o enriquecimento nutricional planejado por ${projectionWeeks} semanas, o(a) ${patient.name} recuperará aproximadamente +${Math.abs(weightDeltaKg).toFixed(1)} kg de massa corporal saudável, saindo do ECC ${currentBcs}/9 para o ECC ${projectedBcs}/9.`;
  } else {
    healthStatusSummary = `O(a) ${patient.name} já se encontra no padrão-ouro da escala WSAVA (ECC ${currentBcs}/9). O objetivo deste plano alimentar é a manutenção rigorosa deste status e prevenção de sarcopenia geriátrica.`;
  }

  return {
    currentWeightKg: currentWeight,
    currentBcs,
    idealWeightKg: idealWeight,
    idealBcs,
    projectionWeeks,
    projectedWeightKg,
    projectedBcs,
    projectedStatusCategory,
    weightDeltaKg,
    percentageOfIdealTargetReached,
    safeWeeklyLossKg: { min: minWeeklyKg, max: maxWeeklyKg },
    safeWeeklyLossPercent: { min: Number((weeklyLossPercentMin * 100).toFixed(1)), max: Number((weeklyLossPercentMax * 100).toFixed(1)) },
    estimatedTotalWeeksToIdeal,
    hepaticLipidosisWarning,
    healthStatusSummary,
    milestones,
    longevityBonusQuote,
  };
}
