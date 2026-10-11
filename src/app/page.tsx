"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { NutritionalCalculator } from "@/components/patient/NutritionalCalculator";
import { TimelineEvolution } from "@/components/patient/TimelineEvolution";
import { DietPlanViewer } from "@/components/patient/DietPlanViewer";
import { ExamReviewSideBySide } from "@/components/patient/ExamReviewSideBySide";
import { TutorPortalView } from "@/components/tutor/TutorPortalView";
import { NewAppointmentModal } from "@/components/patient/NewAppointmentModal";
import { EvolutionReportModal } from "@/components/reports/EvolutionReportModal";
import { DetectedPatientModal } from "@/components/patient/DetectedPatientModal";
import { 
  MOCK_PATIENTS, 
  MOCK_TUTORS, 
  MOCK_MEASUREMENTS, 
  MOCK_APPOINTMENTS, 
  MOCK_NUTRITION_PLANS, 
  MOCK_DAILY_LOGS,
  MOCK_EXAM,
  MOCK_EXAM_RAPOSO 
} from "@/data/mock-data";
import { 
  AppointmentRecord, 
  MeasurementRecord, 
  Patient, 
  Tutor, 
  DetectedPatientInfo, 
  DetectedTutorInfo, 
  ExamExtractionResponse,
  Species,
  Sex,
  ExamDocument,
  NutritionPlan,
  TutorDailyLog
} from "@/types";
import { Activity, Calculator, Utensils, FileText, PlusCircle, Printer, Eye, User, Sparkles, UserPlus } from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<"PROFESSIONAL" | "TUTOR">("PROFESSIONAL");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("pat-1");
  const [activeTab, setActiveTab] = useState<"EVOLUTION" | "CALCULATOR" | "DIET" | "EXAMS">("EVOLUTION");

  // Estados locais para persistência em memória durante a sessão
  const [tutors, setTutors] = useState<Tutor[]>(MOCK_TUTORS);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>(MOCK_MEASUREMENTS);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(MOCK_APPOINTMENTS);
  const [exams, setExams] = useState<ExamDocument[]>([MOCK_EXAM, MOCK_EXAM_RAPOSO]);
  const [plans, setPlans] = useState<NutritionPlan[]>(MOCK_NUTRITION_PLANS);
  const [dailyLogs, setDailyLogs] = useState<TutorDailyLog[]>(MOCK_DAILY_LOGS);

  // Carrega dados persistidos do SQLite/Prisma na inicialização
  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch("/api/patients");
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const loadedPatients: Patient[] = json.data.map((p: any) => ({
            id: p.id,
            tutor_id: p.tutorId,
            name: p.name,
            species: p.species,
            breed: p.breed,
            birth_date: p.birthDate,
            sex: p.sex,
            is_neutered: p.isNeutered,
            ideal_weight_kg: p.idealWeightKg,
            current_weight_kg: p.currentWeightKg,
            current_bcs: p.currentBcs,
            avatar_url: p.avatarUrl,
            comorbidities: p.comorbidities || [],
            allergies: p.allergies || [],
            created_at: p.createdAt,
          }));

          const loadedTutors: Tutor[] = json.data
            .map((p: any) => p.tutor)
            .filter(Boolean)
            .map((t: any) => ({
              id: t.id,
              name: t.name,
              email: t.email || "",
              phone: t.phone || "",
              city: t.city,
              state: t.state,
              notes: t.notes,
              created_at: t.createdAt,
            }));

          const loadedMeasurements: MeasurementRecord[] = json.data.flatMap((p: any) =>
            (p.measurements || []).map((m: any) => ({
              id: m.id,
              patient_id: m.patientId,
              date: m.date,
              weight_kg: m.weightKg,
              bcs: m.bcs,
              abdominal_circumference_cm: m.abdominalCircumferenceCm,
              thoracic_circumference_cm: m.thoracicCircumferenceCm,
              measured_by: m.measuredBy,
              notes: m.notes,
            }))
          );

          const loadedAppointments: AppointmentRecord[] = json.data.flatMap((p: any) =>
            (p.appointments || []).map((a: any) => ({
              id: a.id,
              patient_id: a.patientId,
              professional_id: a.professionalId,
              professional_name: a.professionalName,
              type: a.type,
              status: a.status,
              occurred_at: a.occurredAt,
              version: a.version,
              notes: a.notes,
              anamnesis: a.anamnesis || {},
              diet_recommendation: a.dietRecommendation,
              created_at: a.createdAt,
            }))
          );

          const loadedPlans: NutritionPlan[] = json.data.flatMap((p: any) =>
            (p.plans || []).map((pl: any) => ({
              id: pl.id,
              patient_id: pl.patientId,
              version: pl.version,
              title: pl.title,
              feeding_type: pl.feedingType,
              daily_energy_kcal: pl.dailyEnergyKcal,
              meals_per_day: pl.mealsPerDay,
              hydration_target_ml_day: pl.hydrationTargetMlDay,
              transition_plan_days: pl.transitionPlanDays,
              professional_id: pl.professionalId,
              is_active: pl.isActive,
              approved_at: pl.approvedAt,
              notes: pl.notes,
              items: pl.items || [],
              supplements: pl.supplements || [],
            }))
          );

          const loadedDailyLogs: TutorDailyLog[] = json.data.flatMap((p: any) =>
            (p.dailyLogs || []).map((dl: any) => ({
              id: dl.id,
              patient_id: dl.patientId,
              date: dl.date,
              transition_day: dl.transitionDay,
              diet_consumed_percentage: dl.dietConsumedPercentage,
              water_intake_ml: dl.waterIntakeMl,
              stool_score: dl.stoolScore,
              stool_notes: dl.stoolNotes,
              appetite: dl.appetite,
              vomiting_episodes: dl.vomitingEpisodes,
              supplements_taken: dl.supplementsTaken,
              treats_given: dl.treatsGiven,
              notes: dl.notes,
              created_at: dl.createdAt,
            }))
          );

          const loadedExams: ExamDocument[] = json.data.flatMap((p: any) =>
            (p.exams || []).map((ex: any) => ({
              id: ex.id,
              patient_id: ex.patientId,
              appointment_id: ex.appointmentId,
              laboratory_name: ex.laboratoryName,
              exam_date: ex.examDate,
              file_name: ex.fileName,
              file_url: ex.fileUrl,
              file_hash_sha256: ex.fileHashSha256,
              extraction_status: ex.extractionStatus,
              extracted_results: ex.extracted_results || [],
              patient_detected: ex.patient_detected,
              tutor_detected: ex.tutor_detected,
              professional_review_notes: ex.professionalNotes,
              reviewed_at: ex.reviewedAt,
              reviewed_by: ex.reviewedBy,
            }))
          );

          if (loadedPatients.length > 0) setPatients(loadedPatients);
          if (loadedTutors.length > 0) setTutors(loadedTutors);
          if (loadedMeasurements.length > 0) setMeasurements(loadedMeasurements);
          if (loadedAppointments.length > 0) setAppointments(loadedAppointments);
          if (loadedPlans.length > 0) setPlans(loadedPlans);
          if (loadedDailyLogs.length > 0) setDailyLogs(loadedDailyLogs);
          if (loadedExams.length > 0) setExams(loadedExams);
        }
      } catch (err) {
        console.warn("Utilizando estado de contingência em memória:", err);
      }
    }

    loadInitialData();
  }, []);

  // Modais
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDetectedModalOpen, setIsDetectedModalOpen] = useState<boolean>(false);

  // Dados do paciente detectado pelo laudo
  const [detectedData, setDetectedData] = useState<{
    patient: DetectedPatientInfo;
    tutor?: DetectedTutorInfo;
    lab: string;
    date: string;
  } | null>(null);

  // Documento temporário para vincular ao novo animal quando o pré-cadastro for confirmado
  const [pendingExam, setPendingExam] = useState<{
    extracted: ExamExtractionResponse;
    fileUrl: string;
    fileName: string;
  } | null>(null);

  const patient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const tutor = tutors.find((t) => t.id === patient.tutor_id) || tutors[0];
  const patientMeasurements = measurements.filter((m) => m.patient_id === patient.id);
  const patientAppointments = appointments.filter((a) => a.patient_id === patient.id);
  const patientDailyLogs = dailyLogs.filter((l) => l.patient_id === patient.id);
  const currentPatientExam = exams.find((e) => e.patient_id === patient.id) || {
    id: `ex-${patient.id}`,
    patient_id: patient.id,
    laboratory_name: "BioVet Diagnósticos",
    exam_date: new Date().toISOString().split("T")[0],
    file_name: `laudo_${patient.name.toLowerCase()}.pdf`,
    file_url: "/mock-docs/laudo_bioquimico_thor.pdf",
    file_hash_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    extraction_status: "PENDING_REVIEW" as const,
    extracted_results: [],
    professional_review_notes: "Aguardando envio de laudo para este paciente.",
  };

  const currentPatientPlan = plans.find((p) => p.patient_id === patient.id) || {
    id: `plan-${patient.id}`,
    patient_id: patient.id,
    version: 1,
    title: `Plano Nutricional Balanceado - ${patient.name}`,
    feeding_type: "NATURAL_COOKED" as const,
    daily_energy_kcal: Math.round(70 * Math.pow(patient.current_weight_kg || 10, 0.75) * (patient.species === 'CANINE' ? 1.4 : 1.2)),
    meals_per_day: patient.species === 'CANINE' ? 2 : 3,
    is_active: true,
    hydration_target_ml_day: Math.round(patient.current_weight_kg * 50),
    transition_plan_days: 7,
    professional_id: "pro-1",
    approved_at: new Date().toISOString(),
    notes: "Plano formulado conforme diretrizes NRC (2006) e WSAVA.",
    supplements: [
      "Suplemento vitamínico e mineral completo",
      `Ômega 3 (EPA + DHA ${Math.round(patient.current_weight_kg * 40)}mg/dia)`,
      "Carbonato de Cálcio 1.0g/100g de carne (balanceador Ca:P)"
    ],
    items: [
      { ingredient_name: "Peito de frango cozido desfiado", quantity_grams: 140, notes: "Proteína magra de alta digestibilidade" },
      { ingredient_name: "Arroz branco cozido", quantity_grams: 90, notes: "Carboidrato de fácil digestão" },
      { ingredient_name: "Abóbora moranga cozida", quantity_grams: 60, notes: "Fibra solúvel para saúde digestiva" },
      { ingredient_name: "Azeite de oliva extravirgem", quantity_grams: 3, notes: "Ácidos graxos monoinsaturados" }
    ]
  };

  const handleSavePlan = (savedPlan: NutritionPlan) => {
    setPlans((prev) => {
      const idx = prev.findIndex((p) => p.patient_id === savedPlan.patient_id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedPlan;
        return copy;
      }
      return [savedPlan, ...prev];
    });

    fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(savedPlan),
    }).catch((err) => console.warn("Erro ao sincronizar plano no banco:", err));
  };

  const handleSaveDailyLog = (newLog: TutorDailyLog) => {
    setDailyLogs((prev) => [newLog, ...prev]);

    fetch("/api/daily-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLog),
    }).catch((err) => console.warn("Erro ao sincronizar diário no banco:", err));
  };

  const handleSaveAppointment = (newApt: AppointmentRecord, newMeas: MeasurementRecord) => {
    setAppointments((prev) => [newApt, ...prev]);
    setMeasurements((prev) => [...prev, newMeas]);

    // Atualiza o peso e ECC atual do paciente
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patient.id
          ? {
              ...p,
              current_weight_kg: newMeas.weight_kg,
              current_bcs: newMeas.bcs,
            }
          : p
      )
    );

    fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newApt,
        weight_kg: newMeas.weight_kg,
        bcs: newMeas.bcs,
        abdominal_circumference_cm: newMeas.abdominal_circumference_cm,
        thoracic_circumference_cm: newMeas.thoracic_circumference_cm,
      }),
    }).catch((err) => console.warn("Erro ao sincronizar atendimento no banco:", err));
  };

  const handlePatientDetected = (extracted: ExamExtractionResponse, fileUrl: string, fileName: string) => {
    if (extracted.patient_detected) {
      setDetectedData({
        patient: extracted.patient_detected,
        tutor: extracted.tutor_detected,
        lab: extracted.laboratory_name,
        date: extracted.exam_date,
      });
      setPendingExam({
        extracted,
        fileUrl,
        fileName,
      });
      setIsDetectedModalOpen(true);
    }
  };

  const handleSaveExam = (savedExam: ExamDocument) => {
    setExams((prev) => {
      const idx = prev.findIndex((e) => e.id === savedExam.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedExam;
        return copy;
      }
      return [savedExam, ...prev];
    });

    fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(savedExam),
    }).catch((err) => console.warn("Erro ao sincronizar exame no banco:", err));
  };

  const handleConfirmPreRegistration = (data: {
    name: string;
    species: Species;
    breed: string;
    sex: Sex;
    is_neutered: boolean;
    current_weight_kg: number;
    ideal_weight_kg: number;
    tutorName: string;
  }) => {
    const newTutorId = `tut-${Date.now()}`;
    const newPatientId = `pat-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newTutor: Tutor = {
      id: newTutorId,
      name: data.tutorName,
      email: "tutor@email.com",
      phone: "(11) 99999-8888",
      created_at: nowIso,
    };

    const newPatient: Patient = {
      id: newPatientId,
      tutor_id: newTutorId,
      name: data.name,
      species: data.species,
      breed: data.breed,
      birth_date: new Date(Date.now() - 3 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
      sex: data.sex,
      is_neutered: data.is_neutered,
      ideal_weight_kg: data.ideal_weight_kg,
      current_weight_kg: data.current_weight_kg,
      current_bcs: 5,
      avatar_url: data.species === "CANINE" ? "🐕" : "🐈",
      created_at: nowIso,
    };

    const newMeasurement: MeasurementRecord = {
      id: `m-${Date.now()}`,
      patient_id: newPatientId,
      date: nowIso.split("T")[0],
      weight_kg: data.current_weight_kg,
      bcs: 5,
      measured_by: "Dr. Roberto Almeida (CRZ 4821)",
      notes: `Cadastro inicial gerado a partir do laudo do laboratório ${detectedData?.lab || "BioVet"}.`,
    };

    const newAppointment: AppointmentRecord = {
      id: `apt-${Date.now()}`,
      patient_id: newPatientId,
      professional_id: "pro-1",
      professional_name: "Dr. Roberto Almeida (CRZ 4821)",
      type: "CONSULTORIA_NUTRICIONAL",
      status: "FINALIZADO",
      occurred_at: nowIso,
      version: 1,
      notes: `Primeiro atendimento iniciado via importação de laudo laboratorial. Animal: ${data.name} (${data.breed}).`,
      anamnesis: {
        reported_appetite: "NORMAL",
        water_intake: "NORMAL",
        stool_consistency: "NORMAL",
        vomiting_episodes_per_week: 0,
        treats_habits: "Em fase de anamnese e transição alimentar.",
      },
      diet_recommendation: "Avaliação laboratorial em andamento. Início de planejamento dietético personalizado.",
      created_at: nowIso,
    };

    if (pendingExam) {
      const newExamDoc: ExamDocument = {
        id: `ex-${Date.now()}`,
        patient_id: newPatientId,
        appointment_id: newAppointment.id,
        laboratory_name: pendingExam.extracted.laboratory_name,
        exam_date: pendingExam.extracted.exam_date,
        file_name: pendingExam.fileName,
        file_url: pendingExam.fileUrl,
        file_hash_sha256: `sha256_${Date.now()}`,
        extraction_status: "PENDING_REVIEW",
        extracted_results: pendingExam.extracted.extracted_results,
        professional_review_notes: pendingExam.extracted.preliminary_summary,
        patient_detected: pendingExam.extracted.patient_detected,
        tutor_detected: pendingExam.extracted.tutor_detected,
      };
      setExams((prev) => [newExamDoc, ...prev]);
      setPendingExam(null);
    }

    setTutors((prev) => [newTutor, ...prev]);
    setPatients((prev) => [newPatient, ...prev]);
    setMeasurements((prev) => [...prev, newMeasurement]);
    setAppointments((prev) => [newAppointment, ...prev]);

    fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        species: data.species,
        breed: data.breed,
        birth_date: newPatient.birth_date,
        sex: data.sex,
        is_neutered: data.is_neutered,
        ideal_weight_kg: data.ideal_weight_kg,
        current_weight_kg: data.current_weight_kg,
        tutor_name: data.tutorName,
      }),
    }).catch((err) => console.warn("Erro ao sincronizar novo paciente no banco:", err));

    // Seleciona o novo paciente imediatamente!
    setSelectedPatientId(newPatientId);
    setActiveTab("EXAMS");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de Alternância de Papéis (Dual B2B2C) e Pacientes */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Seletor de Perfil (Profissional vs Tutor) */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modo de Acesso:</span>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("PROFESSIONAL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  viewMode === "PROFESSIONAL"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profissional (Zootecnista / Nutrólogo)</span>
              </button>

              <button
                onClick={() => setViewMode("TUTOR")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  viewMode === "TUTOR"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visão do Tutor ({tutor.name.split(" ")[0]})</span>
              </button>
            </div>
          </div>

          {/* Seletor de Paciente */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Paciente:</span>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-md">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedPatientId === p.id
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p.avatar_url} {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MODO DO TUTOR (B2C) */}
        {viewMode === "TUTOR" ? (
          <TutorPortalView
            patient={patient}
            tutor={tutor}
            plan={currentPatientPlan}
            measurements={patientMeasurements}
            logs={patientDailyLogs}
            onOpenReport={() => setIsReportModalOpen(true)}
            onSaveDailyLog={handleSaveDailyLog}
          />
        ) : (
          /* MODO PROFISSIONAL (B2B) */
          <>
            {/* Cabeçalho do Paciente Ativo */}
            <PatientHeader 
              patient={patient} 
              tutor={tutor} 
              measurements={patientMeasurements} 
            />

            {/* Barra de Ações Rápidas do Profissional */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              {/* Abas Clínicas */}
              <div className="flex items-center space-x-2 border-b sm:border-b-0 border-slate-200 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab("EVOLUTION")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                    activeTab === "EVOLUTION"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Prontuário & Curva Ponderal</span>
                </button>

                <button
                  onClick={() => setActiveTab("CALCULATOR")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                    activeTab === "CALCULATOR"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calculadora (NRC / WSAVA)</span>
                </button>

                <button
                  onClick={() => setActiveTab("DIET")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                    activeTab === "DIET"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Plano Alimentar</span>
                </button>

                <button
                  onClick={() => setActiveTab("EXAMS")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                    activeTab === "EXAMS"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Exames & IA</span>
                </button>
              </div>

              {/* Botões de Ação Clínica */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Emitir Laudo / PDF</span>
                </button>

                <button
                  onClick={() => setIsAppointmentModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Novo Atendimento / Retorno</span>
                </button>
              </div>
            </div>

            {/* Conteúdo da Aba Ativa */}
            <div>
              {activeTab === "EVOLUTION" && (
                <TimelineEvolution 
                  appointments={patientAppointments} 
                  measurements={patientMeasurements} 
                  dailyLogs={patientDailyLogs}
                />
              )}

              {activeTab === "CALCULATOR" && (
                <NutritionalCalculator 
                  patient={patient} 
                />
              )}

              {activeTab === "DIET" && (
                <DietPlanViewer 
                  key={`${patient.id}-${currentPatientPlan.version}`}
                  plan={currentPatientPlan} 
                  patient={patient}
                  tutor={tutor}
                  onSavePlan={handleSavePlan}
                />
              )}

              {activeTab === "EXAMS" && (
                <ExamReviewSideBySide 
                  key={patient.id}
                  exam={currentPatientExam} 
                  species={patient.species}
                  onPatientDetected={handlePatientDetected}
                  onExamSaved={handleSaveExam}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Modal de Registro de Novo Atendimento */}
      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        patient={patient}
        onSave={handleSaveAppointment}
      />

      {/* Modal do Relatório Oficial de Evolução */}
      <EvolutionReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        patient={patient}
        tutor={tutor}
        appointments={patientAppointments}
        measurements={patientMeasurements}
        plan={currentPatientPlan}
        exam={currentPatientExam}
      />

      {/* Modal de Pré-Cadastro de Paciente Detectado via Exame */}
      {detectedData && (
        <DetectedPatientModal
          isOpen={isDetectedModalOpen}
          onClose={() => setIsDetectedModalOpen(false)}
          detectedPatient={detectedData.patient}
          detectedTutor={detectedData.tutor}
          laboratoryName={detectedData.lab}
          examDate={detectedData.date}
          onConfirm={handleConfirmPreRegistration}
        />
      )}

      {/* Rodapé Institucional */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <p>Essência Nutri Pet • Acompanhamento Nutricional Supervisionado por Médicos-Veterinários e Zootecnistas</p>
        <p className="text-[11px] text-slate-400 mt-1">Conformidade com LGPD e CFMV/CRMV • Hospedagem Segura Linux VPS Hostinger</p>
      </footer>
    </div>
  );
}
