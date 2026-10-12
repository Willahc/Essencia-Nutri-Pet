import { Species, ExamParameterResult } from "@/types";

/**
 * Motor de Triagem e Alerta Precoce de Visita Veterinária
 * Identifica "Red Flags" laboratoriais em laudos e gera recomendações preventivas
 * para o tutor e carta de encaminhamento para o Médico-Veterinário assistente.
 */

export type ReferralUrgency = 'NONE' | 'ATTENTION' | 'RECOMMENDED' | 'URGENT';

export interface ClinicalRedFlag {
  category: 'RENAL' | 'HEPATIC' | 'HEMATOLOGY' | 'ELECTROLYTES' | 'ENDOCRINE' | 'URINARY' | 'OTHER';
  biomarker: string;
  observedValue: string;
  referenceRange: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  clinicalMeaning: string;
  tutorExplanation: string;
}

export interface VeterinaryReferralAlert {
  hasAlert: boolean;
  urgency: ReferralUrgency;
  urgencyBadgeText: string;
  title: string;
  summary: string;
  redFlags: ClinicalRedFlag[];
  recommendedSpecialties: string[];
  suggestedActionTimeline: string;
  tutorGuidance: {
    overview: string;
    whatToTellTheVet: string[];
    whatQuestionsToAsk: string[];
  };
  referralLetterText: string;
}

function parseNumber(val: any): number | null {
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (!val) return null;
  const cleaned = String(val).replace(',', '.').replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Analisa os resultados laboratoriais em busca de alterações que demandem avaliação veterinária presencial
 */
export function detectVeterinaryReferralAlert(params: {
  patientName: string;
  species: Species;
  breed?: string;
  age?: string;
  tutorName?: string;
  examDate?: string;
  laboratoryName?: string;
  results: ExamParameterResult[];
}): VeterinaryReferralAlert {
  const {
    patientName,
    species,
    breed = "SRD",
    tutorName = "Tutor(a)",
    examDate = new Date().toISOString().split("T")[0],
    laboratoryName = "Laboratório Veterinário",
    results = [],
  } = params;

  const isCanine = species === 'CANINE';
  const redFlags: ClinicalRedFlag[] = [];
  const specialtiesSet = new Set<string>();

  // Helpers de busca
  const findItem = (pattern: RegExp) => results.find((r) => pattern.test(r.parameter));

  // 1. AVALIAÇÃO RENAL
  const creatItem = findItem(/creatinin/i);
  const creatVal = creatItem ? parseNumber(creatItem.value) : null;
  const sdmaItem = findItem(/sdma/i);
  const sdmaVal = sdmaItem ? parseNumber(sdmaItem.value) : null;
  const ureiaItem = findItem(/ur[eé]ia|bun/i);
  const ureiaVal = ureiaItem ? parseNumber(ureiaItem.value) : null;
  const pItem = findItem(/f[oó]sforo|phosphor/i);
  const pVal = pItem ? parseNumber(pItem.value) : null;
  const caItem = findItem(/c[aá]lcio|calcium/i);
  const caVal = caItem ? parseNumber(caItem.value) : null;

  // Creatinina
  if (creatVal !== null) {
    const renalLimit = isCanine ? 1.4 : 1.6;
    const severeLimit = isCanine ? 2.5 : 2.8;

    if (creatVal >= severeLimit) {
      redFlags.push({
        category: 'RENAL',
        biomarker: 'Creatinina Sérica',
        observedValue: `${creatVal} ${creatItem?.unit || 'mg/dL'}`,
        referenceRange: creatItem?.reference_range || (isCanine ? "0.5 - 1.4 mg/dL" : "0.8 - 1.6 mg/dL"),
        severity: 'SEVERE',
        clinicalMeaning: `Azotemia renal moderada a grave. Indica perda substancial da taxa de filtração glomerular.`,
        tutorExplanation: `A creatinina é um indicador direto do funcionamento dos rins. O valor está elevado, o que indica que os rins estão precisando de suporte médico especializado para filtrar os resíduos do organismo.`,
      });
      specialtiesSet.add("Nefrologista Veterinário");
    } else if (creatVal > renalLimit) {
      redFlags.push({
        category: 'RENAL',
        biomarker: 'Creatinina Sérica',
        observedValue: `${creatVal} ${creatItem?.unit || 'mg/dL'}`,
        referenceRange: creatItem?.reference_range || (isCanine ? "0.5 - 1.4 mg/dL" : "0.8 - 1.6 mg/dL"),
        severity: 'MODERATE',
        clinicalMeaning: `Azotemia renal inicial/leve compatível com Estágio 2 IRIS.`,
        tutorExplanation: `A creatinina está ligeiramente acima da faixa ideal. Detectar isso cedo é a melhor notícia, pois permite estabilizar a função renal antes que os sintomas apareçam.`,
      });
      specialtiesSet.add("Nefrologista Veterinário");
    }
  }

  // SDMA (Biomarcador Precoce)
  if (sdmaVal !== null && sdmaVal > 14) {
    redFlags.push({
      category: 'RENAL',
      biomarker: 'SDMA (Dimetilarginina Simétrica)',
      observedValue: `${sdmaVal} ${sdmaItem?.unit || 'µg/dL'}`,
      referenceRange: sdmaItem?.reference_range || "0 - 14 µg/dL",
      severity: sdmaVal > 25 ? 'SEVERE' : 'MODERATE',
      clinicalMeaning: `Dimetilarginina simétrica elevada, indicativo precoce de decréscimo da filtração renal glomerular (>25-40%).`,
      tutorExplanation: `O SDMA é o marcador mais moderno e precoce da saúde renal. Ele avisa sobre sobrecargas nos rins muito antes de outros exames convencionais.`,
    });
    specialtiesSet.add("Nefrologista Veterinário");
  }

  // Ureia
  if (ureiaVal !== null) {
    const ureiaLimit = isCanine ? 70 : 80;
    if (ureiaVal > ureiaLimit) {
      redFlags.push({
        category: 'RENAL',
        biomarker: 'Ureia Sérica',
        observedValue: `${ureiaVal} ${ureiaItem?.unit || 'mg/dL'}`,
        referenceRange: ureiaItem?.reference_range || (isCanine ? "15 - 65 mg/dL" : "20 - 75 mg/dL"),
        severity: ureiaVal > 140 ? 'SEVERE' : 'MODERATE',
        clinicalMeaning: `Acúmulo sérico de compostos nitrogenados decorrentes do metabolismo proteico.`,
        tutorExplanation: `A ureia mede substâncias derivadas das proteínas que devem ser eliminadas na urina. Valores aumentados exigem ajuste na qualidade das proteínas e hidratação.`,
      });
      specialtiesSet.add("Clínico Geral Veterinário");
    }
  }

  // Produto Fosfocálcico Ca x P
  if (caVal !== null && pVal !== null) {
    const caTimesP = Number((caVal * pVal).toFixed(1));
    if (caTimesP > 55) {
      redFlags.push({
        category: 'ELECTROLYTES',
        biomarker: 'Produto Fosfocálcico (Ca x P)',
        observedValue: `${caTimesP} mg²/dL²`,
        referenceRange: "< 55 mg²/dL²",
        severity: 'SEVERE',
        clinicalMeaning: `Produto Cálcio x Fósforo acima de 55. Risco iminente de mineralização metastática e nefrocalcinose renal.`,
        tutorExplanation: `A combinação de cálcio e fósforo no sangue está acima do teto de segurança. Há risco dos minerais se depositarem nos rins e vasos, necessitando de controle de quelantes e avaliação médica urgente.`,
      });
      specialtiesSet.add("Nefrologista Veterinário");
    }
  }

  // Cálcio isolado (Alerta de Hipercalcemia como a Lili)
  if (caVal !== null && caVal > 12.0) {
    redFlags.push({
      category: 'ELECTROLYTES',
      biomarker: 'Cálcio Sérico Total',
      observedValue: `${caVal} ${caItem?.unit || 'mg/dL'}`,
      referenceRange: caItem?.reference_range || "9.0 - 11.8 mg/dL",
      severity: caVal > 13.5 ? 'SEVERE' : 'MODERATE',
      clinicalMeaning: `Hipercalcemia sérica acentuada. Requer investigação para hiperparatireoidismo, nefropatia ou síndromes paraneoplásicas.`,
      tutorExplanation: `O nível de cálcio está elevado. A suplementação de cálcio na comida deve ser imediatamente suspensa até investigação detalhada com o veterinário.`,
    });
    specialtiesSet.add("Endocrinologista Veterinário");
  }

  // 2. AVALIAÇÃO HEPÁTICA
  const altItem = findItem(/alt|tgp/i);
  const altVal = altItem ? parseNumber(altItem.value) : null;
  const faItem = findItem(/fosfatase alcalina|fa/i);
  const faVal = faItem ? parseNumber(faItem.value) : null;
  const biliItem = findItem(/bilirrubina.*total/i);
  const biliVal = biliItem ? parseNumber(biliItem.value) : null;

  if (altVal !== null) {
    const altLimit = isCanine ? 110 : 100;
    if (altVal >= 250) {
      redFlags.push({
        category: 'HEPATIC',
        biomarker: 'ALT / TGP (Alanina Aminotransferase)',
        observedValue: `${altVal} ${altItem?.unit || 'U/L'}`,
        referenceRange: altItem?.reference_range || "10 - 100 U/L",
        severity: 'SEVERE',
        clinicalMeaning: `Lesão hepatocelular aguda ou crônica com extravasamento enzimático citoplasmático acentuado.`,
        tutorExplanation: `A enzima ALT indica integridade das células do fígado. O aumento expressivo pede investigação com ultrassom abdominal e acompanhamento médico.`,
      });
      specialtiesSet.add("Gastroenterologista / Hepatologista Veterinário");
    } else if (altVal > altLimit) {
      redFlags.push({
        category: 'HEPATIC',
        biomarker: 'ALT / TGP',
        observedValue: `${altVal} ${altItem?.unit || 'U/L'}`,
        referenceRange: altItem?.reference_range || "10 - 100 U/L",
        severity: 'MILD',
        clinicalMeaning: `Aumento discreto a moderado de enzima de extravasamento hepático.`,
        tutorExplanation: `Pequeno aumento nas enzimas hepáticas, comum em processos inflamatórios ou medicamentosos.`,
      });
      specialtiesSet.add("Clínico Geral Veterinário");
    }
  }

  if (faVal !== null && faVal > 250) {
    redFlags.push({
      category: 'HEPATIC',
      biomarker: 'Fosfatase Alcalina (FA)',
      observedValue: `${faVal} ${faItem?.unit || 'U/L'}`,
      referenceRange: faItem?.reference_range || "20 - 156 U/L",
      severity: faVal > 500 ? 'SEVERE' : 'MODERATE',
      clinicalMeaning: `Colestase biliar, indução enzimática hormonal (cortisol) ou remodelamento ósseo.`,
      tutorExplanation: `A fosfatase alcalina reflete o fluxo biliar e o metabolismo hepático e hormonal. O valor aumentado sugere verificar vesícula biliar e adrenal.`,
    });
    specialtiesSet.add("Clínico Geral Veterinário");
  }

  if (biliVal !== null && biliVal > 0.4) {
    redFlags.push({
      category: 'HEPATIC',
      biomarker: 'Bilirrubina Total',
      observedValue: `${biliVal} ${biliItem?.unit || 'mg/dL'}`,
      referenceRange: biliItem?.reference_range || "0.1 - 0.4 mg/dL",
      severity: 'SEVERE',
      clinicalMeaning: `Hiperbilirrubinemia clínica/subclínica. Avaliar hemólise, hepatopatia ou obstrução biliar pós-hepática.`,
      tutorExplanation: `A bilirrubina indica a drenagem da bile e a reciclagem dos glóbulos vermelhos. Níveis elevados demandam consulta médica com brevidade.`,
    });
    specialtiesSet.add("Gastroenterologista / Hepatologista Veterinário");
  }

  // 3. AVALIAÇÃO HEMATOLÓGICA (Anemia, Infecção, Plaquetas)
  const htItem = findItem(/hemat[oó]crito|ht|vg/i);
  const htVal = htItem ? parseNumber(htItem.value) : null;
  const plqItem = findItem(/plaqueta/i);
  const plqVal = plqItem ? parseNumber(plqItem.value) : null;
  const leucItem = findItem(/leuc[oó]cito.*total/i);
  const leucVal = leucItem ? parseNumber(leucItem.value) : null;

  if (htVal !== null) {
    const minHt = isCanine ? 37 : 24;
    const severeHt = isCanine ? 26 : 19;

    if (htVal < severeHt) {
      redFlags.push({
        category: 'HEMATOLOGY',
        biomarker: 'Hematócrito (Eritrograma)',
        observedValue: `${htVal}%`,
        referenceRange: htItem?.reference_range || (isCanine ? "37 - 55%" : "24 - 45%"),
        severity: 'SEVERE',
        clinicalMeaning: `Anemia acentuada/grave. Risco de hipóxia tecidual e fraqueza sistêmica.`,
        tutorExplanation: `O pet apresenta anemia relevante (volume de hemácias abaixo do esperado). Pode estar sentindo cansaço e falta de ar. É indispensável avaliação veterinária presencial.`,
      });
      specialtiesSet.add("Hematologista / Clínico Geral");
    } else if (htVal < minHt) {
      redFlags.push({
        category: 'HEMATOLOGY',
        biomarker: 'Hematócrito',
        observedValue: `${htVal}%`,
        referenceRange: htItem?.reference_range || (isCanine ? "37 - 55%" : "24 - 45%"),
        severity: 'MODERATE',
        clinicalMeaning: `Anemia leve a moderada. Investigar carências nutricionais, perda sanguínea ou doença crônica.`,
        tutorExplanation: `Anemia leve detectada. Vamos adequar o teor de ferro, vitaminas do complexo B e proteínas, mas uma consulta veterinária é recomendada para diagnosticar a causa.`,
      });
      specialtiesSet.add("Clínico Geral Veterinário");
    }
  }

  if (plqVal !== null) {
    // Tratando unidades em mil ou milhares
    const normalizedPlq = plqVal < 1000 ? plqVal * 1000 : plqVal;
    if (normalizedPlq < 80000) {
      redFlags.push({
        category: 'HEMATOLOGY',
        biomarker: 'Plaquetas',
        observedValue: `${normalizedPlq.toLocaleString('pt-BR')}/µL`,
        referenceRange: plqItem?.reference_range || "150.000 - 450.000/µL",
        severity: 'SEVERE',
        clinicalMeaning: `Trombocitopenia moderada a grave. Risco hemorrágico espontâneo. Pesquisar hemoparasitoses (Erliquiose, Anaplasma, Babesia) e imunomediadas.`,
        tutorExplanation: `As plaquetas são responsáveis pela coagulação do sangue e estão muito baixas. É importante checar picada de carrapato (doença do carrapato) e evitar traumas físicos.`,
      });
      specialtiesSet.add("Hematologista / Clínico Geral");
    } else if (normalizedPlq < 150000) {
      redFlags.push({
        category: 'HEMATOLOGY',
        biomarker: 'Plaquetas',
        observedValue: `${normalizedPlq.toLocaleString('pt-BR')}/µL`,
        referenceRange: plqItem?.reference_range || "150.000 - 450.000/µL",
        severity: 'MILD',
        clinicalMeaning: `Trombocitopenia discreta. Avaliar presença de agregados plaquetários ou fase precoce infecciosa.`,
        tutorExplanation: `Plaquetas levemente abaixo da referência. Recomenda-se repetir a contagem com o veterinário para descartar coágulos na amostra.`,
      });
      specialtiesSet.add("Clínico Geral Veterinário");
    }
  }

  if (leucVal !== null && leucVal > 20000) {
    redFlags.push({
      category: 'HEMATOLOGY',
      biomarker: 'Leucócitos Totais',
      observedValue: `${leucVal.toLocaleString('pt-BR')}/µL`,
      referenceRange: leucItem?.reference_range || "6.000 - 17.000/µL",
      severity: leucVal > 30000 ? 'SEVERE' : 'MODERATE',
      clinicalMeaning: `Leucocitose inflamatória/infecciosa expressiva. Requer busca ativa por foco infeccioso ou neoplásico.`,
      tutorExplanation: `Os glóbulos brancos de defesa estão altos, indicando que o corpinho do pet está combatendo uma inflamação ou infecção ativa.`,
    });
    specialtiesSet.add("Clínico Geral Veterinário");
  }

  // 4. AVALIAÇÃO METABÓLICA / ENDÓCRINA
  const glicItem = findItem(/glicose|glicemia/i);
  const glicVal = glicItem ? parseNumber(glicItem.value) : null;
  const tshItem = findItem(/tsh/i);
  const t4Item = findItem(/t4.*livre|t4.*total/i);

  if (glicVal !== null && glicVal > 180) {
    redFlags.push({
      category: 'ENDOCRINE',
      biomarker: 'Glicemia de Jejum',
      observedValue: `${glicVal} ${glicItem?.unit || 'mg/dL'}`,
      referenceRange: glicItem?.reference_range || "70 - 110 mg/dL",
      severity: glicVal > 280 ? 'SEVERE' : 'MODERATE',
      clinicalMeaning: `Hiperglicemia relevante. Investigar Diabetes Mellitus, estresse agudo (em felinos) ou hiperadrenocorticismo.`,
      tutorExplanation: `O açúcar no sangue está acima da faixa esperada. É essencial que o veterinário averigue para descartar diabetes e definir se haverá necessidade de insulina ou apenas manejo com fibras na dieta.`,
    });
    specialtiesSet.add("Endocrinologista Veterinário");
  }

  if (tshItem && parseNumber(tshItem.value) && Number(parseNumber(tshItem.value)) > 0.5) {
    redFlags.push({
      category: 'ENDOCRINE',
      biomarker: 'TSH Canino',
      observedValue: `${tshItem.value} ${tshItem.unit || 'ng/mL'}`,
      referenceRange: tshItem.reference_range || "< 0.5 ng/mL",
      severity: 'MODERATE',
      clinicalMeaning: `Hipotireoidismo canino primário provável quando associado a T4 livre baixo ou ganho de peso refratário.`,
      tutorExplanation: `A tireoide pode estar funcionando mais devagar, o que diminui o metabolismo e dificulta a perda de peso. Requer avaliação hormonal para reposição de levotiroxina.`,
    });
    specialtiesSet.add("Endocrinologista Veterinário");
  }

  // DETERMINAÇÃO DO NÍVEL DE URGÊNCIA
  const hasSevere = redFlags.some((rf) => rf.severity === 'SEVERE');
  const hasModerate = redFlags.some((rf) => rf.severity === 'MODERATE');
  const hasMild = redFlags.some((rf) => rf.severity === 'MILD');

  let urgency: ReferralUrgency = 'NONE';
  let urgencyBadgeText = "Sem Alertas Críticos";
  let suggestedActionTimeline = "Acompanhamento de rotina conforme calendário anual";

  if (hasSevere) {
    urgency = 'URGENT';
    urgencyBadgeText = "🚨 Avaliação Prioritária Recomendada (24h a 48h)";
    suggestedActionTimeline = "Agendar consulta veterinária prioritária em até 48 horas";
  } else if (hasModerate) {
    urgency = 'RECOMMENDED';
    urgencyBadgeText = "⚠️ Consulta Veterinária Recomendada (3 a 7 dias)";
    suggestedActionTimeline = "Agendar consulta presencial nos próximos 3 a 7 dias";
  } else if (hasMild) {
    urgency = 'ATTENTION';
    urgencyBadgeText = "ℹ️ Atenção Preventiva no Próximo Retorno";
    suggestedActionTimeline = "Discutir achados na próxima consulta ou retorno eletivo";
  }

  const defaultSpecialty = isCanine ? "Médico-Veterinário Clínico Geral" : "Médico-Veterinário com foco em Medicina Felina";
  if (specialtiesSet.size === 0) {
    specialtiesSet.add(defaultSpecialty);
  }
  const specialtiesList = Array.from(specialtiesSet);

  // GERAÇÃO DA CARTA DE ENCAMINHAMENTO
  const referralLetterText = `
================================================================================
ESSÊNCIA NUTRI PET • ENCAMINHAMENTO CLÍNICO INTERPROFISSIONAL
Supervisão Nutricional & Zootécnica de Pequenos Animais
================================================================================
Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}
Ao(À) Colega: Médico(a)-Veterinário(a) Assistente
Paciente: ${patientName} (${species === 'CANINE' ? 'Canino' : 'Felino'}, ${breed})
Tutor(a): ${tutorName}
Origem da Triagem: Avaliação laboratorial pré-formulação nutricional
Laboratório de Origem: ${laboratoryName} | Data do Laudo: ${new Date(examDate).toLocaleDateString("pt-BR")}

Prezado(a) Colega,

Durante a triagem laboratorial sistemática realizada na plataforma Essência Nutri Pet para planejamento dietético personalizado do(a) paciente ${patientName}, identificamos alterações em biomarcadores clínicos que sugerem necessidade de avaliação presencial médica e conduta diagnóstica complementar:

BIOMARCADORES DE ATENÇÃO DETECTADOS:
${redFlags.map((rf, idx) => `${idx + 1}. ${rf.biomarker}: ${rf.observedValue} (Ref: ${rf.referenceRange})
   → Relevância clínica: ${rf.clinicalMeaning}`).join("\n\n")}

CONDUTA ZOOTÉCNICA PRELIMINAR ADOTADA:
- O plano alimentar está sendo balanceado com salvaguardas nutricionais imediatas para mitigar a sobrecarga dos órgãos afetados (controle estrito de fósforo, sódio e densidade proteica conforme diretrizes NRC 2006 / FEDIAF / IRIS).
- Toda e qualquer suplementação contraindicada para o quadro (ex: cálcio oral em hipercalcemia) foi provisoriamente suspensa até seu parecer.

SOLICITAÇÃO DE AVALIAÇÃO COMPLEMENTAR SUGERIDA:
- Exame físico detalhado e aferição de pressão arterial sistólica.
- Exames complementares pertinentes (ex: Urinálise tipo 1 com RPCU, Ultrassonografia Abdominal e ecocardiograma).
- Encaminhamento sugerido para: ${specialtiesList.join(" ou ")}.

Permanecemos à disposição para alinhamento interprofissional da dietoterapia com o seu plano de tratamento medicamentoso.

Atenciosamente,

Equipe Zootécnica e Nutricional • Essência Nutri Pet
CRZ / CRMV em conformidade com as resoluções vigentes do CFMV
================================================================================
`.trim();

  return {
    hasAlert: redFlags.length > 0,
    urgency,
    urgencyBadgeText,
    title: hasSevere
      ? `Alerta Médico Veterinário Prioritário: Alterações Detectadas para ${patientName}`
      : redFlags.length > 0
      ? `Recomendação Preventiva de Visita Veterinária para ${patientName}`
      : `Parâmetros Laboratoriais Estáveis para ${patientName}`,
    summary:
      redFlags.length > 0
        ? `A análise identificou ${redFlags.length} ${
            redFlags.length === 1 ? 'parâmetro fora da faixa ideal' : 'parâmetros fora da faixa ideal'
          }. A nutrição personalizada já está agindo como suporte, mas uma avaliação clínica presencial é recomendada para investigar a causa raiz com antecedência.`
        : `Nenhum sinal crítico foi detectado neste laudo. O animal pode seguir com o planejamento nutricional padrão.`,
    redFlags,
    recommendedSpecialties: specialtiesList,
    suggestedActionTimeline,
    tutorGuidance: {
      overview: `A nutrição atua em parceria com a medicina veterinária. Ao identificar essas alterações precocemente, conseguimos evitar que o quadro progrida e garantimos mais longevidade e bem-estar para ${patientName}.`,
      whatToTellTheVet: [
        `Informar que o exame de sangue/urina recente acusou alterações em: ${redFlags.map((rf) => rf.biomarker).join(", ")}.`,
        `Explicar que o animal está em acompanhamento nutricional supervisionado pela Essência Nutri Pet.`,
        `Apresentar a Carta de Encaminhamento gerada pelo sistema (impressa ou via WhatsApp).`,
      ],
      whatQuestionsToAsk: [
        `"Doutor(a), essas alterações exigem algum medicamento específico ou exames de imagem (como ultrassom abdominal)?"`,
        `"Qual a periodicidade ideal para repetirmos esses exames de sangue para monitorar a evolução?"`,
        `"Há alguma restrição física ou sintoma de alerta que devo observar em casa no dia a dia?"`,
      ],
    },
    referralLetterText,
  };
}
