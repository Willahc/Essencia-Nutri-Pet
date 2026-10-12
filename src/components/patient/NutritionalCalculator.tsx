"use client";

import React, { useState } from "react";
import { Patient, BodyConditionScore } from "@/types";
import { calculateEnergyRequirements, PhysiologicalState, getBCSDescription } from "@/lib/nutrition-calc";
import { Calculator, Flame, Droplets, Target, Info, Sparkles } from "lucide-react";

interface NutritionalCalculatorProps {
  patient: Patient;
}

export function NutritionalCalculator({ patient }: NutritionalCalculatorProps) {
  const [weight, setWeight] = useState<number>(patient.current_weight_kg);
  const [bcs, setBcs] = useState<BodyConditionScore>(patient.current_bcs);
  const [idealWeight, setIdealWeight] = useState<number>(patient.ideal_weight_kg);
  const [physioState, setPhysioState] = useState<PhysiologicalState>("WEIGHT_LOSS");

  const results = calculateEnergyRequirements({
    species: patient.species,
    weightKg: weight,
    bcs: bcs,
    state: physioState,
    customIdealWeightKg: idealWeight,
  });

  const bcsDetails = getBCSDescription(bcs);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">Calculadora de Requerimentos</h3>
            <p className="text-[11px] sm:text-xs text-slate-500">Diretrizes NRC 2006 & WSAVA • Cálculo Energético e Hídrico</p>
          </div>
        </div>
        <span className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Zootecnia Clínica
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Parâmetros de Entrada */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Peso Atual do Animal (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Escore de Condição Corporal (ECC 1 a 9)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="9"
                step="1"
                value={bcs}
                onChange={(e) => setBcs(Number(e.target.value) as BodyConditionScore)}
                className="w-full accent-emerald-600"
              />
              <span className="font-bold text-slate-800 w-8 text-center text-sm">{bcs}/9</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{bcsDetails.label}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Peso Meta / Ideal (kg)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.1"
                value={idealWeight}
                onChange={(e) => setIdealWeight(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
              />
              <button
                type="button"
                onClick={() => setIdealWeight(results.ideal_weight_estimate_kg)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
                title="Preencher com a estimativa baseada no ECC"
              >
                Auto ({results.ideal_weight_estimate_kg} kg)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Estado Fisiológico / Objetivo Nutricional
            </label>
            <select
              value={physioState}
              onChange={(e) => setPhysioState(e.target.value as PhysiologicalState)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
            >
              <option value="WEIGHT_LOSS">Perda de Peso Controlada (1.0 x RER no peso ideal)</option>
              <option value="NEUTERED_ADULT">Adulto Castrado / Manutenção (1.4 x RER)</option>
              <option value="INTACT_ADULT">Adulto Inteiro / Manutenção (1.8 x RER)</option>
              <option value="SENIOR">Geriátrico / Idoso (1.4 x RER)</option>
              <option value="GROWTH_YOUNG">Filhote em Crescimento Rápido (3.0 x RER)</option>
              <option value="GROWTH_OLDER">Filhote em Crescimento Tardio (2.0 x RER)</option>
              <option value="ACTIVE_WORK">Atividade Intensa / Trabalho (2.5 x RER)</option>
            </select>
          </div>
        </div>

        {/* Resultados Calculados */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-6 text-white flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-700/60 mb-4 sm:mb-5">
              <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Metabolismo Calculado</span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                Fator: {results.factor_used}x RER
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
                <div className="flex items-center text-slate-400 text-xs mb-1">
                  <Flame className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  RER / NEB Basal
                </div>
                <div className="text-2xl font-bold text-white">
                  {results.rer_kcal_day} <span className="text-xs font-normal text-slate-400">kcal/dia</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Gasto energético de repouso</p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-emerald-500/30">
                <div className="flex items-center text-emerald-400 text-xs mb-1">
                  <Target className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  MER / NEM Alvo
                </div>
                <div className="text-2xl font-bold text-emerald-300">
                  {results.mer_kcal_day} <span className="text-xs font-normal text-emerald-400/80">kcal/dia</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Calorias prescritas na dieta</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <span className="flex items-center text-slate-300">
                  <Droplets className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                  Meta de Hidratação Diária:
                </span>
                <span className="font-semibold text-white">{results.hydration_ml_day} mL/dia</span>
              </div>

              {results.target_daily_loss_grams && (
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <span className="flex items-center text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    Taxa Segura de Perda de Peso:
                  </span>
                  <span className="font-semibold text-emerald-300">
                    {results.target_daily_loss_grams.min}g a {results.target_daily_loss_grams.max}g / dia
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-start space-x-2 text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              O cálculo de perda de peso utiliza o RER baseado no peso meta ({idealWeight} kg), garantindo que a restrição calórica não agrida o metabolismo e preserve massa magra.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
