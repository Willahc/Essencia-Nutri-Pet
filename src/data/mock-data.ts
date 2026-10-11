import { Patient, Tutor, MeasurementRecord, AppointmentRecord, ExamDocument, NutritionPlan } from "@/types";

export const MOCK_TUTORS: Tutor[] = [
  {
    id: "tut-1",
    name: "Mariana Souza",
    email: "mariana.souza@email.com",
    phone: "(11) 98765-4321",
    city: "São Paulo",
    state: "SP",
    notes: "Tutor muito dedicado. Segue pesagens semanais com rigor.",
    created_at: "2026-08-10T10:00:00Z",
  },
  {
    id: "tut-2",
    name: "Carlos Eduardo Silva",
    email: "carlos.silva@email.com",
    phone: "(19) 99123-5678",
    city: "Campinas",
    state: "SP",
    notes: "Procura transição de ração seca para Alimentação Natural (AN).",
    created_at: "2026-09-01T14:30:00Z",
  }
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "pat-1",
    tutor_id: "tut-1",
    name: "Thor",
    species: "CANINE",
    breed: "Golden Retriever",
    birth_date: "2022-04-15",
    sex: "MALE",
    is_neutered: true,
    ideal_weight_kg: 32.0,
    current_weight_kg: 36.8,
    current_bcs: 7, // Sobrepeso evidente
    avatar_url: "🐕",
    comorbidities: ["Displasia coxofemoral leve", "Tendência a ganho de peso"],
    allergies: ["Frango (suspeita de hipersensibilidade cutânea)"],
    created_at: "2026-08-10T10:15:00Z",
  },
  {
    id: "pat-2",
    tutor_id: "tut-2",
    name: "Luna",
    species: "FELINE",
    breed: "Sem Raça Definida (SRD)",
    birth_date: "2023-01-20",
    sex: "FEMALE",
    is_neutered: true,
    ideal_weight_kg: 4.2,
    current_weight_kg: 5.6,
    current_bcs: 7,
    avatar_url: "🐈",
    comorbidities: ["Histórico de sedentarismo em apartamento"],
    allergies: [],
    created_at: "2026-09-01T14:45:00Z",
  }
];

export const MOCK_MEASUREMENTS: MeasurementRecord[] = [
  {
    id: "m-1",
    patient_id: "pat-1",
    date: "2026-08-10",
    weight_kg: 38.5,
    bcs: 8,
    abdominal_circumference_cm: 82,
    thoracic_circumference_cm: 90,
    measured_by: "Dr. Roberto (Zootecnista / Nutrólogo)",
    notes: "Primeira consulta. Animal sedentário com queixa de cansaço fácil."
  },
  {
    id: "m-2",
    patient_id: "pat-1",
    date: "2026-09-10",
    weight_kg: 37.6,
    bcs: 7,
    abdominal_circumference_cm: 80,
    thoracic_circumference_cm: 89,
    measured_by: "Dr. Roberto (Zootecnista / Nutrólogo)",
    notes: "Retorno 30 dias. Redução de 900g (-2.3%). Excelente adesão à dieta cozida."
  },
  {
    id: "m-3",
    patient_id: "pat-1",
    date: "2026-10-10",
    weight_kg: 36.8,
    bcs: 7,
    abdominal_circumference_cm: 78,
    thoracic_circumference_cm: 87,
    measured_by: "Dr. Roberto (Zootecnista / Nutrólogo)",
    notes: "Reavaliação 60 dias. Redução acumulada de 1.7kg. Melhora visível na disposição física."
  }
];

export const MOCK_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: "apt-1",
    patient_id: "pat-1",
    professional_id: "pro-1",
    professional_name: "Dr. Roberto Almeida (CRMV/CRZ 4821)",
    type: "CONSULTORIA_NUTRICIONAL",
    status: "FINALIZADO",
    occurred_at: "2026-08-10T10:30:00Z",
    version: 1,
    notes: "Paciente apresentava consumo excessivo de petiscos humanos e ração ad libitum. Estabelecida meta de redução ponderal segura.",
    anamnesis: {
      reported_appetite: "INCREASED",
      water_intake: "NORMAL",
      stool_consistency: "NORMAL",
      vomiting_episodes_per_week: 0,
      treats_habits: "Consumo diário de pão e petiscos ultraprocessados (cortados do plano)",
    },
    diet_recommendation: "Transição para Alimentação Natural Cozida formulada com proteína suína magra e abóbora.",
    created_at: "2026-08-10T11:00:00Z"
  },
  {
    id: "apt-2",
    patient_id: "pat-1",
    professional_id: "pro-1",
    professional_name: "Dr. Roberto Almeida (CRMV/CRZ 4821)",
    type: "RETORNO",
    status: "FINALIZADO",
    occurred_at: "2026-09-10T14:00:00Z",
    version: 1,
    notes: "Excelente adesão relatada pela tutora. Fezes bem formadas (escore fecal 2.5), sem episódios eméticos. Peso em queda gradual sustentável.",
    anamnesis: {
      reported_appetite: "NORMAL",
      water_intake: "NORMAL",
      stool_consistency: "NORMAL",
      vomiting_episodes_per_week: 0,
      treats_habits: "Substituído por pedaços de cenoura e chuchu cozidos.",
    },
    diet_recommendation: "Manter plano de restrição calórica (1.0 x RER no peso ideal).",
    created_at: "2026-09-10T14:30:00Z"
  }
];

export const MOCK_EXAM: ExamDocument = {
  id: "ex-1",
  patient_id: "pat-1",
  appointment_id: "apt-1",
  laboratory_name: "BioVet Diagnósticos Veterinários",
  exam_date: "2026-08-08",
  file_name: "laudo_bioquimico_thor_ago2026.pdf",
  file_url: "/mock-docs/laudo_bioquimico_thor.pdf",
  file_hash_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  extraction_status: "PENDING_REVIEW",
  professional_review_notes: "Verificar valor de Fosfatase Alcalina e unidade de triglicérides.",
  extracted_results: [
    {
      id: "res-1",
      parameter: "Triglicérides",
      category: "BIOCHEMISTRY",
      value: 185.0,
      unit: "mg/dL",
      reference_range: "20.0 - 150.0",
      is_out_of_range: true,
      is_uncertain: false,
      confidence_score: 0.98,
      page_number: 1,
    },
    {
      id: "res-2",
      parameter: "Colesterol Total",
      category: "BIOCHEMISTRY",
      value: 290.0,
      unit: "mg/dL",
      reference_range: "135.0 - 270.0",
      is_out_of_range: true,
      is_uncertain: false,
      confidence_score: 0.96,
      page_number: 1,
    },
    {
      id: "res-3",
      parameter: "ALT (TGP)",
      category: "BIOCHEMISTRY",
      value: 64.0,
      unit: "U/L",
      reference_range: "10.0 - 88.0",
      is_out_of_range: false,
      is_uncertain: false,
      confidence_score: 0.99,
      page_number: 1,
    },
    {
      id: "res-4",
      parameter: "Fosfatase Alcalina (FA)",
      category: "BIOCHEMISTRY",
      value: 168.0,
      unit: "U/L",
      reference_range: "10.0 - 156.0",
      is_out_of_range: true,
      is_uncertain: true,
      uncertainty_reason: "Trecho do laudo com rasura/carimbo sobre o dígito decimal. Necessita confirmação visual.",
      confidence_score: 0.68,
      page_number: 1,
    },
    {
      id: "res-5",
      parameter: "Creatinina Sérica",
      category: "BIOCHEMISTRY",
      value: 1.1,
      unit: "mg/dL",
      reference_range: "0.5 - 1.5",
      is_out_of_range: false,
      is_uncertain: false,
      confidence_score: 0.99,
      page_number: 2,
    },
    {
      id: "res-6",
      parameter: "Uréia Sérica",
      category: "BIOCHEMISTRY",
      value: 38.0,
      unit: "mg/dL",
      reference_range: "15.0 - 45.0",
      is_out_of_range: false,
      is_uncertain: false,
      confidence_score: 0.97,
      page_number: 2,
    }
  ]
};

export const MOCK_NUTRITION_PLAN: NutritionPlan = {
  id: "plan-1",
  patient_id: "pat-1",
  version: 2,
  title: "Plano Hipocalórico de Emagrecimento Seguro (Fase 1)",
  feeding_type: "NATURAL_COOKED",
  daily_energy_kcal: 940, // 1.0 * RER no peso ideal (32kg)
  meals_per_day: 2,
  is_active: true,
  hydration_target_ml_day: 950,
  transition_plan_days: 7,
  professional_id: "pro-1",
  approved_at: "2026-08-10T11:15:00Z",
  notes: "Dieta pesada após cocção. Fracionar em 2 porções iguais (manhã e noite).",
  supplements: [
    "Suplemento vitamínico e mineral completo específico p/ cães (dosagem conforme fabricante)",
    "Ômega 3 (EPA + DHA 1000mg) - 1 cápsula a cada 24h",
    "Carbonato de Cálcio / Casca de ovo esterilizada (fonte de cálcio balanceada 1.2:1 com fósforo)"
  ],
  items: [
    { ingredient_name: "Lombo suíno magro cozido (sem osso e sem gordura visível)", quantity_grams: 320, notes: "Proteína nobre de alta digestibilidade" },
    { ingredient_name: "Abóbora japonesa (cabotiá) cozida no vapor", quantity_grams: 220, notes: "Baixa densidade calórica e rica em fibras solúveis" },
    { ingredient_name: "Chuchu cozido em cubos", quantity_grams: 180, notes: "Volume e saciedade com teor calórico mínimo" },
    { ingredient_name: "Arroz integral bem cozido", quantity_grams: 150, notes: "Carboidrato complexo de lenta absorção" },
    { ingredient_name: "Fígado bovino cozido", quantity_grams: 35, notes: "Víscera fornecedora de vitamina A e complexo B" },
    { ingredient_name: "Azeite de oliva extravirgem", quantity_grams: 6, notes: "Ácidos graxos monoinsaturados" }
  ]
};
