"use client";

import React, { useState } from "react";
import { Patient, NutritionPlan, BodyConditionScore, Species } from "@/types";
import {
  BCS_9_POINT_DEFINITIONS,
  calculateBcsHealthProjection,
  BcsPointDefinition,
  BcsHealthProjectionResult,
} from "@/lib/body-condition";
import {
  Scale,
  Activity,
  Heart,
  Shield,
  Sparkles,
  Info,
  Calendar,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Eye,
  HandMetal,
  Clock
} from "lucide-react";

interface BodyConditionTrackerProps {
  patient: Patient;
  plan?: NutritionPlan;
  variant?: "CLINICAL" | "TUTOR";
}

export function BodyConditionTracker({
  patient,
  plan,
  variant = "CLINICAL",
}: BodyConditionTrackerProps) {
  const [selectedScore, setSelectedScore] = useState<BodyConditionScore>(
    (patient.current_bcs || 5) as BodyConditionScore
  );
  const [projectionWeeks, setProjectionWeeks] = useState<number>(4); // default 4 semanas / 1 mês

  const species = patient.species;
  const currentBcs = (patient.current_bcs || 5) as BodyConditionScore;
  const activeDef = BCS_9_POINT_DEFINITIONS[selectedScore] || BCS_9_POINT_DEFINITIONS[5];
  const currentDef = BCS_9_POINT_DEFINITIONS[currentBcs] || BCS_9_POINT_DEFINITIONS[5];

  // Projeção calculada
  const projection: BcsHealthProjectionResult = calculateBcsHealthProjection(
    patient,
    plan,
    projectionWeeks
  );

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. CABEÇALHO DO GUIA DE ECC */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
              <Scale className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
              Escore de Condição Corporal (ECC 1 a 9) & Projeção de Saúde
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Avaliação visual e palpatória padrão-ouro da <strong>WSAVA (Laflamme, 1997)</strong> com projeção de desenvolvimento clínico para o(a) <strong>{patient.name}</strong>.
          </p>
        </div>

        {/* Badge do Status Atual do Pet */}
        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/80 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shrink-0 self-start md:self-auto">
          <div className="text-left md:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Escore Atual Avaliado:
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900">
              ECC {currentBcs}/9 • {currentDef.category}
            </span>
          </div>
          <span
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm text-white shrink-0 ${
              currentBcs <= 3
                ? "bg-purple-600"
                : currentBcs <= 5
                ? "bg-emerald-600"
                : currentBcs <= 7
                ? "bg-amber-600"
                : "bg-rose-600"
            }`}
          >
            {currentBcs}
          </span>
        </div>
      </div>

      {/* 2. RÉGUA GRÁFICA INTERATIVA DE 9 PONTOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Escala Morfológica WSAVA (Clique para auditar):</span>
          <span className="text-emerald-700 font-extrabold text-[11px] hidden sm:block">
            ★ Meta Fisiológica: ECC 4 a 5 (Peso Ideal)
          </span>
        </div>

        {/* Grid dos 9 Pontos */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 sm:gap-2">
          {([1, 2, 3, 4, 5, 6, 7, 8, 9] as BodyConditionScore[]).map((score) => {
            const def = BCS_9_POINT_DEFINITIONS[score];
            const isCurrent = score === currentBcs;
            const isTarget = score === 5;
            const isSelected = score === selectedScore;

            let bgColor = "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200";
            if (score <= 3) {
              bgColor = isSelected
                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                : "bg-purple-50 text-purple-900 hover:bg-purple-100 border-purple-200";
            } else if (score <= 5) {
              bgColor = isSelected
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border-emerald-200";
            } else if (score <= 7) {
              bgColor = isSelected
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200";
            } else {
              bgColor = isSelected
                ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                : "bg-rose-50 text-rose-900 hover:bg-rose-100 border-rose-200";
            }

            return (
              <button
                key={score}
                type="button"
                onClick={() => setSelectedScore(score)}
                className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border text-center transition-all relative flex flex-col items-center justify-between min-h-[84px] sm:min-h-[96px] ${bgColor} ${
                  isSelected ? "ring-2 ring-offset-2 ring-slate-900 font-bold" : ""
                }`}
              >
                {/* Badges de Destaque */}
                {isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-slate-900 text-white text-[8px] sm:text-[9px] font-black rounded-full uppercase tracking-wider whitespace-nowrap shadow-2xs">
                    Hoje
                  </span>
                )}
                {isTarget && !isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-emerald-700 text-white text-[8px] sm:text-[9px] font-black rounded-full uppercase tracking-wider whitespace-nowrap shadow-2xs">
                    Meta ★
                  </span>
                )}

                <span className="text-lg sm:text-xl font-black">{score}</span>
                <span className="text-[9px] sm:text-[10px] font-bold line-clamp-1 leading-tight mt-0.5">
                  {def.category}
                </span>
                <span className="text-[8px] sm:text-[9px] opacity-80 font-mono mt-0.5">
                  {def.weightPercentageOfIdeal}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Faixas Coloridas de Orientação */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-xs font-bold pt-1">
          <div className="p-1.5 sm:p-1 rounded-lg bg-purple-100 text-purple-800 border border-purple-200/60">
            ECC 1 a 3 • Abaixo do Peso (Magreza/Caquexia)
          </div>
          <div className="p-1.5 sm:p-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200/60">
            ECC 4 a 5 • Faixa Fisiológica Ideal (Longevidade)
          </div>
          <div className="p-1.5 sm:p-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200/60">
            ECC 6 a 9 • Sobrepeso e Obesidade Clínica
          </div>
        </div>
      </div>


      {/* 3. CARD DE AUDITORIA ANATÔMICA DO SCORE SELECIONADO (O QUE VER & O QUE SENTIR) */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/70 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-base font-black text-slate-900">
              Detalhamento Anatômico: ECC {selectedScore}/9 — {activeDef.category}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              (~{activeDef.fatPercentageEstimate} de gordura corporal)
            </span>
          </div>

          <span className="text-[11px] font-bold text-slate-600 bg-white px-3 py-1 rounded-xl border border-slate-200">
            Fator Peso Ideal: <strong>{activeDef.idealFactorMultiplier}x</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* O que ver (Inspeção Visual) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>O que observar (Inspeção Visual Lateral & Superior):</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeDef.visualInspection}
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <strong>Silhueta da Espécie ({species === "CANINE" ? "Cão" : "Gato"}):</strong>{" "}
              {species === "CANINE" ? activeDef.canineSilhouetteDescription : activeDef.felineSilhouetteDescription}
            </div>
          </div>

          {/* O que sentir (Palpação) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <HandMetal className="w-4 h-4 text-purple-600" />
              <span>O que sentir ao toque (Teste Palpatório das Costelas):</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeDef.palpationTest}
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center space-x-1.5">
              <span className="font-semibold text-purple-700">Dica Prática:</span>
              <span>Passe a mão espalmada sem pressionar; compare com o dorso dos dedos da mão oposta.</span>
            </div>
          </div>
        </div>

        {/* Nota Zootécnica & Clínica */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 flex items-start space-x-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold mb-0.5 text-amber-900">
              Conduta Clínica & Zootécnica Recomendada para o ECC {selectedScore}:
            </strong>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              {activeDef.technicalNote}
            </p>
          </div>
        </div>

        {/* Alerta de Bolsa Primordial para Felinos */}
        {species === "FELINE" && (
          <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 text-xs text-purple-950 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5 text-purple-900">
                Particularidade Felina: A Bolsa Primordial (*Primordial Pouch*):
              </strong>
              <p className="text-[11px] leading-relaxed text-purple-900/90">
                Gatos apresentam uma bolsa fisiológica de pele e gordura na região inguinal ventral que serve para proteção e flexibilidade biomecânica. <strong>Ela NÃO é sinônimo de obesidade por si só!</strong> A avaliação felina foca estritamente na palpação dos arcos costais e no afunilamento da cintura visto de cima.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. PROJEÇÃO DE SAÚDE & METAS: "SE VOCÊ SEGUIR ESTE PLANO EM X TEMPO..." */}
      <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white border-2 border-emerald-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-200/60 pb-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-emerald-600" />
              Simulador Prognóstico • Projeção de Saúde & Desenvolvimento
            </span>
            <h4 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              Se você seguir este plano nutricional, em quanto tempo o pet atinge a meta?
            </h4>
          </div>

          {/* Seletor de Período da Projeção */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-emerald-200 text-xs font-bold shadow-2xs overflow-x-auto scrollbar-none w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setProjectionWeeks(4)}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-xl transition-all whitespace-nowrap min-h-[36px] ${
                projectionWeeks === 4
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="inline sm:hidden">4 Semanas</span>
              <span className="hidden sm:inline">1 Mês (4 Semanas)</span>
            </button>
            <button
              type="button"
              onClick={() => setProjectionWeeks(8)}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-xl transition-all whitespace-nowrap min-h-[36px] ${
                projectionWeeks === 8
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="inline sm:hidden">8 Semanas</span>
              <span className="hidden sm:inline">2 Meses (8 Semanas)</span>
            </button>
            <button
              type="button"
              onClick={() => setProjectionWeeks(12)}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-xl transition-all whitespace-nowrap min-h-[36px] ${
                projectionWeeks === 12
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="inline sm:hidden">12 Semanas</span>
              <span className="hidden sm:inline">3 Meses (12 Semanas)</span>
            </button>
          </div>

        </div>

        {/* COMPARAÇÃO LADO A LADO: HOJE VS NO PERÍODO PROJETADO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Card: Status Hoje */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Ponto de Partida (Hoje)
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-slate-900">{projection.currentWeightKg}</span>
              <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                ECC {projection.currentBcs}/9
              </span>
              <span className="text-xs font-semibold text-slate-600 truncate">
                {currentDef.category}
              </span>
            </div>
          </div>

          {/* Conector Central: Evolução com Seta */}
          <div className="text-center p-3 flex flex-col items-center justify-center space-y-2">
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
              Evolução em {projectionWeeks} semanas (~{Math.round(projectionWeeks / 4.3)} mês)
            </span>
            <div className="flex items-center space-x-2 text-emerald-600">
              {projection.weightDeltaKg < 0 ? (
                <TrendingDown className="w-6 h-6 animate-pulse" />
              ) : projection.weightDeltaKg > 0 ? (
                <TrendingUp className="w-6 h-6 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
              <span className="text-sm font-black">
                {projection.weightDeltaKg > 0
                  ? `+${projection.weightDeltaKg} kg`
                  : `${projection.weightDeltaKg} kg`}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Meta até peso ideal: {projection.percentageOfIdealTargetReached}% alcançado
            </span>
          </div>

          {/* Card: Status Projetado */}
          <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Status Projetado ({projectionWeeks} sem.)
              </span>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-md">
                Meta do Plano
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-emerald-700">{projection.projectedWeightKg}</span>
              <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                ECC ~{projection.projectedBcs}/9
              </span>
              <span className="text-xs font-bold text-slate-800 truncate">
                {projection.projectedStatusCategory}
              </span>
            </div>
          </div>
        </div>

        {/* Resumo do Status de Saúde */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed">
            {projection.healthStatusSummary}
          </p>
        </div>

        {/* Alerta de Segurança Felina se houver */}
        {projection.hepaticLipidosisWarning && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed font-medium">
              {projection.hepaticLipidosisWarning}
            </p>
          </div>
        )}

        {/* 5. MARCOS BIOLÓGICOS E GANHOS DE SAÚDE PREVISTOS */}
        <div className="space-y-3">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
            Ganhos Biológicos & Clínicos Conquistados com a Disciplina do Plano:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projection.milestones.map((m, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start space-x-3"
              >
                <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-800 shrink-0 mt-0.5">
                  {m.impactCategory === "ARTICULAR" && <Activity className="w-4 h-4" />}
                  {m.impactCategory === "METABOLIC" && <Scale className="w-4 h-4" />}
                  {m.impactCategory === "CARDIOVASCULAR" && <Heart className="w-4 h-4" />}
                  {m.impactCategory === "LONGEVITY" && <Sparkles className="w-4 h-4" />}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{m.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{m.timeframe}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloco de Ouro: Estudo de Longevidade de Kealy et al. */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-xs text-purple-950 flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block text-xs font-extrabold text-purple-900">
              Impacto Direto na Expectativa de Vida (+1.8 Anos):
            </strong>
            <p className="text-[11px] text-purple-900/90 leading-relaxed italic">
              "{projection.longevityBonusQuote}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
