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
import { 
  MOCK_PATIENTS, 
  MOCK_TUTORS, 
  MOCK_MEASUREMENTS, 
  MOCK_APPOINTMENTS, 
  MOCK_NUTRITION_PLAN, 
  MOCK_EXAM 
} from "@/data/mock-data";
import { AppointmentRecord, MeasurementRecord, Patient } from "@/types";
import { Activity, Calculator, Utensils, FileText, PlusCircle, Printer, Eye, User, Sparkles } from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<"PROFESSIONAL" | "TUTOR">("PROFESSIONAL");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("pat-1");
  const [activeTab, setActiveTab] = useState<"EVOLUTION" | "CALCULATOR" | "DIET" | "EXAMS">("EVOLUTION");

  // Estados locais para persistência em memória durante a sessão
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>(MOCK_MEASUREMENTS);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(MOCK_APPOINTMENTS);

  // Modais
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const patient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const tutor = MOCK_TUTORS.find((t) => t.id === patient.tutor_id) || MOCK_TUTORS[0];
  const patientMeasurements = measurements.filter((m) => m.patient_id === patient.id);
  const patientAppointments = appointments.filter((a) => a.patient_id === patient.id);

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
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                  exam={MOCK_EXAM} 
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
        exam={MOCK_EXAM}
      />

      {/* Rodapé Institucional */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <p>Essência Nutri Pet • Acompanhamento Nutricional Supervisionado por Médicos-Veterinários e Zootecnistas</p>
        <p className="text-[11px] text-slate-400 mt-1">Conformidade com LGPD e CFMV/CRMV • Hospedagem Segura Linux VPS Hostinger</p>
      </footer>
    </div>
  );
}
