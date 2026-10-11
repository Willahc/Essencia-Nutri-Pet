import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados Essência Nutri Pet...");

  // Limpa registros anteriores para idempotência
  await prisma.examDocument.deleteMany();
  await prisma.tutorDailyLog.deleteMany();
  await prisma.nutritionPlan.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.measurement.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.tutor.deleteMany();

  // 1. TUTORES
  const tutor1 = await prisma.tutor.create({
    data: {
      id: "tut-1",
      name: "Kayne Inácio",
      email: "kayne.inacio@email.com",
      phone: "(65) 99936-1791",
      city: "São Paulo",
      state: "SP",
      notes: "Tutora da cadela Kate. Acompanhamento clínico e nutricional preventivo.",
    },
  });

  const tutor2 = await prisma.tutor.create({
    data: {
      id: "tut-2",
      name: "Arthur Monteiro Mendes",
      email: "arthur.mendes@email.com",
      phone: "(11) 98765-4321",
      city: "São Paulo",
      state: "SP",
      notes: "Tutor do felino Raposo Tavares. Manejo dietético para suporte renal e restrição de fósforo.",
    },
  });

  console.log("✓ Tutores criados:", tutor1.name, "|", tutor2.name);

  // 2. PACIENTES
  const patient1 = await prisma.patient.create({
    data: {
      id: "pat-1",
      tutorId: tutor1.id,
      name: "Kate",
      species: "CANINE",
      breed: "S.R.D. Canino",
      birthDate: "2021-08-19",
      sex: "FEMALE",
      isNeutered: true,
      idealWeightKg: 14.0,
      currentWeightKg: 14.5,
      currentBcs: 5,
      avatarUrl: "🐕",
      comorbidities: JSON.stringify(["Check-up laboratorial periódico", "Microchip: 953010005692702"]),
      allergies: JSON.stringify([]),
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      id: "pat-2",
      tutorId: tutor2.id,
      name: "Raposo Tavares",
      species: "FELINE",
      breed: "S.R.D. Felino",
      birthDate: "2018-10-26",
      sex: "MALE",
      isNeutered: true,
      idealWeightKg: 4.5,
      currentWeightKg: 4.8,
      currentBcs: 5,
      avatarUrl: "🐈",
      comorbidities: JSON.stringify(["Monitoramento de função renal (guidelines IRIS)", "Microchip: 963003100350159"]),
      allergies: JSON.stringify([]),
    },
  });

  console.log("✓ Pacientes criados:", patient1.name, "|", patient2.name);

  // 3. PESAGENS / MEDIÇÕES
  await prisma.measurement.createMany({
    data: [
      {
        id: "m-1",
        patientId: patient1.id,
        date: "2026-09-19",
        weightKg: 14.5,
        bcs: 5,
        abdominalCircumferenceCm: 52,
        thoracicCircumferenceCm: 61,
        measuredBy: "Dra. Veronica Correia Pitorri (CRMV 41403)",
        notes: "Exame clínico de rotina com coleta de sangue no Centro Veterinário Vila Mariana.",
      },
      {
        id: "m-2",
        patientId: patient2.id,
        date: "2026-09-22",
        weightKg: 4.8,
        bcs: 5,
        abdominalCircumferenceCm: 36,
        thoracicCircumferenceCm: 41,
        measuredBy: "Dra. Beatriz Emidio Gomes (CRMV 74397)",
        notes: "Monitoramento laboratorial semestral. Escore corporal preservado.",
      },
    ],
  });

  // 4. ATENDIMENTOS CLÍNICOS
  await prisma.appointment.createMany({
    data: [
      {
        id: "apt-1",
        patientId: patient1.id,
        professionalId: "pro-1",
        professionalName: "Dra. Veronica Correia Pitorri (CRMV 41403)",
        type: "CONSULTORIA_NUTRICIONAL",
        status: "FINALIZADO",
        occurredAt: "2026-09-19T10:30:00Z",
        version: 1,
        notes: "Paciente canina em bom estado geral. Coleta realizada para hemograma completo e perfil bioquímico.",
        anamnesisJson: JSON.stringify({
          reported_appetite: "NORMAL",
          water_intake: "NORMAL",
          stool_consistency: "NORMAL",
          vomiting_episodes_per_week: 0,
          treats_habits: "Consumo moderado de frutas seguras e petiscos desidratados naturais.",
        }),
        dietRecommendation: "Manutenção de dieta equilibrada para suporte metabólico de cão adulto.",
      },
      {
        id: "apt-2",
        patientId: patient2.id,
        professionalId: "pro-2",
        professionalName: "Dra. Beatriz Emidio Gomes (CRMV 74397)",
        type: "CONSULTORIA_NUTRICIONAL",
        status: "FINALIZADO",
        occurredAt: "2026-09-22T14:00:00Z",
        version: 1,
        notes: "Avaliação bioquímica detalhada: ureia 58 mg/dL e creatinina 3,40 mg/dL com fósforo sérico de 6,30 mg/dL. Recomendado plano dietético com restrição controlada de fósforo e alta digestibilidade proteica.",
        anamnesisJson: JSON.stringify({
          reported_appetite: "NORMAL",
          water_intake: "POLYURIA_POLYDIPSIA",
          stool_consistency: "NORMAL",
          vomiting_episodes_per_week: 0,
          treats_habits: "Estímulo à ingestão hídrica com fontes de água corrente e patês reidratados.",
        }),
        dietRecommendation: "Alimentação úmida funcional renal com fontes nobres de proteína e quelante de fósforo se indicado.",
      },
    ],
  });

  // 5. PLANOS NUTRICIONAIS
  await prisma.nutritionPlan.createMany({
    data: [
      {
        id: "plan-1",
        patientId: patient1.id,
        version: 1,
        title: "Plano Nutricional Balanceado para Manutenção de Peso Adulto",
        feedingType: "NATURAL_COOKED",
        dailyEnergyKcal: 580,
        mealsPerDay: 2,
        hydrationTargetMlDay: 720,
        transitionPlanDays: 7,
        professionalId: "pro-1",
        isActive: true,
        approvedAt: "2026-09-19T11:15:00Z",
        notes: "Dieta calculada para manutenção da condição corporal com suporte hematológico.",
        supplementsJson: JSON.stringify([
          "Suplemento vitamínico e mineral completo para cães adultos",
          "Ômega 3 (EPA + DHA 500mg) - 1 cápsula a cada 24h",
          "Carbonato de Cálcio 1.8g ao dia (balanceador Ca:P 1.2:1 com o fósforo das carnes)",
        ]),
        itemsJson: JSON.stringify([
          { ingredient_name: "Peito de frango cozido desfiado", quantity_grams: 180, notes: "Proteína magra de alta digestibilidade" },
          { ingredient_name: "Arroz branco cozido", quantity_grams: 130, notes: "Fonte de energia de fácil digestão" },
          { ingredient_name: "Abóbora moranga cozida", quantity_grams: 90, notes: "Fibras solúveis para saúde intestinal" },
          { ingredient_name: "Cenoura cozida picada", quantity_grams: 60, notes: "Betacaroteno e palatabilidade" },
          { ingredient_name: "Azeite de oliva extravirgem", quantity_grams: 4, notes: "Ácidos graxos monoinsaturados" },
        ]),
      },
      {
        id: "plan-2",
        patientId: patient2.id,
        version: 1,
        title: "Protocolo Nutricional para Suporte e Proteção Renal Felina",
        feedingType: "NATURAL_COOKED",
        dailyEnergyKcal: 220,
        mealsPerDay: 3,
        hydrationTargetMlDay: 250,
        transitionPlanDays: 10,
        professionalId: "pro-2",
        isActive: true,
        approvedAt: "2026-09-22T15:00:00Z",
        notes: "Foco na restrição de fósforo sérico (6.30 mg/dL), alta umidade alimentar e preservação de massa magra.",
        supplementsJson: JSON.stringify([
          "Carbonato de Cálcio Micronizado 1.1g ao dia misturado na carne (balanceador Ca:P e quelante intestinal de fósforo)",
          "Taurina 500mg ao dia (aminoácido essencial para manutenção miocárdica e retiniana felina)",
          "Ômega 3 de alta concentração (EPA/DHA 250mg) - ação anti-inflamatória glomerular",
          "Suplemento vitamínico e mineral quelatado específico para felinos renais (isento de fósforo)",
        ]),
        itemsJson: JSON.stringify([
          { ingredient_name: "Peito de frango cozido desfiado", quantity_grams: 75, notes: "Proteína nobre de baixo resíduo e excelente digestibilidade" },
          { ingredient_name: "Filé de tilápia cozido no vapor", quantity_grams: 35, notes: "Proteína leve com perfil lipídico favorável e baixo fósforo" },
          { ingredient_name: "Arroz branco cozido", quantity_grams: 30, notes: "Fonte limpa de energia com baixíssimo fósforo vegetal" },
          { ingredient_name: "Abóbora cabotiá cozida", quantity_grams: 25, notes: "Fibra solúvel para redução de toxinas urêmicas entéricas" },
          { ingredient_name: "Azeite de oliva extravirgem", quantity_grams: 2, notes: "Aporte de ácidos graxos monoinsaturados e densidade calórica" },
        ]),
      },
    ],
  });

  // 6. DIÁRIO DE ADESÃO DO TUTOR
  await prisma.tutorDailyLog.createMany({
    data: [
      {
        id: "log-k1",
        patientId: patient1.id,
        date: "2026-09-20",
        transitionDay: 1,
        dietConsumedPercentage: 100,
        waterIntakeMl: 710,
        stoolScore: 2,
        stoolNotes: "Fezes bem formadas, sem resíduos ao recolher.",
        appetite: "NORMAL",
        vomitingEpisodes: 0,
        supplementsTaken: true,
        treatsGiven: false,
        notes: "Kate comeu todo o prato com bastante entusiasmo.",
      },
      {
        id: "log-k2",
        patientId: patient1.id,
        date: "2026-09-21",
        transitionDay: 2,
        dietConsumedPercentage: 100,
        waterIntakeMl: 730,
        stoolScore: 2,
        stoolNotes: "Consistência firme e coloração normal.",
        appetite: "NORMAL",
        vomitingEpisodes: 0,
        supplementsTaken: true,
        treatsGiven: false,
        notes: "Adaptação excelente aos ingredientes cozidos.",
      },
      {
        id: "log-r1",
        patientId: patient2.id,
        date: "2026-09-23",
        transitionDay: 1,
        dietConsumedPercentage: 90,
        waterIntakeMl: 240,
        stoolScore: 2,
        stoolNotes: "Fezes firmes, formato adequado.",
        appetite: "NORMAL",
        vomitingEpisodes: 0,
        supplementsTaken: true,
        treatsGiven: false,
        notes: "Raposo lambeu o prato do frango com tilápia. Tomou bastante água na fonte.",
      },
      {
        id: "log-r2",
        patientId: patient2.id,
        date: "2026-09-24",
        transitionDay: 2,
        dietConsumedPercentage: 100,
        waterIntakeMl: 260,
        stoolScore: 2,
        stoolNotes: "Sem alterações, consistência ideal.",
        appetite: "NORMAL",
        vomitingEpisodes: 0,
        supplementsTaken: true,
        treatsGiven: false,
        notes: "Aceitou muito bem a suplementação de cálcio e taurina misturada na refeição morna.",
      },
    ],
  });

  // 7. LAUDOS E EXAMES DE LABORATÓRIO
  await prisma.examDocument.create({
    data: {
      id: "ex-kate",
      patientId: patient1.id,
      appointmentId: "apt-1",
      laboratoryName: "Centro Veterinário Vila Mariana",
      examDate: "2026-09-19",
      fileName: "Canina - Kate.pdf",
      fileUrl: "/exams/Canina_Kate.pdf",
      fileHashSha256: "001-0381037-CVVM-KATE",
      extractionStatus: "PENDING_REVIEW",
      professionalNotes: "PARECER CLÍNICO ZOOTÉCNICO: Paciente Kate (canina, 5 anos) apresenta perfil laboratorial hígido. Recomenda-se continuidade do plano dietético de manutenção.",
      extractedResultsJson: JSON.stringify([
        {
          id: "res-k1",
          parameter: "Ureia",
          category: "BIOCHEMISTRY",
          value: 42.0,
          unit: "mg/dL",
          reference_range: "21,4 a 59,92 mg/dL",
          is_out_of_range: false,
          is_uncertain: false,
          confidence_score: 0.99,
          page_number: 1,
        },
        {
          id: "res-k2",
          parameter: "Creatinina",
          category: "BIOCHEMISTRY",
          value: 1.10,
          unit: "mg/dL",
          reference_range: "0,5 a 1,5 mg/dL",
          is_out_of_range: false,
          is_uncertain: false,
          confidence_score: 0.99,
          page_number: 1,
        },
        {
          id: "res-k3",
          parameter: "Alanina Aminotransferase (ALT)",
          category: "BIOCHEMISTRY",
          value: 38.0,
          unit: "U/L",
          reference_range: "10 a 88 U/L",
          is_out_of_range: false,
          is_uncertain: false,
          confidence_score: 0.98,
          page_number: 2,
        },
        {
          id: "res-k6",
          parameter: "Hemoglobina",
          category: "HEMATOLOGY",
          value: 21.6,
          unit: "g/dl",
          reference_range: "12,0 a 18,0 g/dl",
          is_out_of_range: true,
          is_uncertain: false,
          confidence_score: 0.99,
          page_number: 1,
        },
        {
          id: "res-k7",
          parameter: "Hematócrito",
          category: "HEMATOLOGY",
          value: 54.0,
          unit: "%",
          reference_range: "37,0 a 55,0 %",
          is_out_of_range: false,
          is_uncertain: false,
          confidence_score: 0.99,
          page_number: 1,
        },
      ]),
    },
  });

  await prisma.examDocument.create({
    data: {
      id: "ex-raposo",
      patientId: patient2.id,
      appointmentId: "apt-2",
      laboratoryName: "Centro Veterinário Vila Mariana",
      examDate: "2026-09-22",
      fileName: "Felina - Raposo Tavares.pdf",
      fileUrl: "/exams/Felina_Raposo_Tavares.pdf",
      fileHashSha256: "001-0381673-CVVM-RAPOSO",
      extractionStatus: "PENDING_REVIEW",
      professionalNotes: "PARECER CLÍNICO ZOOTÉCNICO: Paciente felino Raposo Tavares apresenta azotemia renal (Creatinina 3.40 mg/dL e Ureia 58.0 mg/dL) compatível com Estágio 3 IRIS, com hiperfosfatemia relevante (Fósforo 6.30 mg/dL). Conduta dietética prioritária: Alimentação com restrição estrita de fósforo, proteína nobre de alto valor biológico e quelante de fósforo nas refeições.",
      extractedResultsJson: JSON.stringify([
        {
          id: "res-r1",
          parameter: "Creatinina",
          category: "BIOCHEMISTRY",
          value: 3.40,
          unit: "mg/dL",
          reference_range: "0,70 a 1,80 mg/dL",
          is_out_of_range: true,
          is_uncertain: false,
          confidence_score: 0.99,
          page_number: 1,
        },
        {
          id: "res-r2",
          parameter: "Ureia",
          category: "BIOCHEMISTRY",
          value: 58.0,
          unit: "mg/dL",
          reference_range: "42,8 a 64,2 mg/dL",
          is_out_of_range: false,
          is_uncertain: false,
          confidence_score: 0.99,
          page_number: 1,
        },
        {
          id: "res-r9",
          parameter: "Fósforo",
          category: "BIOCHEMISTRY",
          value: 6.30,
          unit: "mg/dL",
          reference_range: "2,50 a 6,10 mg/dL",
          is_out_of_range: true,
          is_uncertain: false,
          confidence_score: 0.98,
          page_number: 5,
        },
        {
          id: "res-r10",
          parameter: "Glicose",
          category: "BIOCHEMISTRY",
          value: 55.0,
          unit: "mg/dL",
          reference_range: "60,0 a 132,0 mg/dL",
          is_out_of_range: true,
          is_uncertain: false,
          confidence_score: 0.97,
          page_number: 5,
        },
      ]),
    },
  });

  console.log("✅ Seed finalizado com sucesso! Banco SQLite dev.db totalmente populado com pacientes reais.");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
