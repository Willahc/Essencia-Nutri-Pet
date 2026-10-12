import React, { useState } from "react";
import { Patient, Tutor, MeasurementRecord, NutritionPlan } from "@/types";
import { getBCSDescription } from "@/lib/nutrition-calc";
import { Phone, Mail, MapPin, Calendar, Scale, AlertTriangle, CheckCircle2, X, Sparkles, ChevronRight } from "lucide-react";
import { BodyConditionTracker } from "./BodyConditionTracker";

interface PatientHeaderProps {
  patient: Patient;
  tutor: Tutor;
  measurements: MeasurementRecord[];
  plan?: NutritionPlan;
}

export function PatientHeader({ patient, tutor, measurements, plan }: PatientHeaderProps) {
  const [isBcsModalOpen, setIsBcsModalOpen] = useState(false);
  const bcsInfo = getBCSDescription(patient.current_bcs);
  
  // Calcular diferença do peso inicial
  const initialWeight = measurements.length > 0 ? measurements[0].weight_kg : patient.current_weight_kg;
  const weightDiff = (patient.current_weight_kg - initialWeight).toFixed(1);
  const isLoss = Number(weightDiff) < 0;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        {/* Identificação do Animal */}
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0">
            {patient.avatar_url || "🐾"}
          </div>
          <div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
              <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold ${
                patient.species === 'CANINE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {patient.species === 'CANINE' ? 'Canino' : 'Felino'} • {patient.breed}
              </span>
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-slate-100 text-slate-700">
                {patient.sex === 'MALE' ? 'Macho' : 'Fêmea'} ({patient.is_neutered ? 'Castrado' : 'Inteiro'})
              </span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-500 flex-wrap gap-y-1">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                {new Date(patient.birth_date).toLocaleDateString("pt-BR")}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">Tutor: {tutor.name.split(" ")[0]}</span>
              <span className="flex items-center text-slate-500">
                <Phone className="w-3 h-3 mr-1 text-slate-400 shrink-0" /> {tutor.phone}
              </span>
            </div>

            {/* Alergias e Comorbidades */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 mt-2 sm:mt-3 flex-wrap gap-y-1">
              {patient.allergies?.map((allergy, i) => (
                <span key={i} className="inline-flex items-center text-[10px] sm:text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                  <AlertTriangle className="w-3 h-3 mr-1 text-rose-500 shrink-0" />
                  {allergy}
                </span>
              ))}
              {patient.comorbidities?.map((c, i) => (
                <span key={i} className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Métricas Nutricionais Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 bg-slate-50/80 p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/60">
          {/* Peso Atual */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs mb-0.5">
              <span>Peso Atual</span>
              <Scale className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-800">
              {patient.current_weight_kg} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <div className="text-[10px] sm:text-[11px] mt-0.5">
              {isLoss ? (
                <span className="text-emerald-600 font-bold">↓ {Math.abs(Number(weightDiff))} kg</span>
              ) : (
                <span className="text-slate-500">Peso entrada</span>
              )}
            </div>
          </div>

          {/* Peso Meta / Ideal */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-slate-500 text-[11px] sm:text-xs mb-0.5">Meta Ideal</div>
            <div className="text-lg sm:text-xl font-black text-emerald-700">
              {patient.ideal_weight_kg} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              Faltam {(patient.current_weight_kg - patient.ideal_weight_kg).toFixed(1)} kg
            </div>
          </div>

          {/* Escore Corporal (ECC) com Abertura Interativa do Guia Gráfico */}
          <button
            type="button"
            onClick={() => setIsBcsModalOpen(true)}
            className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:ring-2 hover:ring-emerald-200/60 active:bg-slate-50 shadow-2xs col-span-2 sm:col-span-1 text-left transition-all group min-h-[44px]"
            title="Clique para abrir a Escala Gráfica WSAVA (1-9) e o Simulador de Projeção de Saúde"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs mb-0.5">
              <span>ECC (1 a 9)</span>
              <Sparkles className="w-3 h-3 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className={`text-lg sm:text-xl font-black ${
                patient.current_bcs <= 5 ? 'text-emerald-700' : 'text-amber-600'
              }`}>
                {patient.current_bcs}/9
              </span>
              <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded ${
                patient.current_bcs <= 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {bcsInfo.status === 'IDEAL' ? 'Ideal' : 'Sobrepeso'}
              </span>
            </div>
            <div className="text-[10px] text-emerald-700 font-extrabold mt-1 flex items-center group-hover:underline">
              <span>Guia Visual</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </div>
          </button>
        </div>
      </div>

      {/* MODAL CLÍNICO: GUIA GRÁFICO ECC 1-9 & SIMULADOR DE PROJEÇÃO DE SAÚDE */}
      {isBcsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-5 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-5xl max-h-[92dvh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-2.5 truncate">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                <h3 className="font-extrabold text-xs sm:text-base truncate">
                  ECC 1-9 & Projeção Clínica • {patient.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBcsModalOpen(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white transition-colors shrink-0"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-3 sm:p-6 touch-scroll">
              <BodyConditionTracker
                patient={patient}
                plan={plan}
                variant="CLINICAL"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

