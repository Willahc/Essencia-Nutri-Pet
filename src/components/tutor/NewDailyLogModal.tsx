"use client";

import React, { useState } from "react";
import { Patient, TutorDailyLog, StoolScore, AppetiteLevel } from "@/types";
import { STOOL_SCORE_DEFINITIONS, getTransitionStepInfo } from "@/lib/adherence";
import { X, CheckCircle, AlertTriangle, Sparkles, Droplets, Utensils, Heart } from "lucide-react";

interface NewDailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  transitionDaysTotal: number;
  currentDaySuggestion: number;
  onSaveLog: (log: TutorDailyLog) => void;
}

export function NewDailyLogModal({
  isOpen,
  onClose,
  patient,
  transitionDaysTotal,
  currentDaySuggestion,
  onSaveLog,
}: NewDailyLogModalProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [transitionDay, setTransitionDay] = useState<number>(currentDaySuggestion || 1);
  const [dietPercentage, setDietPercentage] = useState<number>(100);
  const [waterMl, setWaterMl] = useState<number>(Math.round(patient.current_weight_kg * 50));
  const [stoolScore, setStoolScore] = useState<StoolScore>(2);
  const [stoolNotes, setStoolNotes] = useState<string>("");
  const [appetite, setAppetite] = useState<AppetiteLevel>("NORMAL");
  const [vomitingEpisodes, setVomitingEpisodes] = useState<number>(0);
  const [supplementsTaken, setSupplementsTaken] = useState<boolean>(true);
  const [treatsGiven, setTreatsGiven] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");

  if (!isOpen) return null;

  const currentStep = getTransitionStepInfo(transitionDay, transitionDaysTotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: TutorDailyLog = {
      id: `log-${Date.now()}`,
      patient_id: patient.id,
      date,
      transition_day: transitionDay,
      diet_consumed_percentage: dietPercentage,
      water_intake_ml: waterMl,
      stool_score: stoolScore,
      stool_notes: stoolNotes.trim() || undefined,
      appetite,
      vomiting_episodes: vomitingEpisodes,
      supplements_taken: supplementsTaken,
      treats_given: treatsGiven,
      notes: notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    onSaveLog(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col my-auto">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg sm:text-xl shrink-0">
              📝
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold">Diário de Cuidado Diário</h3>
              <p className="text-[11px] sm:text-xs text-emerald-100 truncate">
                {patient.name} • {patient.species === "CANINE" ? "Canino" : "Felino"} ({patient.current_weight_kg} kg)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 text-xs text-slate-700 overflow-y-auto touch-scroll flex-1">

          {/* Data e Dia da Transição */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Data do Registro
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dia de Transição Alimentar
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={transitionDay}
                  onChange={(e) => setTransitionDay(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: transitionDaysTotal || 7 }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      Dia {idx + 1} de {transitionDaysTotal || 7}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 text-[11px] text-emerald-800 flex items-center justify-between">
              <span className="font-bold">{currentStep.phaseLabel}:</span>
              <span className="font-semibold text-slate-600">
                {currentStep.percentNewDiet}% Nova Dieta + {currentStep.percentOldDiet}% Dieta Anterior
              </span>
            </div>
          </div>

          {/* Escala Fecal Waltham / Bristol */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center">
                <span>Consistência das Fezes (Escala Waltham / Bristol)</span>
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Padrão Ouro: <strong>Grau 2</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as StoolScore[]).map((score) => {
                const def = STOOL_SCORE_DEFINITIONS[score];
                const isSelected = stoolScore === score;

                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setStoolScore(score)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/30"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    } ${score === 5 ? "col-span-2 sm:col-span-1" : ""}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{def.emoji}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${def.badgeClass}`}
                        >
                          Grau {score}
                        </span>
                      </div>
                      <strong className="block text-[11px] text-slate-900 leading-tight">
                        {def.shortLabel}
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Descrição do Grau Selecionado */}
            <p className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              💡 <strong>{STOOL_SCORE_DEFINITIONS[stoolScore].title}:</strong>{" "}
              {STOOL_SCORE_DEFINITIONS[stoolScore].description}
            </p>
          </div>

          {/* Apetite e Porção Consumida */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Apetite de Hoje
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "NORMAL", label: "Excelente / Normal", emoji: "😋" },
                  { id: "VORACIOUS", label: "Muito Voraz", emoji: "⚡" },
                  { id: "RELUCTANT", label: "Comeu Devagar", emoji: "😐" },
                  { id: "REFUSED", label: "Recusou Alimento", emoji: "🚫" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAppetite(item.id as AppetiteLevel)}
                    className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                      appetite === item.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Porção da Dieta Consumida
              </label>
              <div className="flex items-center space-x-1.5 mb-2">
                {[100, 75, 50, 25, 0].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDietPercentage(pct)}
                    className={`flex-1 py-2 rounded-xl border text-center font-bold text-xs transition-all ${
                      dietPercentage === pct
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                Se sobrar comida no prato, marque a porcentagem consumida.
              </p>
            </div>
          </div>

          {/* Ingestão Hídrica & Vômitos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                <Droplets className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                Água Ingerida Estimada (mL)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={waterMl}
                  onChange={(e) => setWaterMl(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setWaterMl((prev) => prev + 150)}
                  className="px-2.5 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-xl font-bold whitespace-nowrap"
                >
                  +150 mL
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Episódios de Vômito
              </label>
              <div className="flex items-center space-x-2">
                {[0, 1, 2].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setVomitingEpisodes(num)}
                    className={`flex-1 py-2 rounded-xl border font-bold transition-all ${
                      vomitingEpisodes === num
                        ? num === 0
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-rose-600 border-rose-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {num === 0 ? "Nenhum (0)" : `${num}x`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Suplementação e Petiscos Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={supplementsTaken}
                onChange={(e) => setSupplementsTaken(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <span className="font-semibold text-slate-800 text-xs">
                💊 Tomou os suplementos prescritos
              </span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={treatsGiven}
                onChange={(e) => setTreatsGiven(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <span className="font-semibold text-slate-800 text-xs">
                🦴 Ganhou petiscos fora da dieta
              </span>
            </label>
          </div>

          {/* Observações Livres */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Observações do Tutor / Como foi o dia?
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Comeu com muita vontade, lambeu o prato. Brincou bastante durante a tarde..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Salvar Registro de Hoje</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
