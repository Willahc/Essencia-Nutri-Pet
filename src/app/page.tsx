"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { NutritionalCalculator } from "@/components/patient/NutritionalCalculator";
import { TimelineEvolution } from "@/components/patient/TimelineEvolution";
import { DietPlanViewer } from "@/components/patient/DietPlanViewer";
import { ExamReviewSideBySide } from "@/components/patient/ExamReviewSideBySide";
import { 
  MOCK_PATIENTS, 
  MOCK_TUTORS, 
  MOCK_MEASUREMENTS, 
  MOCK_APPOINTMENTS, 
  MOCK_NUTRITION_PLAN, 
  MOCK_EXAM 
} from "@/data/mock-data";
import { Activity, Calculator, Utensils, FileText, ChevronRight, Sparkles } from "lucide-react";

export default function Home() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("pat-1");
  const [activeTab, setActiveTab] = useState<"EVOLUTION" | "CALCULATOR" | "DIET" | "EXAMS">("EVOLUTION");

  const patient = MOCK_PATIENTS.find((p) => p.id === selectedPatientId) || MOCK_PATIENTS[0];
  const tutor = MOCK_TUTORS.find((t) => t.id === patient.tutor_id) || MOCK_TUTORS[0];
  const measurements = MOCK_MEASUREMENTS.filter((m) => m.patient_id === patient.id);
  const appointments = MOCK_APPOINTMENTS.filter((a) => a.patient_id === patient.id);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seletor de Paciente para Demonstração */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Selecionar Paciente:
            </span>
            <div className="inline-flex bg-slate-200/80 p-1 rounded-xl">
              {MOCK_PATIENTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedPatientId === p.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p.avatar_url} {p.name} ({p.species === "CANINE" ? "Cão" : "Gato"})
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ficha Clínica Longitudinal Ativa • Dados Sintéticos Validados</span>
          </div>
        </div>

        {/* Cabeçalho do Paciente Ativo */}
        <PatientHeader 
          patient={patient} 
          tutor={tutor} 
          measurements={measurements} 
        />

        {/* Abas de Navegação Clínica */}
        <div className="flex items-center space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("EVOLUTION")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "EVOLUTION"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Prontuário & Curva Ponderal</span>
          </button>

          <button
            onClick={() => setActiveTab("CALCULATOR")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "CALCULATOR"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculadora Zootécnica (NRC/WSAVA)</span>
          </button>

          <button
            onClick={() => setActiveTab("DIET")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "DIET"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Plano Alimentar Versionado</span>
          </button>

          <button
            onClick={() => setActiveTab("EXAMS")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "EXAMS"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Revisão de Exames com IA</span>
          </button>
        </div>

        {/* Conteúdo Dinâmico por Aba */}
        <div>
          {activeTab === "EVOLUTION" && (
            <TimelineEvolution 
              appointments={appointments} 
              measurements={measurements} 
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
      </main>

      {/* Rodapé Institucional */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <p>Essência Nutri Pet • Acompanhamento Nutricional Supervisionado por Médicos-Veterinários e Zootecnistas</p>
        <p className="text-[11px] text-slate-400 mt-1">Conformidade com LGPD e Diretrizes Éticas do CFMV/CRMV • Hospedagem Segura Linux VPS Hostinger</p>
      </footer>
    </div>
  );
}
