import React from "react";
import { NutritionPlan } from "@/types";
import { Utensils, ShieldAlert, Sparkles, Droplets, CheckCircle, Clock } from "lucide-react";

interface DietPlanViewerProps {
  plan: NutritionPlan;
}

export function DietPlanViewer({ plan }: DietPlanViewerProps) {
  const totalGrams = plan.items.reduce((acc, item) => acc + item.quantity_grams, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-800 text-lg">{plan.title}</h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Plano Ativo (v{plan.version}.0)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Modalidade: {plan.feeding_type === 'NATURAL_COOKED' ? 'Alimentação Natural Cozida' : 'Comercial Coadjuvante'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-medium">
            {plan.meals_per_day} refeições ao dia
          </span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg font-bold">
            {plan.daily_energy_kcal} kcal/dia
          </span>
        </div>
      </div>

      {/* Resumo de Porção Diária */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <span className="text-xs text-slate-500 block mb-1">Volume Diário Total</span>
          <span className="text-xl font-bold text-slate-800">{totalGrams} g/dia</span>
          <p className="text-[11px] text-slate-400 mt-0.5">~{Math.round(totalGrams / plan.meals_per_day)}g por refeição</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <span className="text-xs text-slate-500 block mb-1">Meta Hídrica Diária</span>
          <span className="text-xl font-bold text-cyan-700">{plan.hydration_target_ml_day} mL/dia</span>
          <p className="text-[11px] text-slate-400 mt-0.5">Água fresca à vontade</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <span className="text-xs text-slate-500 block mb-1">Transição Gradual</span>
          <span className="text-xl font-bold text-amber-700">{plan.transition_plan_days || 7} dias</span>
          <p className="text-[11px] text-slate-400 mt-0.5">Adaptação do microbioma intestinal</p>
        </div>
      </div>

      {/* Tabela de Ingredientes Pesados */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Composição da Dieta Diária (Peso Cozido)
        </h4>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">Alimento / Ingrediente</th>
                <th className="px-4 py-3 font-semibold text-right">Quantidade</th>
                <th className="px-4 py-3 font-semibold">Função / Observação Nutricional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {plan.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.ingredient_name}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">{item.quantity_grams} g</td>
                  <td className="px-4 py-3 text-slate-500">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suplementação e Nutracêuticos */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
          Suplementação e Balanceamento Obrigatório
        </h4>
        <ul className="space-y-1.5 text-xs text-amber-950">
          {plan.supplements.map((sup, idx) => (
            <li key={idx} className="flex items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2 shrink-0" />
              <span>{sup}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-amber-800/80 mt-3 pt-2 border-t border-amber-200/60">
          {plan.notes}
        </p>
      </div>
    </div>
  );
}
