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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Identificação do Animal */}
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl shadow-inner">
            {patient.avatar_url || "🐾"}
          </div>
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
              <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                patient.species === 'CANINE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {patient.species === 'CANINE' ? 'Canino' : 'Felino'} • {patient.breed}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {patient.sex === 'MALE' ? 'Macho' : 'Fêmea'} ({patient.is_neutered ? 'Castrado' : 'Inteiro'})
              </span>
            </div>

            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 flex-wrap gap-y-1">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Nascimento: {new Date(patient.birth_date).toLocaleDateString("pt-BR")}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700">Tutor(a): {tutor.name}</span>
              <span className="flex items-center text-slate-500">
                <Phone className="w-3 h-3 mr-1 text-slate-400" /> {tutor.phone}
              </span>
            </div>

            {/* Alergias e Comorbidades */}
            <div className="flex items-center space-x-2 mt-3 flex-wrap gap-y-1">
              {patient.allergies?.map((allergy, i) => (
                <span key={i} className="inline-flex items-center text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                  <AlertTriangle className="w-3 h-3 mr-1 text-rose-500" />
                  {allergy}
                </span>
              ))}
              {patient.comorbidities?.map((c, i) => (
                <span key={i} className="inline-flex items-center text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Métricas Nutricionais Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
          {/* Peso Atual */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Peso Atual</span>
              <Scale className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-800">
              {patient.current_weight_kg} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <div className="text-[11px] mt-0.5">
              {isLoss ? (
                <span className="text-emerald-600 font-medium">↓ {Math.abs(Number(weightDiff))} kg acumulados</span>
              ) : (
                <span className="text-slate-500">Peso de entrada</span>
              )}
            </div>
          </div>

          {/* Peso Meta / Ideal */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-slate-500 text-xs mb-1">Meta Ideal</div>
            <div className="text-xl font-bold text-emerald-700">
              {patient.ideal_weight_kg} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Faltam {(patient.current_weight_kg - patient.ideal_weight_kg).toFixed(1)} kg
            </div>
          </div>

          {/* Escore Corporal (ECC) com Abertura Interativa do Guia Gráfico */}
          <button
            type="button"
            onClick={() => setIsBcsModalOpen(true)}
            className="bg-white p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:ring-2 hover:ring-emerald-200/60 shadow-2xs col-span-2 sm:col-span-1 text-left transition-all group"
            title="Clique para abrir a Escala Gráfica WSAVA (1-9) e o Simulador de Projeção de Saúde"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Escore (ECC 1-9)</span>
              <Sparkles className="w-3 h-3 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xl font-bold ${
                patient.current_bcs <= 5 ? 'text-emerald-700' : 'text-amber-600'
              }`}>
                {patient.current_bcs}/9
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                patient.current_bcs <= 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {bcsInfo.status === 'IDEAL' ? 'Ideal' : 'Sobrepeso'}
              </span>
            </div>
            <div className="text-[10px] text-emerald-700 font-bold mt-1.5 flex items-center group-hover:underline">
              <span>Guia Visual & Projeção</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </div>
          </button>
        </div>
      </div>

      {/* MODAL CLÍNICO: GUIA GRÁFICO ECC 1-9 & SIMULADOR DE PROJEÇÃO DE SAÚDE */}
      {isBcsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-5 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  Avaliação Morfológica ECC 1-9 & Projeção Clínica de Saúde • {patient.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBcsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6">
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
