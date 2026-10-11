"use client";

import React, { useState, useEffect } from "react";
import { NutritionPlan, NutritionPlanItem, Patient, Tutor, FeedingType, Species } from "@/types";
import { 
  Utensils, 
  Sparkles, 
  Droplets, 
  CheckCircle, 
  Clock, 
  Edit3, 
  Printer, 
  Share2, 
  Plus, 
  Trash2, 
  Scale, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  Copy, 
  RefreshCw,
  Flame,
  PieChart
} from "lucide-react";
import { 
  INGREDIENT_DATABASE, 
  calculateDietSummary, 
  calculateItemNutrition,
  generateDietPreset, 
  generateWhatsAppDietMessage, 
  generatePrintableRecipeCardHtml,
  IngredientDefinition
} from "@/lib/diet-formulation";

interface DietPlanViewerProps {
  plan: NutritionPlan;
  patient?: Patient;
  tutor?: Tutor;
  onSavePlan?: (newPlan: NutritionPlan) => void;
}

export function DietPlanViewer({ plan, patient, tutor, onSavePlan }: DietPlanViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  // Estados do formulador
  const [currentPlan, setCurrentPlan] = useState<NutritionPlan>(plan);
  const [title, setTitle] = useState(plan.title);
  const [feedingType, setFeedingType] = useState<FeedingType>(plan.feeding_type);
  const [dailyKcal, setDailyKcal] = useState<number>(plan.daily_energy_kcal);
  const [mealsPerDay, setMealsPerDay] = useState<number>(plan.meals_per_day);
  const [hydrationTarget, setHydrationTarget] = useState<number>(plan.hydration_target_ml_day);
  const [transitionDays, setTransitionDays] = useState<number>(plan.transition_plan_days || 7);
  const [notes, setNotes] = useState<string>(plan.notes || "");
  const [items, setItems] = useState<NutritionPlanItem[]>(plan.items);
  const [supplements, setSupplements] = useState<string[]>(plan.supplements);

  // Novo item a ser adicionado
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [customIngredientName, setCustomIngredientName] = useState<string>("");
  const [newIngredientGrams, setNewIngredientGrams] = useState<number>(50);
  const [newSupplementText, setNewSupplementText] = useState<string>("");

  // Sincroniza quando o plano de entrada mudar
  useEffect(() => {
    setCurrentPlan(plan);
    setTitle(plan.title);
    setFeedingType(plan.feeding_type);
    setDailyKcal(plan.daily_energy_kcal);
    setMealsPerDay(plan.meals_per_day);
    setHydrationTarget(plan.hydration_target_ml_day);
    setTransitionDays(plan.transition_plan_days || 7);
    setNotes(plan.notes || "");
    setItems(plan.items);
    setSupplements(plan.supplements);
    setIsEditing(false);
  }, [plan]);

  const activeSpecies: Species = patient?.species || 'CANINE';
  const activeWeight: number = patient?.current_weight_kg || 10;
  const isRenalPatient = patient?.comorbidities?.some(c => c.toLowerCase().includes("renal") || c.toLowerCase().includes("iris")) || false;

  // Sumário calculado em tempo real
  const summary = calculateDietSummary({
    items: isEditing ? items : currentPlan.items,
    mealsPerDay: isEditing ? mealsPerDay : currentPlan.meals_per_day,
    species: activeSpecies,
    weightKg: activeWeight,
    isRenalPatient,
  });

  const handleCopyWhatsApp = () => {
    if (!patient || !tutor) {
      navigator.clipboard.writeText(`Cardápio Essência Nutri Pet - ${currentPlan.title}\nTotal: ${summary.totalGrams}g/dia divididos em ${currentPlan.meals_per_day} refeições.`);
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 3000);
      return;
    }

    const msg = generateWhatsAppDietMessage({
      plan: currentPlan,
      patient,
      tutor,
    });
    navigator.clipboard.writeText(msg);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 3000);
  };

  const handleOpenPrintableCard = () => {
    const defaultPatient: Patient = patient || {
      id: "pat-temp",
      tutor_id: "tut-temp",
      name: "Paciente",
      species: activeSpecies,
      breed: "S.R.D.",
      birth_date: "2020-01-01",
      sex: "FEMALE",
      is_neutered: true,
      ideal_weight_kg: activeWeight,
      current_weight_kg: activeWeight,
      current_bcs: 5,
      avatar_url: activeSpecies === 'CANINE' ? "🐕" : "🐈",
      comorbidities: [],
      allergies: [],
      created_at: new Date().toISOString(),
    };

    const defaultTutor: Tutor = tutor || {
      id: "tut-temp",
      name: "Tutor Responsável",
      email: "tutor@exemplo.com",
      phone: "(11) 99999-9999",
      created_at: new Date().toISOString(),
    };

    const html = generatePrintableRecipeCardHtml({
      plan: currentPlan,
      patient: defaultPatient,
      tutor: defaultTutor,
    });

    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
    }
  };

  const handleApplyPreset = (condition: 'MAINTENANCE' | 'WEIGHT_LOSS' | 'RENAL_SUPPORT') => {
    const preset = generateDietPreset({
      species: activeSpecies,
      weightKg: activeWeight,
      merKcal: dailyKcal,
      feedingType,
      clinicalCondition: condition,
    });

    setTitle(preset.title);
    setItems(preset.items);
    setSupplements(preset.supplements);
    setMealsPerDay(preset.mealsPerDay);
    setHydrationTarget(preset.hydrationTargetMl);
    setTransitionDays(preset.transitionDays);
    setNotes(preset.notes);
  };

  const handleUpdateItemGrams = (index: number, newGrams: number) => {
    const clamped = Math.max(1, newGrams);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity_grams: clamped };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddIngredient = () => {
    if (!selectedIngredientId && !customIngredientName) return;

    if (selectedIngredientId) {
      const ing = INGREDIENT_DATABASE.find((i) => i.id === selectedIngredientId);
      if (ing) {
        setItems((prev) => [
          ...prev,
          {
            ingredient_name: ing.name,
            quantity_grams: newIngredientGrams,
            category: ing.category,
            kcal_per_100g: ing.kcal_per_100g,
            notes: ing.default_note,
          },
        ]);
      }
    } else if (customIngredientName) {
      setItems((prev) => [
        ...prev,
        {
          ingredient_name: customIngredientName,
          quantity_grams: newIngredientGrams,
          notes: "Ingrediente customizado pelo prescritor",
        },
      ]);
    }

    setSelectedIngredientId("");
    setCustomIngredientName("");
    setNewIngredientGrams(50);
  };

  const handleAddSupplement = () => {
    if (!newSupplementText.trim()) return;
    setSupplements((prev) => [...prev, newSupplementText.trim()]);
    setNewSupplementText("");
  };

  const handleRemoveSupplement = (index: number) => {
    setSupplements((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAutoBalanceCalories = () => {
    if (summary.totalKcal <= 0 || items.length === 0) return;
    const ratio = dailyKcal / summary.totalKcal;
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        quantity_grams: Math.max(1, Math.round(item.quantity_grams * ratio)),
      }))
    );
  };

  const handleSaveFormulation = () => {
    const updated: NutritionPlan = {
      ...currentPlan,
      version: currentPlan.version + 1,
      title,
      feeding_type: feedingType,
      daily_energy_kcal: dailyKcal,
      meals_per_day: mealsPerDay,
      hydration_target_ml_day: hydrationTarget,
      transition_plan_days: transitionDays,
      notes,
      items,
      supplements,
      approved_at: new Date().toISOString(),
    };

    setCurrentPlan(updated);
    setIsEditing(false);
    if (onSavePlan) {
      onSavePlan(updated);
    }
  };

  const availableIngredients = INGREDIENT_DATABASE.filter((i) =>
    i.species.includes(activeSpecies)
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
      {/* CABEÇALHO DO PLANO */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl">
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-b-2 border-emerald-500 bg-transparent font-extrabold text-slate-800 focus:outline-none px-1"
                  />
                ) : (
                  currentPlan.title
                )}
              </h3>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                v{currentPlan.version}.0 Ativo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Modalidade:{" "}
              <strong className="text-slate-700">
                {currentPlan.feeding_type === "NATURAL_COOKED"
                  ? "Alimentação Natural Cozida"
                  : currentPlan.feeding_type === "MIXED_FEEDING"
                  ? "Dieta Mista (Ração + Natural)"
                  : "Ração Comercial Coadjuvante"}
              </strong>{" "}
              • Paciente: <strong className="text-emerald-700">{patient?.name || "Paciente"}</strong> ({activeSpecies === 'CANINE' ? 'Canino' : 'Felino'}, {activeWeight} kg)
            </p>
          </div>
        </div>

        {/* Ações Rápidas de Compartilhamento & Edição */}
        <div className="flex flex-wrap items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleCopyWhatsApp}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs"
                title="Copiar mensagem formatada para WhatsApp"
              >
                {copiedWhatsapp ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenPrintableCard}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs"
                title="Imprimir cartão da receita nutricional"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Cartão Receita</span>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Formular / Editar</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setItems(currentPlan.items);
                  setSupplements(currentPlan.supplements);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFormulation}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Salvar e Ativar (v{currentPlan.version + 1}.0)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PAINEL DE CONTROLE DO FORMULADOR (QUANDO EM EDIÇÃO) */}
      {isEditing && (
        <div className="mb-8 p-5 bg-gradient-to-r from-emerald-50/60 to-teal-50/40 border border-emerald-200/80 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 pb-3 border-b border-emerald-200/60">
            <div>
              <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Prescritor Zootécnico Human-in-the-Loop
              </span>
              <p className="text-xs text-emerald-800/80 mt-0.5">
                Escolha a modalidade dietética, selecione presets ou refine as gramaturas na balança.
              </p>
            </div>

            {/* Presets Rápidos */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Presets:</span>
              <button
                onClick={() => handleApplyPreset("MAINTENANCE")}
                className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold transition-all shadow-2xs"
              >
                Manutenção
              </button>
              <button
                onClick={() => handleApplyPreset("WEIGHT_LOSS")}
                className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-xs font-bold transition-all shadow-2xs"
              >
                Saciedade
              </button>
              <button
                onClick={() => handleApplyPreset("RENAL_SUPPORT")}
                className="px-2.5 py-1 bg-white hover:bg-cyan-100 border border-cyan-300 text-cyan-800 rounded-lg text-xs font-bold transition-all shadow-2xs"
              >
                Suporte Renal
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Modalidade Dietética
              </label>
              <select
                value={feedingType}
                onChange={(e) => setFeedingType(e.target.value as FeedingType)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="NATURAL_COOKED">Alimentação Natural Cozida</option>
                <option value="MIXED_FEEDING">Dieta Mista (50% Ração + 50% AN)</option>
                <option value="COMMERCIAL_DRY">Ração Comercial Seca</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Meta Calórica Diária (MER)
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  step="10"
                  value={dailyKcal}
                  onChange={(e) => setDailyKcal(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-500">kcal</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Refeições ao Dia
              </label>
              <select
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(Number(e.target.value) || 2)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={1}>1 refeição ao dia</option>
                <option value={2}>2 refeições ao dia (padrão)</option>
                <option value={3}>3 refeições ao dia</option>
                <option value={4}>4 refeições ao dia</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Meta Hídrica (mL/dia)
              </label>
              <input
                type="number"
                step="20"
                value={hydrationTarget}
                onChange={(e) => setHydrationTarget(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* CARDS RESUMO DE ENERGIA E PORÇÃO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 block mb-1">Volume Diário</span>
          <span className="text-xl sm:text-2xl font-black text-slate-800">{summary.totalGrams} g</span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            ~<strong>{summary.gramsPerMeal}g</strong> por refeição ({isEditing ? mealsPerDay : currentPlan.meals_per_day}x/dia)
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 block mb-1">Energia Formulada</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-700">{summary.totalKcal}</span>
            <span className="text-xs text-slate-500 font-semibold">/ {isEditing ? dailyKcal : currentPlan.daily_energy_kcal} kcal</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                Math.abs(summary.totalKcal - (isEditing ? dailyKcal : currentPlan.daily_energy_kcal)) < 20 
                  ? "bg-emerald-500" 
                  : summary.totalKcal > (isEditing ? dailyKcal : currentPlan.daily_energy_kcal)
                  ? "bg-amber-500"
                  : "bg-cyan-500"
              }`}
              style={{
                width: `${Math.min(100, Math.round((summary.totalKcal / (isEditing ? dailyKcal : currentPlan.daily_energy_kcal || 1)) * 100))}%`
              }}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 block mb-1">Meta Hídrica</span>
          <span className="text-xl sm:text-2xl font-black text-cyan-700">
            {isEditing ? hydrationTarget : currentPlan.hydration_target_ml_day} mL
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">Água fresca e filtrada</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs text-slate-500 block mb-1">Balanço Ca : P</span>
          <span className="text-xl sm:text-2xl font-black text-amber-700">{summary.estimatedCaPRatio}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Alvo NRC: <strong>1.2 : 1</strong>
          </p>
        </div>
      </div>

      {/* DIVISÃO DE MACRONUTRIENTES */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Distribuição Energética dos Macronutrientes (% das Calorias)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Prot: {summary.proteinGrams}g • Gord: {summary.fatGrams}g • Carb: {summary.carbGrams}g
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
          <div
            className="bg-emerald-600 h-full transition-all"
            style={{ width: `${summary.proteinPercentEnergy}%` }}
            title={`Proteína: ${summary.proteinPercentEnergy}%`}
          />
          <div
            className="bg-amber-500 h-full transition-all"
            style={{ width: `${summary.fatPercentEnergy}%` }}
            title={`Gordura: ${summary.fatPercentEnergy}%`}
          />
          <div
            className="bg-blue-500 h-full transition-all"
            style={{ width: `${summary.carbPercentEnergy}%` }}
            title={`Carboidrato: ${summary.carbPercentEnergy}%`}
          />
        </div>

        <div className="flex items-center justify-between text-xs mt-2 text-slate-600 font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Proteína ({summary.proteinPercentEnergy}%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Gordura ({summary.fatPercentEnergy}%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Carboidratos ({summary.carbPercentEnergy}%)</span>
          </div>
        </div>
      </div>

      {/* TABELA DE INGREDIENTES E PESOS */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <Scale className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Composição da Dieta Diária (Peso Cozido e Escorrido)
          </h4>

          {isEditing && (
            <button
              type="button"
              onClick={handleAutoBalanceCalories}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center space-x-1 transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Ajustar Gramaturas para Bater Meta ({dailyKcal} kcal)</span>
            </button>
          )}
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">Alimento / Ingrediente</th>
                <th className="px-4 py-3 font-semibold text-center">Quantidade</th>
                <th className="px-4 py-3 font-semibold text-right">Kcal Estimada</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Função / Observação Nutricional</th>
                {isEditing && <th className="px-4 py-3 font-semibold text-center">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(isEditing ? items : currentPlan.items).map((item, idx) => {
                const nut = calculateItemNutrition(item);
                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>
                        <span className="font-bold text-slate-800">{item.ingredient_name}</span>
                        {item.category && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-100 text-slate-600">
                            {item.category === "PROTEIN" ? "Proteína" : item.category === "CARBOHYDRATE" ? "Carboidrato" : item.category === "VEGETABLE" ? "Vegetal" : item.category === "ORGAN" ? "Víscera" : item.category === "FAT" ? "Gordura" : "Ração"}
                          </span>
                        )}
                        <span className="block md:hidden text-[10px] text-slate-400 mt-0.5">{item.notes}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemGrams(idx, item.quantity_grams - 10)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            step="5"
                            value={item.quantity_grams}
                            onChange={(e) => handleUpdateItemGrams(idx, Number(e.target.value) || 0)}
                            className="w-14 px-1.5 py-1 text-center font-bold text-slate-900 border border-slate-300 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateItemGrams(idx, item.quantity_grams + 10)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                          <span className="text-[11px] font-semibold text-slate-500">g</span>
                        </div>
                      ) : (
                        <span className="font-extrabold text-slate-900 text-sm">{item.quantity_grams} g</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-slate-700">
                      {nut.kcal} kcal
                    </td>

                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                      {item.notes}
                    </td>

                    {isEditing && (
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Remover este ingrediente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Adicionar Novo Ingrediente (Em Modo Edição) */}
        {isEditing && (
          <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Selecionar do Catálogo Nutricional
              </label>
              <select
                value={selectedIngredientId}
                onChange={(e) => {
                  setSelectedIngredientId(e.target.value);
                  setCustomIngredientName("");
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="">-- Escolha um ingrediente cadastrado --</option>
                {availableIngredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.kcal_per_100g} kcal/100g)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Ou Digitar Outro Ingrediente
              </label>
              <input
                type="text"
                placeholder="Ex: Mandioquinha cozida, Filé de salmão..."
                value={customIngredientName}
                onChange={(e) => {
                  setCustomIngredientName(e.target.value);
                  setSelectedIngredientId("");
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div className="w-24">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Gramas
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={newIngredientGrams}
                onChange={(e) => setNewIngredientGrams(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-center text-slate-800"
              />
            </div>

            <div className="flex items-end pt-5">
              <button
                type="button"
                onClick={handleAddIngredient}
                disabled={!selectedIngredientId && !customIngredientName}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SUPLEMENTAÇÃO & BALANCEAMENTO OBRIGATÓRIO */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center">
            <Sparkles className="w-4 h-4 mr-1.5 text-amber-600" />
            Suplementação e Balanceamento Obrigatório
          </h4>

          {/* Dicas Rápidas Calculadas */}
          <div className="flex items-center space-x-2 text-[11px] font-semibold text-amber-800">
            <span>Cálcio recomendado: ~<strong>{summary.recommendedCalciumCarbonateGrams}g</strong> Carbonato</span>
            <span>•</span>
            <span>Ômega 3: ~<strong>{summary.recommendedOmega3DoseMg}mg</strong> EPA/DHA</span>
          </div>
        </div>

        {summary.taurineRequired && (
          <div className="mb-3 px-3 py-2 bg-amber-100/80 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Atenção Felina:</strong> Taurina (500mg/dia) é obrigatória para prevenção de cardiomiopatia dilatada e degeneração retiniana em dietas caseiras.
            </span>
          </div>
        )}

        <ul className="space-y-2 text-xs text-amber-950 font-medium">
          {(isEditing ? supplements : currentPlan.supplements).map((sup, idx) => (
            <li key={idx} className="flex items-center justify-between bg-white/70 px-3 py-2 rounded-xl border border-amber-200/50">
              <div className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{sup}</span>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleRemoveSupplement(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>

        {isEditing && (
          <div className="mt-3 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Adicionar novo suplemento ou nutracêutico..."
              value={newSupplementText}
              onChange={(e) => setNewSupplementText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSupplement()}
              className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs text-amber-950"
            />
            <button
              type="button"
              onClick={handleAddSupplement}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Adicionar
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-amber-200/80 text-xs text-amber-900">
          <strong>Orientações de Administração:</strong>
          {isEditing ? (
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Orientações e cuidados para o tutor..."
              className="w-full mt-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800"
            />
          ) : (
            <p className="mt-1 text-slate-600">{currentPlan.notes || "Não adicionar temperos tóxicos (cebola/alho). Adicionar o suplemento na hora de servir o prato frio ou morno."}</p>
          )}
        </div>
      </div>

      {/* GUIA DE TRANSIÇÃO ALIMENTAR */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-4 h-4 text-slate-500" />
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Cronograma de Transição Alimentar ({isEditing ? transitionDays : currentPlan.transition_plan_days || 7} Dias)
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Dias 1 a 2</span>
            <p className="font-bold text-slate-800">25% Nova Dieta</p>
            <p className="text-[11px] text-slate-500">75% Dieta Antiga</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Dias 3 a 4</span>
            <p className="font-bold text-slate-800">50% Nova Dieta</p>
            <p className="text-[11px] text-slate-500">50% Dieta Antiga</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Dias 5 a 6</span>
            <p className="font-bold text-slate-800">75% Nova Dieta</p>
            <p className="text-[11px] text-slate-500">25% Dieta Antiga</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Dia 7 em diante</span>
            <p className="font-bold text-emerald-900">100% Nova Dieta</p>
            <p className="text-[11px] text-emerald-700">Microbioma Adaptado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
