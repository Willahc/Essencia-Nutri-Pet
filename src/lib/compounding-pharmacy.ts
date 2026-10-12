import { Patient, NutritionPlan, ExamDocument, Species } from "@/types";

export interface ActiveIngredientItem {
  name: string;
  category: "MINERAL" | "VITAMIN" | "NUTRACEUTICAL" | "AMINOACID";
  dailyDoseFormatted: string;
  dailyDoseMg: number;
  functionRationale: string;
}

export interface CompoundingPrescription {
  patientId: string;
  patientName: string;
  species: Species;
  tutorName?: string;
  weightKg: number;
  dateGenerated: string;
  pharmaceuticalForm: "SACHETS" | "POWDER_JAR" | "CAPSULES";
  pharmaceuticalFormLabel: string;
  quantityUnits: number;
  flavoring: string;
  posologyInstructions: string;
  activeIngredients: ActiveIngredientItem[];
  technicGuidelines: string[];
  expirationDays: number;
  professionalName: string;
  crmvCrz: string;
}

/**
 * Motor de Cálculo & Formulação de Suplementação Magistral Veterinária
 * Calcula as dosagens com base no peso corporal (kg) e peso metabólico (kg^0.75) do paciente.
 */
export function generateCompoundingPrescription(
  patient: Patient,
  plan?: NutritionPlan,
  exams: ExamDocument[] = [],
  professionalName: string = "Dr. Roberto Almeida",
  crmvCrz: string = "CRZ 4821 / CRMV 41403"
): CompoundingPrescription {
  const species = patient.species;
  const weight = Math.max(1, patient.current_weight_kg || 10);
  const metabolicWeight = Math.pow(weight, 0.75);

  const comorbiditiesStr = (patient.comorbidities || []).join(" ").toLowerCase();
  const isRenal = comorbiditiesStr.includes("renal") || comorbiditiesStr.includes("iris") || comorbiditiesStr.includes("azotemia");
  const isOsteoarticular = comorbiditiesStr.includes("artrose") || comorbiditiesStr.includes("displasia") || comorbiditiesStr.includes("discopatia") || comorbiditiesStr.includes("tplo");
  const isHepatic = comorbiditiesStr.includes("hepátic") || comorbiditiesStr.includes("colestase") || comorbiditiesStr.includes("alt") || comorbiditiesStr.includes("fígado");
  const isOverweight = (patient.current_bcs || 5) >= 6 || comorbiditiesStr.includes("sobrepeso") || comorbiditiesStr.includes("obesidade");
  const isCardiac = comorbiditiesStr.includes("cardíac") || comorbiditiesStr.includes("taquicardia") || comorbiditiesStr.includes("arritmia");
  const isDermatoAllergic = (patient.allergies || []).length > 0 || comorbiditiesStr.includes("dermatite") || comorbiditiesStr.includes("alerg");

  const ingredients: ActiveIngredientItem[] = [];

  // 1. Minerais Essenciais Quelatados (NRC 2006 / FEDIAF)
  // Carbonato de Cálcio P.A. (para atingir relação Ca:P balanceada na carne desossada)
  const calciumDoseGrams = Number((weight * 0.20).toFixed(2)); // ~200mg/kg
  ingredients.push({
    name: "Carbonato de Cálcio P.A. (40% Ca Elementar)",
    category: "MINERAL",
    dailyDoseFormatted: `${(calciumDoseGrams * 1000).toFixed(0)} mg`,
    dailyDoseMg: calciumDoseGrams * 1000,
    functionRationale: isRenal
      ? "Balanceamento mineral e quelação entérica de fósforo sérico na refeição"
      : "Correção obrigatória da relação Cálcio:Fósforo (1.3:1) da dieta caseira",
  });

  // Zinco Quelato
  const zincMg = Number((metabolicWeight * 1.8).toFixed(1));
  ingredients.push({
    name: "Zinco Bisglicinato Quelato (20% Zn)",
    category: "MINERAL",
    dailyDoseFormatted: `${zincMg} mg`,
    dailyDoseMg: zincMg,
    functionRationale: "Imunidade, integridade da barreira cutânea e cicatrização",
  });

  // Cobre Quelato
  const copperMg = Number((metabolicWeight * 0.35).toFixed(2));
  ingredients.push({
    name: "Cobre Quelato (10% Cu)",
    category: "MINERAL",
    dailyDoseFormatted: `${copperMg} mg`,
    dailyDoseMg: copperMg,
    functionRationale: "Síntese de hemoglobina, formação de colágeno e pigmentação",
  });

  // Manganês Quelato
  const manganeseMg = Number((metabolicWeight * 0.25).toFixed(2));
  ingredients.push({
    name: "Manganês Bisglicinato Quelato (16% Mn)",
    category: "MINERAL",
    dailyDoseFormatted: `${manganeseMg} mg`,
    dailyDoseMg: manganeseMg,
    functionRationale: "Metabolismo de carboidratos e suporte à cartilagem articular",
  });

  // Selênio-Levedura
  const seleniumMcg = Number((metabolicWeight * 6.5).toFixed(1));
  ingredients.push({
    name: "Selênio Orgânico (Levedura de Selênio)",
    category: "MINERAL",
    dailyDoseFormatted: `${seleniumMcg} mcg`,
    dailyDoseMg: seleniumMcg / 1000,
    functionRationale: "Potente ação antioxidante enzimática (glutationa peroxidase)",
  });

  // 2. Vitaminas Lipossolúveis e Hidrossolúveis
  const vitEUI = Math.round(weight * 8);
  ingredients.push({
    name: "Vitamina E (Acetato de DL-Alfa-Tocoferol pó 50%)",
    category: "VITAMIN",
    dailyDoseFormatted: `${vitEUI} UI`,
    dailyDoseMg: vitEUI,
    functionRationale: isHepatic || isRenal
      ? "Antioxidante celular de primeira linha contra estresse oxidativo tecidual"
      : "Proteção contra peroxidação lipídica dos ácidos graxos da dieta",
  });

  // Complexo B Completo
  const vitB1Mg = Number((metabolicWeight * 0.4).toFixed(1));
  const vitB6Mg = Number((metabolicWeight * 0.3).toFixed(1));
  const vitB12Mcg = Number((metabolicWeight * 4).toFixed(1));
  ingredients.push({
    name: "Complexo B Equilibrado (B1, B2, B3, B5, B6, B12, Ácido Fólico, Biotina)",
    category: "VITAMIN",
    dailyDoseFormatted: `${Math.round(metabolicWeight * 15)} mg`,
    dailyDoseMg: Math.round(metabolicWeight * 15),
    functionRationale: isRenal
      ? "Reposição de vitaminas hidrossolúveis perdidas na poliúria compensatória"
      : "Cofatores enzimáticos essenciais para metabolismo energético e celular",
  });

  // Cloreto de Colina
  const cholineMg = Math.round(metabolicWeight * 25);
  ingredients.push({
    name: "Colina (Cloreto de Colina)",
    category: "VITAMIN",
    dailyDoseFormatted: `${cholineMg} mg`,
    dailyDoseMg: cholineMg,
    functionRationale: "Integridade de membranas celulares, neurotransmissão e metabolismo lipídico hepático",
  });

  // 3. Aminoácido Mandatório / Condicional
  if (species === "FELINE" || isCardiac) {
    const taurineMg = species === "FELINE" ? 350 : 500;
    ingredients.push({
      name: "Taurina Pura Cristalizada",
      category: "AMINOACID",
      dailyDoseFormatted: `${taurineMg} mg`,
      dailyDoseMg: taurineMg,
      functionRationale: species === "FELINE"
        ? "Aminoácido essencial para felinos (prevenção de degeneração retinal e cardiomiopatia dilatada)"
        : "Suporte inotrópico miocárdico e proteção antioxidante vascular",
    });
  }

  // 4. Nutracêuticos Específicos Direcionados às Comorbidades
  if (isOsteoarticular) {
    ingredients.push({
      name: "Colágeno Não Desnaturado Tipo II (UC-II®)",
      category: "NUTRACEUTICAL",
      dailyDoseFormatted: "40 mg",
      dailyDoseMg: 40,
      functionRationale: "Dessensibilização imune intestinal contra colágeno articular (redução da dor e rigidez)",
    });
    const condroitinaMg = Math.round(weight * 15);
    const glicosaminaMg = Math.round(weight * 25);
    ingredients.push({
      name: `Sulfato de Condroitina (${condroitinaMg}mg) + Glicosamina HCl (${glicosaminaMg}mg)`,
      category: "NUTRACEUTICAL",
      dailyDoseFormatted: `${condroitinaMg + glicosaminaMg} mg`,
      dailyDoseMg: condroitinaMg + glicosaminaMg,
      functionRationale: "Glicosaminoglicanos essenciais para regeneração da matriz e hidratação sinovial",
    });
  }

  if (isOverweight) {
    const carnitineMg = Math.round(weight * 40);
    ingredients.push({
      name: "L-Carnitina Tartarato",
      category: "NUTRACEUTICAL",
      dailyDoseFormatted: `${carnitineMg} mg`,
      dailyDoseMg: carnitineMg,
      functionRationale: "Carreador mitocondrial de ácidos graxos para beta-oxidação e preservação de massa magra",
    });
  }

  if (isHepatic) {
    const silymarinMg = Math.round(weight * 12);
    ingredients.push({
      name: "Silimarina (Extrato Seco Padronizado a 80% de Silibina)",
      category: "NUTRACEUTICAL",
      dailyDoseFormatted: `${silymarinMg} mg`,
      dailyDoseMg: silymarinMg,
      functionRationale: "Estabilizador de membrana hepatocitária, antifibrótico e estimulador da síntese proteica hepática",
    });
  }

  if (isRenal) {
    ingredients.push({
      name: "Coenzima Q10 (Ubiquinona)",
      category: "NUTRACEUTICAL",
      dailyDoseFormatted: "30 mg",
      dailyDoseMg: 30,
      functionRationale: "Suporte bioenergético mitocondrial nefrótico e proteção contra peroxidação endotelial",
    });
  }

  if (isDermatoAllergic) {
    ingredients.push({
      name: "Biotina Pura (Vitamina H)",
      category: "NUTRACEUTICAL",
      dailyDoseFormatted: "2.0 mg",
      dailyDoseMg: 2.0,
      functionRationale: "Reforço à barreira epidérmica e síntese de ceramidas no folículo piloso",
    });
  }

  // Definição da Forma Farmacêutica
  const pharmaceuticalForm = "SACHETS";
  const pharmaceuticalFormLabel = "Sachês Individuais Palatabilizados";
  const quantityUnits = 30; // 30 sachês para 1 mês de tratamento
  const flavoring = species === "FELINE" ? "Flavorizante Hidrolisado Hipoalergênico Sabor Peixe/Salmão" : "Flavorizante Hidrolisado Hipoalergênico Sabor Carne/Bacon";

  const posologyInstructions = `Administrar 1 (um) sachê ao dia, homogeneizado diretamente no prato de alimentação natural da manhã, uma vez ao dia. Não submeter o suplemento a altas temperaturas (aquecimento em micro-ondas acima de 40°C desnatura as vitaminas).`;

  const technicGuidelines = [
    "Manipular em ambiente veterinário especializado com controle estrito de umidade.",
    `Excipiente q.s.p.: ${species === "FELINE" ? "Veículo inerte com alta palatabilidade felina" : "Maltodextrina / Celulose microcristalina q.s.p. 2.0g por sachê"}.`,
    "Acondicionar em envelopes aluminizados termosselados ao abrigo da luz e umidade.",
    "Formulação isenta de proteína intacta alergênica (utilizar apenas saborizantes hidrolisados de grau veterinário).",
  ];

  return {
    patientId: patient.id,
    patientName: patient.name,
    species: patient.species,
    tutorName: undefined, // preenchido na exibição
    weightKg: weight,
    dateGenerated: new Date().toISOString().split("T")[0],
    pharmaceuticalForm,
    pharmaceuticalFormLabel,
    quantityUnits,
    flavoring,
    posologyInstructions,
    activeIngredients: ingredients,
    technicGuidelines,
    expirationDays: 90,
    professionalName,
    crmvCrz,
  };
}

/**
 * Gera texto formal pronto para impressão ou envio à farmácia de manipulação
 */
export function generateCompoundingPrescriptionText(prescription: CompoundingPrescription): string {
  const formattedDate = new Date(prescription.dateGenerated + "T00:00:00").toLocaleDateString("pt-BR");

  return `================================================================================
           RECEITUÁRIO DE MANIPULAÇÃO VETERINÁRIA PERSONALIZADA
                 ESSÊNCIA NUTRI PET • NUTRIÇÃO CLÍNICA
================================================================================

PACIENTE: ${prescription.patientName} (${prescription.species === "CANINE" ? "Canino" : "Felino"})
PESO ATUAL: ${prescription.weightKg} kg
DATA DE PRESCRIÇÃO: ${formattedDate}
PROFISSIONAL RESPONSÁVEL: ${prescription.professionalName} (${prescription.crmvCrz})

--------------------------------------------------------------------------------
FORMA FARMACÊUTICA: ${prescription.pharmaceuticalFormLabel}
QUANTIDADE: ${prescription.quantityUnits} sachês (Tratamento para 30 dias)
PALATABILIZANTE: ${prescription.flavoring}
--------------------------------------------------------------------------------

COMPOSIÇÃO DE CADA SACHÊ DIÁRIO (Dose Unitária):

${prescription.activeIngredients
  .map(
    (item, idx) =>
      `${String(idx + 1).padStart(2, " ")}. ${item.name.padEnd(46, ".")} ${item.dailyDoseFormatted.padStart(10, " ")}\n    └ Finalidade: ${item.functionRationale}`
  )
  .join("\n\n")}

--------------------------------------------------------------------------------
INSTRUÇÕES AO FARMACÊUTICO MANIPULADOR:
${prescription.technicGuidelines.map((g) => `• ${g}`).join("\n")}
Validade recomendada da fórmula: ${prescription.expirationDays} dias.

--------------------------------------------------------------------------------
MODO DE USAR / POSOLOGIA AO TUTOR:
${prescription.posologyInstructions}

================================================================================
Assinatura & Carimbo Profissional:

___________________________________________________
${prescription.professionalName}
Zootecnista / Nutrólogo • ${prescription.crmvCrz}
================================================================================`;
}
