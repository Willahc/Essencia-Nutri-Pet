"use client";

import React, { useState } from "react";
import { AppointmentRecord, MeasurementRecord, TutorDailyLog } from "@/types";
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  TrendingDown, 
  ArrowRight, 
  UserCheck, 
  Droplets, 
  AlertTriangle, 
  Sparkles,
  ClipboardList
} from "lucide-react";
import { STOOL_SCORE_DEFINITIONS, calculateAdherenceMetrics } from "@/lib/adherence";

interface TimelineEvolutionProps {
  appointments: AppointmentRecord[];
  measurements: MeasurementRecord[];
  dailyLogs?: TutorDailyLog[];
}

export function TimelineEvolution({ appointments, measurements, dailyLogs = [] }: TimelineEvolutionProps) {
  const [activeSubTab, setActiveSubTab] = useState<"APPOINTMENTS" | "TUTOR_LOGS">("APPOINTMENTS");

  const metrics = calculateAdherenceMetrics(dailyLogs);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl">
              Prontuário Longitudinal & Linha do Tempo
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Histórico Imutável (Append-Only) • Atendimentos Clínicos e Diário de Adesão do Tutor
            </p>
          </div>
        </div>

        {/* Seletor de Sub-Abas */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab("APPOINTMENTS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "APPOINTMENTS"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Atendimentos Clínicos ({appointments.length})
          </button>
          <button
            onClick={() => setActiveSubTab("TUTOR_LOGS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === "TUTOR_LOGS"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Diário do Tutor ({dailyLogs.length})</span>
            {metrics.hasRecentAlert && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* HISTÓRICO EVOLUTIVO DE PESAGENS / CURVA PONDERAL */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <TrendingDown className="w-4 h-4 mr-1.5 text-emerald-600" />
            Curva Ponderal do Paciente & Escore Corporal (ECC 1-9)
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            Última pesagem: {measurements.length > 0 ? measurements[measurements.length - 1].weight_kg : 0} kg
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {measurements.map((m, idx) => {
            const isFirst = idx === 0;
            const prev = isFirst ? null : measurements[idx - 1];
            const diff = prev ? (m.weight_kg - prev.weight_kg).toFixed(1) : null;

            return (
              <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-slate-700">
                    {new Date(m.date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    ECC {m.bcs}/9
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-800">
                  {m.weight_kg} <span className="text-xs font-semibold text-slate-400">kg</span>
                </div>
                <div className="text-[11px] mt-1.5 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500 truncate" title={m.notes}>
                    {m.notes?.split(".")[0] || "Pesagem registrada"}
                  </span>
                  {diff && (
                    <span className={`font-bold ml-1 ${Number(diff) <= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {Number(diff) > 0 ? `+${diff}` : diff} kg
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTEÚDO: DIÁRIO DE ADESÃO DO TUTOR */}
      {activeSubTab === "TUTOR_LOGS" && (
        <div className="space-y-6 animate-fade-in">
          {/* Métricas do Diário */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <span className="text-xs text-emerald-800 block font-bold uppercase mb-1">
                Fezes Padrão Ouro (Grau 2)
              </span>
              <span className="text-2xl font-black text-emerald-950">
                {metrics.optimalStoolPercentage}%
              </span>
              <p className="text-[11px] text-emerald-700 mt-0.5">Consistência e trânsito ideais</p>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-2xl">
              <span className="text-xs text-cyan-800 block font-bold uppercase mb-1">
                Média de Ingestão de Água
              </span>
              <span className="text-2xl font-black text-cyan-950">
                {metrics.averageWaterMl} mL/dia
              </span>
              <p className="text-[11px] text-cyan-700 mt-0.5">Reportada pelo tutor</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-xs text-slate-500 block font-bold uppercase mb-1">
                Total de Registros
              </span>
              <span className="text-2xl font-black text-slate-800">
                {metrics.totalLogs} dias
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">Adesão ativa do tutor</p>
            </div>
          </div>

          {/* Alerta Clínico */}
          {metrics.hasRecentAlert && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start space-x-3 text-rose-950">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block text-rose-900 text-sm mb-0.5">Alerta de Adaptação Entérica:</strong>
                <p>{metrics.alertReason}</p>
                <p className="text-[11px] text-rose-800 mt-1">
                  Recomenda-se contatar o tutor para desacelerar a transição ou ajustar fibra solúvel.
                </p>
              </div>
            </div>
          )}

          {/* Registros Detalhados */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Histórico Cronológico dos Registros do Tutor
            </h4>

            {dailyLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Nenhum registro do tutor ainda.</p>
            ) : (
              dailyLogs.map((log) => {
                const stoolDef = STOOL_SCORE_DEFINITIONS[log.stool_score];
                return (
                  <div
                    key={log.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-800 text-sm">
                          {new Date(log.date + "T00:00:00").toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Dia {log.transition_day} do Plano
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stoolDef.badgeClass}`}>
                          {stoolDef.emoji} Grau {log.stool_score}: {stoolDef.shortLabel}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span>Consumo: <strong className="text-emerald-700">{log.diet_consumed_percentage}%</strong></span>
                        <span>•</span>
                        <span>Água: <strong className="text-cyan-700">{log.water_intake_ml} mL</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 mb-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Apetite:</span>
                        <span className="font-semibold text-slate-800">
                          {log.appetite === "NORMAL"
                            ? "Normal / Saudável"
                            : log.appetite === "VORACIOUS"
                            ? "Voraz"
                            : log.appetite === "RELUCTANT"
                            ? "Relutante"
                            : "Recusado"}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Suplementos Tomados:</span>
                        <span className="font-semibold text-slate-800">
                          {log.supplements_taken ? "✓ Sim" : "✗ Não"}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Petiscos Extras:</span>
                        <span className="font-semibold text-slate-800">
                          {log.treats_given ? "⚠️ Sim" : "Não"}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Episódios de Vômito:</span>
                        <span className={`font-semibold ${log.vomiting_episodes > 0 ? "text-rose-600" : "text-slate-800"}`}>
                          {log.vomiting_episodes}
                        </span>
                      </div>
                    </div>

                    {log.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 italic">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO: ATENDIMENTOS CLÍNICOS ASSINADOS */}
      {activeSubTab === "APPOINTMENTS" && (
        <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 animate-fade-in">
          {appointments.map((apt) => (
            <div key={apt.id} className="relative group">
              {/* Marcador na linha */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm" />

              <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-800 text-sm">
                      {apt.type === 'CONSULTORIA_NUTRICIONAL' && 'Consultoria Nutricional Inicial'}
                      {apt.type === 'RETORNO' && 'Retorno Clínico'}
                      {apt.type === 'REAVALIACAO_NUTRICIONAL' && 'Reavaliação Nutricional'}
                      {apt.type === 'CONSULTA' && 'Consulta Clínica'}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                      v{apt.version}.0
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {new Date(apt.occurred_at).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <UserCheck className="w-3 h-3 mr-1" />
                      {apt.status === 'FINALIZADO' ? 'Finalizado & Assinado' : 'Rascunho'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 mb-3 leading-relaxed">
                  {apt.notes}
                </p>

                {/* Anamnese Específica */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Apetite:</span>
                    <span className="font-medium text-slate-700">{apt.anamnesis.reported_appetite}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Consistência Fecal:</span>
                    <span className="font-medium text-slate-700">{apt.anamnesis.stool_consistency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ingestão Hídrica:</span>
                    <span className="font-medium text-slate-700">{apt.anamnesis.water_intake}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Vômitos / Semana:</span>
                    <span className="font-medium text-slate-700">{apt.anamnesis.vomiting_episodes_per_week}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-emerald-50/60 border border-emerald-200/50 p-2.5 rounded-xl mb-3">
                  <strong className="text-emerald-900">Conduta Nutricional Prescrita:</strong> {apt.diet_recommendation}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Profissional: {apt.professional_name}</span>
                  <span>ID Registro: {apt.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
