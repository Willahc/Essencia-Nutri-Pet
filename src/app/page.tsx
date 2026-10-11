"use client";

import React, { useState } from "react";
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
  MOCK_NUTRITION_PLAN, 
  MOCK_EXAM 
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
  ExamDocument 
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
  const [exams, setExams] = useState<ExamDocument[]>([MOCK_EXAM]);

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
            plan={MOCK_NUTRITION_PLAN}
            measurements={patientMeasurements}
            onOpenReport={() => setIsReportModalOpen(true)}
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
                />
              )}

              {activeTab === "CALCULATOR" && (
                <NutritionalCalculator 
                  patient={patient} 
                />
              )}

              {activeTab === "DIET" && (
                <DietPlanViewer 
                  plan={MOCK_NUTRITION_PLAN} 
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
        plan={MOCK_NUTRITION_PLAN}
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
