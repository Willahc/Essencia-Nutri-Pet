import React from "react";
import { AppointmentRecord, MeasurementRecord } from "@/types";
import { Clock, Calendar, CheckCircle, TrendingDown, ArrowRight, UserCheck } from "lucide-react";

interface TimelineEvolutionProps {
  appointments: AppointmentRecord[];
  measurements: MeasurementRecord[];
}

export function TimelineEvolution({ appointments, measurements }: TimelineEvolutionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Prontuário Longitudinal & Linha do Tempo</h3>
            <p className="text-xs text-slate-500">Histórico Imutável (Append-Only) • Registros Datados e Versionados</p>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {appointments.length} atendimentos registrados
        </span>
      </div>

      {/* Histórico Evolutivo de Pesagens */}
      <div className="mb-8 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
          <TrendingDown className="w-4 h-4 mr-1.5 text-emerald-600" />
          Curva Ponderal do Paciente
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {measurements.map((m, idx) => {
            const isFirst = idx === 0;
            const prev = isFirst ? null : measurements[idx - 1];
            const diff = prev ? (m.weight_kg - prev.weight_kg).toFixed(1) : null;

            return (
              <div key={m.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>{new Date(m.date).toLocaleDateString("pt-BR")}</span>
                  <span className="font-semibold text-slate-700">ECC: {m.bcs}/9</span>
                </div>
                <div className="text-xl font-bold text-slate-800">
                  {m.weight_kg} <span className="text-xs font-normal text-slate-500">kg</span>
                </div>
                <div className="text-[11px] mt-1 flex items-center justify-between">
                  <span className="text-slate-500 truncate" title={m.notes}>
                    {m.notes?.split(".")[0]}
                  </span>
                  {diff && (
                    <span className="text-emerald-600 font-bold ml-1">
                      {diff} kg
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Linha do Tempo de Atendimentos */}
      <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
        {appointments.map((apt) => (
          <div key={apt.id} className="relative group">
            {/* Marcador na linha */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm" />

            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {apt.type === 'CONSULTORIA_NUTRICIONAL' && 'Consultoria Nutricional Inicial'}
                    {apt.type === 'RETORNO' && 'Retorno Clínico'}
                    {apt.type === 'REAVALIACAO_NUTRICIONAL' && 'Reavaliação Nutricional'}
                    {apt.type === 'CONSULTA' && 'Consulta Clínica'}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                    v{apt.version}.0
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {new Date(apt.occurred_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="flex items-center font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <UserCheck className="w-3 h-3 mr-1" />
                    {apt.status === 'FINALIZADO' ? 'Finalizado & Assinado' : 'Rascunho'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 mb-3 leading-relaxed">
                {apt.notes}
              </p>

              {/* Anamnese Específica */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/80 p-3 rounded-lg border border-slate-200/60 text-xs mb-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Apetite:</span>
                  <span className="font-medium text-slate-700">{apt.anamnesis.reported_appetite}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Consistência Fecal:</span>
                  <span className="font-medium text-slate-700">{apt.anamnesis.stool_consistency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Hidratação/Água:</span>
                  <span className="font-medium text-slate-700">{apt.anamnesis.water_intake}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Emeses/Semana:</span>
                  <span className="font-medium text-slate-700">{apt.anamnesis.vomiting_episodes_per_week}</span>
                </div>
              </div>

              {apt.diet_recommendation && (
                <div className="text-xs bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5 text-emerald-900">
                  <span className="font-semibold text-emerald-800">Conduta Nutricional: </span>
                  {apt.diet_recommendation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
