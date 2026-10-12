import { Patient, ExamDocument, MeasurementRecord, Species } from "@/types";

export type DeficiencyCategory =
  | "RENAL_URINARY"
  | "NUTRITIONAL_WEIGHT"
  | "OSTEOARTICULAR"
  | "HEPATIC_BILIARY"
  | "CARDIOVASCULAR"
  | "DERMATO_ALLERGIC"
  | "HEMATO_IMMUNE"
  | "GASTRO_PARASITIC"
  | "ENDOCRINE"
  | "RESPIRATORY";

export interface CategoryMetadata {
  id: DeficiencyCategory;
  label: string;
  shortLabel: string;
  iconName: string;
  colorBg: string;
  colorText: string;
  borderColor: string;
  zootecnicTip: string;
}

export const DEFICIENCY_CATEGORIES: Record<DeficiencyCategory, CategoryMetadata> = {
  RENAL_URINARY: {
    id: "RENAL_URINARY",
    label: "Renal & Trato Urinário",
    shortLabel: "Renal",
    iconName: "Droplets",
    colorBg: "bg-amber-50",
    colorText: "text-amber-800",
    borderColor: "border-amber-200",
    zootecnicTip: "Restrição de fósforo (<1.0g/1000kcal), aporte hídrico elevado (≥60ml/kg) e modulação proteica de alto valor biológico.",
  },
  NUTRITIONAL_WEIGHT: {
    id: "NUTRITIONAL_WEIGHT",
    label: "Nutricional & Condição Corporal (ECC)",
    shortLabel: "Peso/ECC",
    iconName: "Scale",
    colorBg: "bg-orange-50",
    colorText: "text-orange-800",
    borderColor: "border-orange-200",
    zootecnicTip: "Manejo da ingestão energética (NEM restrito), enriquecimento em fibras solúveis/insolúveis e inclusão de L-carnitina.",
  },
  OSTEOARTICULAR: {
    id: "OSTEOARTICULAR",
    label: "Osteoarticular & Locomotor",
    shortLabel: "Articular",
    iconName: "Activity",
    colorBg: "bg-indigo-50",
    colorText: "text-indigo-800",
    borderColor: "border-indigo-200",
    zootecnicTip: "Suplementação de ômega-3 marinho (EPA/DHA em alta dose), colágeno tipo II e sulfato de condroitina/glicosamina.",
  },
  HEPATIC_BILIARY: {
    id: "HEPATIC_BILIARY",
    label: "Hepático & Biliar",
    shortLabel: "Hepático",
    iconName: "Flame",
    colorBg: "bg-rose-50",
    colorText: "text-rose-800",
    borderColor: "border-rose-200",
    zootecnicTip: "Dieta hiperdigestível com antioxidantes (vitamina E, silimarina), zinco quelato e modulação de cobre.",
  },
  CARDIOVASCULAR: {
    id: "CARDIOVASCULAR",
    label: "Cardiovascular & Eletrocardiográfico",
    shortLabel: "Cardíaco",
    iconName: "HeartPulse",
    colorBg: "bg-red-50",
    colorText: "text-red-800",
    borderColor: "border-red-200",
    zootecnicTip: "Controle estrito de sódio, suplementação de taurina, L-carnitina e ácidos graxos essenciais anti-arritmogênicos.",
  },
  DERMATO_ALLERGIC: {
    id: "DERMATO_ALLERGIC",
    label: "Dermatológico & Alergias Alimentares",
    shortLabel: "Alergias",
    iconName: "Sparkles",
    colorBg: "bg-pink-50",
    colorText: "text-pink-800",
    borderColor: "border-pink-200",
    zootecnicTip: "Protocolo de exclusão com proteína única ou inovadora, enriquecimento com biotina e zinco para barreira cutânea.",
  },
  HEMATO_IMMUNE: {
    id: "HEMATO_IMMUNE",
    label: "Hematológico & Imunológico",
    shortLabel: "Hematológico",
    iconName: "ShieldAlert",
    colorBg: "bg-purple-50",
    colorText: "text-purple-800",
    borderColor: "border-purple-200",
    zootecnicTip: "Aporte bioadequado de ferro heme, ácido fólico, vitamina B12 e proteínas nobres para eritropoiese.",
  },
  GASTRO_PARASITIC: {
    id: "GASTRO_PARASITIC",
    label: "Gastrointestinal & Parasitário",
    shortLabel: "Gastrointestinal",
    iconName: "Bug",
    colorBg: "bg-emerald-50",
    colorText: "text-emerald-800",
    borderColor: "border-emerald-200",
    zootecnicTip: "Prebióticos (FOS/MOS), probióticos cepa-específicos e fibras reguladoras de motilidade e microbioma.",
  },
  ENDOCRINE: {
    id: "ENDOCRINE",
    label: "Endócrino & Hormonal",
    shortLabel: "Endócrino",
    iconName: "Clock",
    colorBg: "bg-cyan-50",
    colorText: "text-cyan-800",
    borderColor: "border-cyan-200",
    zootecnicTip: "Estabilização de carboidratos com baixo índice glicêmico e modulação iônica mineral equilibrada.",
  },
  RESPIRATORY: {
    id: "RESPIRATORY",
    label: "Respiratório & Pulmonar",
    shortLabel: "Respiratório",
    iconName: "Wind",
    colorBg: "bg-sky-50",
    colorText: "text-sky-800",
    borderColor: "border-sky-200",
    zootecnicTip: "Controle de peso rigoroso para evitar compressão diafragmática e inclusão de antioxidantes respiratórios.",
  },
};

export interface DetectedDeficiency {
  id: string;
  name: string;
  category: DeficiencyCategory;
  categoryLabel: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  source: "COMORBIDITY" | "EXAM_BIOMARKER" | "MEASUREMENT" | "ALLERGY";
  detail: string;
}

export interface AnalyzedPatientProfile {
  patient: Patient;
  species: Species;
  bcs: number;
  weightKg: number;
  nutritionalStatus: "EUTRÓFICO" | "SOBREPESO" | "OBESO" | "MAGREZA";
  deficiencies: DetectedDeficiency[];
  highestSeverity: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  primaryDietaryFocus: string;
  examCount: number;
}

export interface SpeciesCensusSummary {
  species: Species;
  speciesLabel: string;
  total: number;
  withDeficiencies: number;
  withDeficienciesRate: number;
  topDeficiencies: {
    name: string;
    category: DeficiencyCategory;
    categoryLabel: string;
    count: number;
    percentage: number;
    severity: "HIGH" | "MEDIUM" | "LOW";
  }[];
  categoryDistribution: Record<
    DeficiencyCategory,
    { count: number; percentage: number; label: string }
  >;
  bcsDistribution: {
    ideal: { count: number; percentage: number };
    overweight: { count: number; percentage: number };
    obese: { count: number; percentage: number };
    underweight: { count: number; percentage: number };
  };
  severityBreakdown: {
    high: number;
    medium: number;
    low: number;
    none: number;
  };
}

export interface CategoryComparisonItem {
  category: DeficiencyCategory;
  categoryLabel: string;
  canineCount: number;
  caninePercentage: number;
  felineCount: number;
  felinePercentage: number;
  differencePercent: number;
  mostAffectedSpecies: "CANINE" | "FELINE" | "EQUAL";
  zootecnicTip: string;
}

export interface ClinicalCensusData {
  totalPatients: number;
  canineCount: number;
  felineCount: number;
  petsWithDeficienciesCount: number;
  petsWithDeficienciesRate: number;
  globalSeverityBreakdown: {
    high: number;
    medium: number;
    low: number;
    none: number;
  };
  canineSummary: SpeciesCensusSummary;
  felineSummary: SpeciesCensusSummary;
  crossSpeciesComparison: CategoryComparisonItem[];
  allPatientProfiles: AnalyzedPatientProfile[];
}

/**
 * Analisa as condições, comorbidades, exames e dados corporais de um paciente individual
 */
export function analyzePatientProfile(
  patient: Patient,
  patientExams: ExamDocument[],
  patientMeasurements: MeasurementRecord[]
): AnalyzedPatientProfile {
  const deficiencies: DetectedDeficiency[] = [];
  const bcs = patient.current_bcs || 5;
  const weightKg = patient.current_weight_kg || 10;

  // 1. Avaliação Nutricional & Ponderal (ECC)
  let nutritionalStatus: "EUTRÓFICO" | "SOBREPESO" | "OBESO" | "MAGREZA" = "EUTRÓFICO";
  if (bcs >= 8) {
    nutritionalStatus = "OBESO";
    deficiencies.push({
      id: "def-obese",
      name: "Obesidade Marcante (ECC 8-9/9)",
      category: "NUTRITIONAL_WEIGHT",
      categoryLabel: DEFICIENCY_CATEGORIES.NUTRITIONAL_WEIGHT.label,
      severity: "HIGH",
      source: "MEASUREMENT",
      detail: `Excesso adiposo severo com risco metabólico aumentado. Peso atual: ${weightKg}kg (Ideal: ${patient.ideal_weight_kg || weightKg * 0.8}kg).`,
    });
  } else if (bcs >= 6) {
    nutritionalStatus = "SOBREPESO";
    deficiencies.push({
      id: "def-overweight",
      name: "Sobrepeso Clínico (ECC 6-7/9)",
      category: "NUTRITIONAL_WEIGHT",
      categoryLabel: DEFICIENCY_CATEGORIES.NUTRITIONAL_WEIGHT.label,
      severity: "MEDIUM",
      source: "MEASUREMENT",
      detail: `Acúmulo de gordura corporal acima do padrão fisiológico ideal.`,
    });
  } else if (bcs <= 3) {
    nutritionalStatus = "MAGREZA";
    deficiencies.push({
      id: "def-underweight",
      name: "Magreza / Baixo Escore Corporal (ECC ≤ 3/9)",
      category: "NUTRITIONAL_WEIGHT",
      categoryLabel: DEFICIENCY_CATEGORIES.NUTRITIONAL_WEIGHT.label,
      severity: "HIGH",
      source: "MEASUREMENT",
      detail: `Massa muscular ou reservas energéticas depletadas. Demanda dieta hipercalórica de fácil digestão.`,
    });
  }

  // 2. Avaliação de Alergias Declaradas
  const allergies = Array.isArray(patient.allergies) ? patient.allergies : [];
  allergies.forEach((allergy, idx) => {
    if (!allergy || typeof allergy !== "string") return;
    deficiencies.push({
      id: `def-allergy-${idx}`,
      name: `Hipersensibilidade Alimentar (${allergy})`,
      category: "DERMATO_ALLERGIC",
      categoryLabel: DEFICIENCY_CATEGORIES.DERMATO_ALLERGIC.label,
      severity: "MEDIUM",
      source: "ALLERGY",
      detail: `Reação adversa ao alimento documentada na anamnese. Exige exclusão estrita.`,
    });
  });

  // 3. Avaliação de Comorbidades Declaradas
  const comorbidities = Array.isArray(patient.comorbidities) ? patient.comorbidities : [];
  comorbidities.forEach((comorbidity, idx) => {
    if (!comorbidity || typeof comorbidity !== "string") return;
    const lower = comorbidity.toLowerCase();

    // Renal / Urinário
    if (lower.includes("renal") || lower.includes("creatinina") || lower.includes("ureia") || lower.includes("azotemia") || lower.includes("iris")) {
      const isHigh = lower.includes("estágio 3") || lower.includes("estágio 4") || lower.includes("maciça") || lower.includes("3.3") || lower.includes("3.4");
      deficiencies.push({
        id: `def-comorb-renal-${idx}`,
        name: comorbidity.length > 50 ? "Doença Renal Crônica / Azotemia" : comorbidity,
        category: "RENAL_URINARY",
        categoryLabel: DEFICIENCY_CATEGORIES.RENAL_URINARY.label,
        severity: isHigh ? "HIGH" : "MEDIUM",
        source: "COMORBIDITY",
        detail: comorbidity,
      });
    }
    // Proteinúria ou Hiperfosfatemia
    else if (lower.includes("proteinúria") || lower.includes("fósforo") || lower.includes("hiperfosfatemia")) {
      deficiencies.push({
        id: `def-comorb-prot-phos-${idx}`,
        name: comorbidity,
        category: "RENAL_URINARY",
        categoryLabel: DEFICIENCY_CATEGORIES.RENAL_URINARY.label,
        severity: "HIGH",
        source: "COMORBIDITY",
        detail: comorbidity,
      });
    }
    // Osteoarticular / Locomotor
    else if (
      lower.includes("artrose") ||
      lower.includes("osteoartrose") ||
      lower.includes("displasia") ||
      lower.includes("discopatia") ||
      lower.includes("luxação") ||
      lower.includes("tplo") ||
      lower.includes("osteotomia")
    ) {
      deficiencies.push({
        id: `def-comorb-osteo-${idx}`,
        name: comorbidity,
        category: "OSTEOARTICULAR",
        categoryLabel: DEFICIENCY_CATEGORIES.OSTEOARTICULAR.label,
        severity: lower.includes("severa") || lower.includes("pós-op") ? "HIGH" : "MEDIUM",
        source: "COMORBIDITY",
        detail: comorbidity,
      });
    }
    // Hepático
    else if (lower.includes("hepátic") || lower.includes("colestase") || lower.includes("ggt") || lower.includes("alt") || lower.includes("fígado")) {
      deficiencies.push({
        id: `def-comorb-hep-${idx}`,
        name: comorbidity,
        category: "HEPATIC_BILIARY",
        categoryLabel: DEFICIENCY_CATEGORIES.HEPATIC_BILIARY.label,
        severity: "MEDIUM",
        source: "COMORBIDITY",
        detail: comorbidity,
      });
    }
    // Cardíaco
    else if (lower.includes("taquicardia") || lower.includes("cardíac") || lower.includes("ecg") || lower.includes("arritmia") || lower.includes("marca-passo")) {
      deficiencies.push({
        id: `def-comorb-card-${idx}`,
        name: comorbidity,
        category: "CARDIOVASCULAR",
        categoryLabel: DEFICIENCY_CATEGORIES.CARDIOVASCULAR.label,
        severity: "HIGH",
        source: "COMORBIDITY",
        detail: comorbidity,
      });
    }
    // Dermatológico / Alérgico
    else if (lower.includes("dermatite") || lower.includes("malassezia") || lower.includes("eosinofílico") || lower.includes("cgef") || lower.includes("alerg")) {
      deficiencies.push({
        id: `def-comorb-derm-${idx}`,
        name: comorbidity,
        category: "DERMATO_ALLERGIC",
        categoryLabel: DEFICIENCY_CATEGORIES.DERMATO_ALLERGIC.label,
        severity: "MEDIUM",
        source: "COMORBIDITY",
        detail: comorbidity,
      });
    }
    // Hematológico / Imunológico
    else if (lower.includes("anemia") || lower.includes("hematócrito") || lower.includes("eosinofilia") || lower.includes("plaquet")) {
      deficiencies.push({
        id: `def-comorb-hem-${idx}`,
        name: comorbidity,
        category: "HEMATO_IMMUNE",
        categoryLabel: DEFICIENCY_CATEGORIES.HEMATO_IMMUNE.label,
        severity: lower.includes("acentuada") || lower.includes("severa") ? "HIGH" : "MEDIUM",
        source: "COMORBIDITY",
        detail: comorbidity,
      });
    }
    // Gastrointestinal / Parasitário
    else if (lower.includes("ancilostomose") || lower.includes("ancylostoma") || lower.includes("parasit") || lower.includes("enterite")) {
      deficiencies.push({
        id: `def-comorb-gastro-${idx}`,
        name: comorbidity,
        category: "GASTRO_PARASITIC",
        categoryLabel: DEFICIENCY_CATEGORIES.GASTRO_PARASITIC.label,
        severity: "MEDIUM",
        source: "COMORBIDITY",
        detail: comorbidity,
      });
    }
    // Endócrino
    else if (lower.includes("tsh") || lower.includes("hipotireoidismo") || lower.includes("hipercalcemia") || lower.includes("glicose") || lower.includes("diabetes")) {
      deficiencies.push({
        id: `def-comorb-endo-${idx}`,
        name: comorbidity,
        category: "ENDOCRINE",
        categoryLabel: DEFICIENCY_CATEGORIES.ENDOCRINE.label,
        severity: lower.includes("hipercalcemia") ? "HIGH" : "MEDIUM",
        source: "COMORBIDITY",
        detail: comorbidity,
      });
    }
    // Respiratório
    else if (lower.includes("asma") || lower.includes("broncopatia") || lower.includes("pulmonar")) {
      deficiencies.push({
        id: `def-comorb-resp-${idx}`,
        name: comorbidity,
        category: "RESPIRATORY",
        categoryLabel: DEFICIENCY_CATEGORIES.RESPIRATORY.label,
        severity: "HIGH",
        source: "COMORBIDITY",
        detail: comorbidity,
      });
    }
  });

  // 4. Análise de Laudos Laboratoriais (Biomarcadores Críticos não duplicados)
  patientExams.forEach((exam) => {
    (exam.extracted_results || []).forEach((res) => {
      if (!res.is_out_of_range) return;
      const numVal = typeof res.value === "number" ? res.value : parseFloat(String(res.value).replace(",", "."));
      if (isNaN(numVal)) return;

      const paramLower = res.parameter.toLowerCase();

      // Creatinina
      if (paramLower.includes("creatinin")) {
        const threshold = patient.species === "FELINE" ? 1.6 : 1.4;
        if (numVal > threshold && !deficiencies.some((d) => d.category === "RENAL_URINARY" && d.name.toLowerCase().includes("creatinina"))) {
          deficiencies.push({
            id: `def-exam-creat-${exam.id}`,
            name: `Azotemia / Creatinina Elevada (${numVal} mg/dL)`,
            category: "RENAL_URINARY",
            categoryLabel: DEFICIENCY_CATEGORIES.RENAL_URINARY.label,
            severity: numVal > 2.8 ? "HIGH" : "MEDIUM",
            source: "EXAM_BIOMARKER",
            detail: `Valor laboratorial de ${numVal} mg/dL superior à referência máxima (${res.reference_range}).`,
          });
        }
      }

      // Fósforo
      if (paramLower.includes("fósforo") || paramLower.includes("fosforo")) {
        if (numVal > 5.5 && !deficiencies.some((d) => d.name.toLowerCase().includes("fósforo"))) {
          deficiencies.push({
            id: `def-exam-phos-${exam.id}`,
            name: `Hiperfosfatemia (${numVal} mg/dL)`,
            category: "RENAL_URINARY",
            categoryLabel: DEFICIENCY_CATEGORIES.RENAL_URINARY.label,
            severity: "HIGH",
            source: "EXAM_BIOMARKER",
            detail: `Nível sérico de fósforo alterado (${numVal} mg/dL). Requer restrição nutricional de fósforo.`,
          });
        }
      }

      // ALT / TGP
      if (paramLower.includes("alt") || paramLower.includes("tgp")) {
        if (numVal > 110 && !deficiencies.some((d) => d.category === "HEPATIC_BILIARY")) {
          deficiencies.push({
            id: `def-exam-alt-${exam.id}`,
            name: `Sobrecarga Hepática / ALT Elevada (${numVal} U/L)`,
            category: "HEPATIC_BILIARY",
            categoryLabel: DEFICIENCY_CATEGORIES.HEPATIC_BILIARY.label,
            severity: numVal > 200 ? "HIGH" : "MEDIUM",
            source: "EXAM_BIOMARKER",
            detail: `Enzima de lesão hepatocelular acima dos limites normais (${res.reference_range}).`,
          });
        }
      }

      // Hematócrito / Anemia
      if (paramLower.includes("hematócrito") || paramLower.includes("hematocrito") || paramLower.includes("ht")) {
        const minRef = patient.species === "FELINE" ? 28 : 37;
        if (numVal < minRef && !deficiencies.some((d) => d.category === "HEMATO_IMMUNE" && d.name.toLowerCase().includes("anemia"))) {
          deficiencies.push({
            id: `def-exam-ht-${exam.id}`,
            name: `Anemia / Hematócrito Reduzido (${numVal}%)`,
            category: "HEMATO_IMMUNE",
            categoryLabel: DEFICIENCY_CATEGORIES.HEMATO_IMMUNE.label,
            severity: numVal < 25 ? "HIGH" : "MEDIUM",
            source: "EXAM_BIOMARKER",
            detail: `Massa eritrocitária abaixo do limite mínimo da espécie (${res.reference_range}).`,
          });
        }
      }
    });
  });

  // Determina a maior gravidade clínica
  let highestSeverity: "HIGH" | "MEDIUM" | "LOW" | "NONE" = "NONE";
  if (deficiencies.some((d) => d.severity === "HIGH")) {
    highestSeverity = "HIGH";
  } else if (deficiencies.some((d) => d.severity === "MEDIUM")) {
    highestSeverity = "MEDIUM";
  } else if (deficiencies.some((d) => d.severity === "LOW")) {
    highestSeverity = "LOW";
  }

  // Foco zootécnico prioritário para a formulação da dieta
  let primaryDietaryFocus = "Manutenção preventiva equilibrada e longevidade.";
  if (deficiencies.some((d) => d.category === "RENAL_URINARY")) {
    primaryDietaryFocus = "Restrição de fósforo (<1.0g/1000kcal), aporte hídrico ampliado e modulação de proteínas de alto VB.";
  } else if (deficiencies.some((d) => d.category === "NUTRITIONAL_WEIGHT" && d.name.includes("Obeso"))) {
    primaryDietaryFocus = "Déficit calórico planejado (80% do NEM ideal), fibras solúveis sacietógenas e L-carnitina.";
  } else if (deficiencies.some((d) => d.category === "OSTEOARTICULAR")) {
    primaryDietaryFocus = "Modulação anti-inflamatória com alto teor de ômega-3 (EPA/DHA), colágeno e controle estrito de carga ponderal.";
  } else if (deficiencies.some((d) => d.category === "DERMATO_ALLERGIC")) {
    primaryDietaryFocus = "Dieta de exclusão com fonte proteica nobre única e suporte à barreira cutânea (zinco/biotina).";
  } else if (deficiencies.some((d) => d.category === "HEPATIC_BILIARY")) {
    primaryDietaryFocus = "Alta digestibilidade, modulação proteica sem amônia e suporte antioxidante com vitamina E.";
  }

  return {
    patient,
    species: patient.species,
    bcs,
    weightKg,
    nutritionalStatus,
    deficiencies,
    highestSeverity,
    primaryDietaryFocus,
    examCount: patientExams.length,
  };
}

/**
 * Agrega o censo epidemiológico e zootécnico geral e comparativo entre Caninos e Felinos
 */
export function generateClinicalCensus(
  patients: Patient[],
  exams: ExamDocument[],
  measurements: MeasurementRecord[]
): ClinicalCensusData {
  const analyzedProfiles = patients.map((p) => {
    const pExams = exams.filter((e) => e.patient_id === p.id);
    const pMeas = measurements.filter((m) => m.patient_id === p.id);
    return analyzePatientProfile(p, pExams, pMeas);
  });

  const canineProfiles = analyzedProfiles.filter((p) => p.species === "CANINE");
  const felineProfiles = analyzedProfiles.filter((p) => p.species === "FELINE");

  const buildSpeciesSummary = (
    species: Species,
    label: string,
    profiles: AnalyzedPatientProfile[]
  ): SpeciesCensusSummary => {
    const total = profiles.length;
    const withDeficienciesProfiles = profiles.filter((p) => p.deficiencies.length > 0);
    const withDeficiencies = withDeficienciesProfiles.length;
    const withDeficienciesRate = total > 0 ? Number(((withDeficiencies / total) * 100).toFixed(1)) : 0;

    // Frequência de deficiências específicas
    const defCounts: Record<
      string,
      { count: number; category: DeficiencyCategory; severity: "HIGH" | "MEDIUM" | "LOW" }
    > = {};

    profiles.forEach((p) => {
      // evita contar duas vezes a mesma deficiência no mesmo pet
      const seen = new Set<string>();
      p.deficiencies.forEach((d) => {
        // normaliza nomes semelhantes
        let cleanName = d.name;
        if (cleanName.toLowerCase().includes("doença renal") || cleanName.toLowerCase().includes("azotemia")) {
          cleanName = "Doença Renal Crônica / Azotemia";
        } else if (cleanName.toLowerCase().includes("osteoartrose") || cleanName.toLowerCase().includes("artrose")) {
          cleanName = "Osteoartrose / Degeneração Articular";
        } else if (cleanName.toLowerCase().includes("displasia")) {
          cleanName = "Displasia Coxofemoral";
        } else if (cleanName.toLowerCase().includes("hipersensibilidade") || cleanName.toLowerCase().includes("alergia")) {
          cleanName = "Hipersensibilidade / Alergia Alimentar";
        }

        if (!seen.has(cleanName)) {
          seen.add(cleanName);
          if (!defCounts[cleanName]) {
            defCounts[cleanName] = { count: 0, category: d.category, severity: d.severity };
          }
          defCounts[cleanName].count += 1;
        }
      });
    });

    const topDeficiencies = Object.entries(defCounts)
      .map(([name, data]) => ({
        name,
        category: data.category,
        categoryLabel: DEFICIENCY_CATEGORIES[data.category]?.label || "Outros",
        count: data.count,
        percentage: total > 0 ? Number(((data.count / total) * 100).toFixed(1)) : 0,
        severity: data.severity,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Distribuição por Categoria
    const categoryDistribution: Record<
      DeficiencyCategory,
      { count: number; percentage: number; label: string }
    > = {} as any;

    Object.keys(DEFICIENCY_CATEGORIES).forEach((catKey) => {
      const cat = catKey as DeficiencyCategory;
      const count = profiles.filter((p) => p.deficiencies.some((d) => d.category === cat)).length;
      categoryDistribution[cat] = {
        count,
        percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
        label: DEFICIENCY_CATEGORIES[cat].label,
      };
    });

    // Distribuição ECC
    const ideal = profiles.filter((p) => p.nutritionalStatus === "EUTRÓFICO").length;
    const overweight = profiles.filter((p) => p.nutritionalStatus === "SOBREPESO").length;
    const obese = profiles.filter((p) => p.nutritionalStatus === "OBESO").length;
    const underweight = profiles.filter((p) => p.nutritionalStatus === "MAGREZA").length;

    return {
      species,
      speciesLabel: label,
      total,
      withDeficiencies,
      withDeficienciesRate,
      topDeficiencies,
      categoryDistribution,
      bcsDistribution: {
        ideal: { count: ideal, percentage: total > 0 ? Number(((ideal / total) * 100).toFixed(1)) : 0 },
        overweight: { count: overweight, percentage: total > 0 ? Number(((overweight / total) * 100).toFixed(1)) : 0 },
        obese: { count: obese, percentage: total > 0 ? Number(((obese / total) * 100).toFixed(1)) : 0 },
        underweight: { count: underweight, percentage: total > 0 ? Number(((underweight / total) * 100).toFixed(1)) : 0 },
      },
      severityBreakdown: {
        high: profiles.filter((p) => p.highestSeverity === "HIGH").length,
        medium: profiles.filter((p) => p.highestSeverity === "MEDIUM").length,
        low: profiles.filter((p) => p.highestSeverity === "LOW").length,
        none: profiles.filter((p) => p.highestSeverity === "NONE").length,
      },
    };
  };

  const canineSummary = buildSpeciesSummary("CANINE", "Caninos", canineProfiles);
  const felineSummary = buildSpeciesSummary("FELINE", "Felinos", felineProfiles);

  // Comparativo Cruzado entre Caninos e Felinos por Categoria
  const crossSpeciesComparison: CategoryComparisonItem[] = (
    Object.keys(DEFICIENCY_CATEGORIES) as DeficiencyCategory[]
  ).map((cat) => {
    const canineItem = canineSummary.categoryDistribution[cat];
    const felineItem = felineSummary.categoryDistribution[cat];
    const diff = Number((canineItem.percentage - felineItem.percentage).toFixed(1));

    let mostAffectedSpecies: "CANINE" | "FELINE" | "EQUAL" = "EQUAL";
    if (canineItem.percentage > felineItem.percentage) mostAffectedSpecies = "CANINE";
    else if (felineItem.percentage > canineItem.percentage) mostAffectedSpecies = "FELINE";

    return {
      category: cat,
      categoryLabel: DEFICIENCY_CATEGORIES[cat].label,
      canineCount: canineItem.count,
      caninePercentage: canineItem.percentage,
      felineCount: felineItem.count,
      felinePercentage: felineItem.percentage,
      differencePercent: Math.abs(diff),
      mostAffectedSpecies,
      zootecnicTip: DEFICIENCY_CATEGORIES[cat].zootecnicTip,
    };
  }).sort((a, b) => (b.canineCount + b.felineCount) - (a.canineCount + a.felineCount));

  const totalPatients = patients.length;
  const petsWithDeficiencies = analyzedProfiles.filter((p) => p.deficiencies.length > 0).length;

  return {
    totalPatients,
    canineCount: canineProfiles.length,
    felineCount: felineProfiles.length,
    petsWithDeficienciesCount: petsWithDeficiencies,
    petsWithDeficienciesRate: totalPatients > 0 ? Number(((petsWithDeficiencies / totalPatients) * 100).toFixed(1)) : 0,
    globalSeverityBreakdown: {
      high: analyzedProfiles.filter((p) => p.highestSeverity === "HIGH").length,
      medium: analyzedProfiles.filter((p) => p.highestSeverity === "MEDIUM").length,
      low: analyzedProfiles.filter((p) => p.highestSeverity === "LOW").length,
      none: analyzedProfiles.filter((p) => p.highestSeverity === "NONE").length,
    },
    canineSummary,
    felineSummary,
    crossSpeciesComparison,
    // Ordena perfis: primeiro os de alta gravidade, depois média, depois por quantidade de deficiências
    allPatientProfiles: analyzedProfiles.sort((a, b) => {
      const sevScore = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
      const diffSev = sevScore[b.highestSeverity] - sevScore[a.highestSeverity];
      if (diffSev !== 0) return diffSev;
      return b.deficiencies.length - a.deficiencies.length;
    }),
  };
}
