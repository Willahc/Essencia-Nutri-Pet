"use client";

import React, { useState } from "react";
import { Patient, Tutor, NutritionPlan, MeasurementRecord } from "@/types";
import { Utensils, Droplets, AlertOctagon, Heart, CheckCircle2, Award, Calendar, FileText, ArrowRight } from "lucide-react";

interface TutorPortalViewProps {
  patient: Patient;
  tutor: Tutor;
  plan: NutritionPlan;
  measurements: MeasurementRecord[];
  onOpenReport: () => void;
}

export function TutorPortalView({ patient, tutor, plan, measurements, onOpenReport }: TutorPortalViewProps) {
  const [waterDrunk, setWaterDrunk] = useState<number>(650);

  const initialWeight = measurements.length > 0 ? measurements[0].weight_kg : patient.current_weight_kg;
  const currentWeight = patient.current_weight_kg;
  const targetWeight = patient.ideal_weight_kg;

  const totalToLose = initialWeight - targetWeight;
  const alreadyLost = initialWeight - currentWeight;
  const progressPercent = Math.min(100, Math.max(0, Math.round((alreadyLost / totalToLose) * 100)));

  const portionPerMeal = Math.round(
    plan.items.reduce((acc, item) => acc + item.quantity_grams, 0) / plan.meals_per_day
  );

  return (
    <div className="space-y-6">
      {/* Boas-vindas ao Tutor */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner border border-white/20">
              {patient.avatar_url || "🐾"}
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
                <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
                <span>Portal do Tutor • Cuidado Contínuo</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Olá, {tutor.name.split(" ")[0]}!
              </h2>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                Aqui estão as orientações aprovadas pelo seu especialista para o acompanhamento diário do(a) <strong>{patient.name}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenReport}
              className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Ver Laudo & Relatório Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progresso da Meta de Peso */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-base">Meta de Saúde & Peso</h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {progressPercent}% da Meta Atingida!
          </span>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200 mb-3">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-3 text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div>
            <span className="text-slate-400 block text-[10px]">Peso Inicial:</span>
            <span className="font-semibold text-slate-700">{initialWeight} kg</span>
          </div>
          <div className="border-x border-slate-100">
            <span className="text-emerald-600 font-bold block text-[10px]">Peso Atual:</span>
            <span className="font-extrabold text-slate-900 text-sm">{currentWeight} kg</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Meta Saudável:</span>
            <span className="font-semibold text-emerald-700">{targetWeight} kg</span>
          </div>
        </div>
      </div>

      {/* Grid: A Refeição de Hoje + Hidratação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Como Alimentar Hoje */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Refeição de Hoje</h4>
                  <p className="text-[11px] text-slate-400">{plan.title}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                {plan.meals_per_day}x ao dia
              </span>
            </div>

            <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200/60 mb-4 text-center">
              <span className="text-xs text-amber-900 block font-medium">Porção exata por refeição</span>
              <span className="text-3xl font-black text-amber-950 mt-1 block">
                {portionPerMeal} <span className="text-sm font-semibold">gramas</span>
              </span>
              <p className="text-[11px] text-amber-800/80 mt-1">
                Pesar os alimentos após o cozimento, conforme orientação do seu profissional.
              </p>
            </div>

            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Ingredientes que compõem o prato:</h5>
            <ul className="space-y-1.5 text-xs text-slate-600 mb-4">
              {plan.items.slice(0, 4).map((item, idx) => (
                <li key={idx} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="font-medium text-slate-800">{item.ingredient_name.split("(")[0]}</span>
                  <span className="font-bold text-slate-700">{item.quantity_grams}g / dia</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            💡 <strong>Dica do Especialista:</strong> Não ofereça petiscos humanos industrializados. Se quiser agradar, use cenoura ou chuchu cozidos sem sal.
          </div>
        </div>

        {/* Card: Hidratação e Cuidados */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Controle de Água</h4>
                  <p className="text-[11px] text-slate-400">Meta calculada para hoje</p>
                </div>
              </div>
              <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                {plan.hydration_target_ml_day} mL
              </span>
            </div>

            <div className="bg-cyan-50/60 rounded-xl p-4 border border-cyan-200/60 mb-5 text-center">
              <span className="text-xs text-cyan-900 block font-medium">Água consumida registrada hoje</span>
              <span className="text-3xl font-black text-cyan-950 mt-1 block">
                {waterDrunk} <span className="text-sm font-semibold">mL</span>
              </span>
              <div className="flex justify-center space-x-2 mt-3">
                <button
                  onClick={() => setWaterDrunk((prev) => Math.min(plan.hydration_target_ml_day, prev + 150))}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                >
                  + 150 mL (1 Pote)
                </button>
                <button
                  onClick={() => setWaterDrunk(0)}
                  className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Reiniciar
                </button>
              </div>
            </div>

            {/* Alimentos Proibidos & Alergias */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs mb-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>NÃO OFERECER (Tóxico ou Alergia):</span>
              </div>
              <p className="text-[11px] text-rose-900 leading-relaxed">
                {patient.allergies && patient.allergies.length > 0 ? (
                  <><strong>Alergia cadastrada:</strong> {patient.allergies.join(", ")}. </>
                ) : null}
                Proibido expressamente: chocolate, uvas/passas, cebola, alho, carambola, macadâmia e massas com xilitol.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Próximo Retorno Agendado:</span>
            <span className="font-bold text-slate-800">10 de Novembro de 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
