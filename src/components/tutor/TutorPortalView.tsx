"use client";

import React, { useState } from "react";
import { Patient, Tutor, NutritionPlan, MeasurementRecord, TutorDailyLog } from "@/types";
import { 
  Utensils, 
  Droplets, 
  AlertOctagon, 
  Heart, 
  CheckCircle2, 
  Award, 
  Calendar, 
  FileText, 
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
  Check,
  AlertTriangle
} from "lucide-react";
import { STOOL_SCORE_DEFINITIONS, getTransitionStepInfo, calculateAdherenceMetrics } from "@/lib/adherence";
import { NewDailyLogModal } from "./NewDailyLogModal";

interface TutorPortalViewProps {
  patient: Patient;
  tutor: Tutor;
  plan: NutritionPlan;
  measurements: MeasurementRecord[];
  logs?: TutorDailyLog[];
  onOpenReport: () => void;
  onSaveDailyLog?: (newLog: TutorDailyLog) => void;
}

export function TutorPortalView({
  patient,
  tutor,
  plan,
  measurements,
  logs = [],
  onOpenReport,
  onSaveDailyLog,
}: TutorPortalViewProps) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [waterDrunk, setWaterDrunk] = useState<number>(
    logs.length > 0 ? logs[0].water_intake_ml : Math.round(patient.current_weight_kg * 45)
  );

  const initialWeight = measurements.length > 0 ? measurements[0].weight_kg : patient.current_weight_kg;
  const currentWeight = patient.current_weight_kg;
  const targetWeight = patient.ideal_weight_kg;

  const totalToLose = initialWeight - targetWeight;
  const alreadyLost = initialWeight - currentWeight;
  const progressPercent = Math.min(100, Math.max(0, Math.round((alreadyLost / (totalToLose || 1)) * 100)));

  const portionPerMeal = Math.round(
    plan.items.reduce((acc, item) => acc + item.quantity_grams, 0) / (plan.meals_per_day || 1)
  );

  const transitionDaysTotal = plan.transition_plan_days || 7;
  // Sugere o próximo dia de transição com base na contagem de registros existentes
  const currentTransitionDay = Math.min(transitionDaysTotal, logs.length + 1);
  const transitionStep = getTransitionStepInfo(currentTransitionDay, transitionDaysTotal);

  const metrics = calculateAdherenceMetrics(logs);
  const todayStr = new Date().toISOString().split("T")[0];
  const hasLoggedToday = logs.some((l) => l.date === todayStr);

  const handleSaveLog = (newLog: TutorDailyLog) => {
    setWaterDrunk(newLog.water_intake_ml);
    if (onSaveDailyLog) {
      onSaveDailyLog(newLog);
    }
  };

  return (
    <div className="space-y-6">
      {/* Boas-vindas ao Tutor */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner border border-white/20 shrink-0">
              {patient.avatar_url || "🐾"}
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
                <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
                <span>Portal do Tutor • Cuidado Contínuo Supervisionado</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Olá, {tutor.name.split(" ")[0]}!
              </h2>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                Aqui estão as orientações nutricionais aprovadas para o cuidado diário do(a) <strong>{patient.name}</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all flex items-center space-x-2 border border-emerald-300/40"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{hasLoggedToday ? "Atualizar Diário de Hoje" : "Registrar Diário de Hoje"}</span>
            </button>

            <button
              onClick={onOpenReport}
              className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Ver Laudo Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de Saúde se Houve Vômito ou Fezes Anormais */}
      {metrics.hasRecentAlert && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-950">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="block text-amber-900 text-sm mb-0.5">Aviso de Adaptação Intestinal:</strong>
            <p>{metrics.alertReason}</p>
            <p className="text-[11px] text-amber-800 mt-1">
              Caso as alterações persistam por mais de 24 horas, suspenda o avanço da transição e acione seu especialista.
            </p>
          </div>
        </div>
      )}

      {/* CRONOGRAMA DE TRANSIÇÃO ALIMENTAR */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-800 text-base">Transição Alimentar Gradual</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                  Dia {currentTransitionDay} de {transitionDaysTotal}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{transitionStep.phaseLabel}</p>
            </div>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 self-start sm:self-auto transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirmar Refeição do Dia</span>
          </button>
        </div>

        {/* Régua Visual dos Dias da Transição */}
        <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 mb-4">
          {Array.from({ length: transitionDaysTotal }).map((_, idx) => {
            const dayNum = idx + 1;
            const isCompleted = dayNum < currentTransitionDay || (dayNum === currentTransitionDay && hasLoggedToday);
            const isCurrent = dayNum === currentTransitionDay && !hasLoggedToday;

            return (
              <div
                key={dayNum}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  isCompleted
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                    : isCurrent
                    ? "bg-amber-50 border-amber-300 text-amber-900 font-extrabold ring-2 ring-amber-400/40"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <span className="text-[10px] uppercase">D{dayNum}</span>
                <span className="text-xs mt-0.5">
                  {isCompleted ? "✓" : `${Math.min(100, Math.round((dayNum / transitionDaysTotal) * 100))}%`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Proporção de Hoje */}
        <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/50 p-4 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div>
            <strong className="text-emerald-950 block text-sm">
              Proporção no Comedouro Hoje:
            </strong>
            <p className="text-emerald-800 mt-0.5">{transitionStep.guidance}</p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold shadow-2xs">
              {transitionStep.percentNewDiet}% Nova Dieta
            </span>
            <span className="text-slate-400 font-bold">+</span>
            <span className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-xl font-bold">
              {transitionStep.percentOldDiet}% Dieta Antiga
            </span>
          </div>
        </div>
      </div>

      {/* Grid: A Refeição de Hoje + Hidratação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Como Alimentar Hoje */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
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

            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/60 mb-4 text-center">
              <span className="text-xs text-amber-900 block font-medium">Porção calculada por refeição</span>
              <span className="text-3xl font-black text-amber-950 mt-1 block">
                {portionPerMeal} <span className="text-sm font-semibold">gramas</span>
              </span>
              <p className="text-[11px] text-amber-800/80 mt-1">
                Pesar os alimentos após o cozimento na balança culinária.
              </p>
            </div>

            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Ingredientes principais:</h5>
            <ul className="space-y-1.5 text-xs text-slate-600 mb-4">
              {plan.items.slice(0, 5).map((item, idx) => (
                <li key={idx} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="font-medium text-slate-800">{item.ingredient_name.split("(")[0]}</span>
                  <span className="font-bold text-slate-700">{item.quantity_grams}g / dia</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            💡 <strong>Dica Nutricional:</strong> Adicione a suplementação vitamínica e o carbonato de cálcio somente na hora de servir, com o prato morno ou frio.
          </div>
        </div>

        {/* Card: Hidratação e Cuidados */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Controle Hídrico</h4>
                  <p className="text-[11px] text-slate-400">Meta diária recomendada</p>
                </div>
              </div>
              <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                {plan.hydration_target_ml_day} mL
              </span>
            </div>

            <div className="bg-cyan-50/60 rounded-2xl p-4 border border-cyan-200/60 mb-5 text-center">
              <span className="text-xs text-cyan-900 block font-medium">Água consumida registrada hoje</span>
              <span className="text-3xl font-black text-cyan-950 mt-1 block">
                {waterDrunk} <span className="text-sm font-semibold">mL</span>
              </span>
              <div className="flex justify-center space-x-2 mt-3">
                <button
                  onClick={() => setWaterDrunk((prev) => Math.min(plan.hydration_target_ml_day * 1.5, prev + 150))}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  + 150 mL (1 Pote)
                </button>
                <button
                  onClick={() => setWaterDrunk(0)}
                  className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                >
                  Zerar
                </button>
              </div>
            </div>

            {/* Alimentos Proibidos & Alergias */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs mb-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>NÃO OFERECER (Tóxico ou Alergia):</span>
              </div>
              <p className="text-[11px] text-rose-900 leading-relaxed">
                {patient.allergies && patient.allergies.length > 0 ? (
                  <><strong>Alergia cadastrada:</strong> {patient.allergies.join(", ")}. </>
                ) : null}
                Proibido expressamente: chocolate, uvas/passas, cebola, alho, carambola, macadâmia e adoçantes com xilitol.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Acompanhamento:</span>
            <span className="font-bold text-slate-800">Plataforma Essência Nutri Pet</span>
          </div>
        </div>
      </div>

      {/* HISTÓRICO DOS ÚLTIMOS DIÁRIOS REGISTRADOS PELO TUTOR */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h4 className="font-extrabold text-slate-800 text-sm">Histórico de Registros do Tutor</h4>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {logs.length} registro(s) arquivado(s)
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <p>Nenhum diário registrado ainda para este paciente.</p>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Fazer Primeiro Registro de Hoje
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {logs.map((log) => {
              const stoolDef = STOOL_SCORE_DEFINITIONS[log.stool_score];
              return (
                <div
                  key={log.id}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2 pb-2 border-b border-slate-200/60">
                      <span className="font-bold text-slate-800">
                        {new Date(log.date + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Dia {log.transition_day} da Transição
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Fezes:</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stoolDef.badgeClass}`}>
                          {stoolDef.emoji} Grau {log.stool_score} ({stoolDef.shortLabel})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Apetite:</span>
                        <span className="font-semibold text-slate-800">
                          {log.appetite === "NORMAL"
                            ? "😋 Normal"
                            : log.appetite === "VORACIOUS"
                            ? "⚡ Voraz"
                            : log.appetite === "RELUCTANT"
                            ? "😐 Relutante"
                            : "🚫 Recusou"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Consumo da Dieta:</span>
                        <span className="font-bold text-emerald-700">{log.diet_consumed_percentage}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Água Bebida:</span>
                        <span className="font-semibold text-cyan-700">{log.water_intake_ml} mL</span>
                      </div>
                    </div>

                    {log.notes && (
                      <p className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 italic">
                        "{log.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Suplementos: {log.supplements_taken ? "✓ Sim" : "✗ Não"}</span>
                    <span>Vômitos: {log.vomiting_episodes}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Registro de Novo Diário */}
      <NewDailyLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        patient={patient}
        transitionDaysTotal={transitionDaysTotal}
        currentDaySuggestion={currentTransitionDay}
        onSaveLog={handleSaveLog}
      />
    </div>
  );
}
