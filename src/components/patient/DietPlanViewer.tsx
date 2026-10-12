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
  PieChart,
  X,
  CheckCircle2,
  ShoppingBag,
  CalendarDays,
  ShieldAlert,
  Pill,
  Coins,
  TrendingDown,
  Wand2,
  FileSpreadsheet
} from "lucide-react";
import { 
  INGREDIENT_DATABASE, 
  calculateDietSummary, 
  calculateItemNutrition,
  generateDietPreset, 
  generateWhatsAppDietMessage, 
  generatePrintableRecipeCardHtml,
  IngredientDefinition,
  calculateBatchCookingPlan,
  BatchCookingPlan
} from "@/lib/diet-formulation";
import { auditDietSafety, DietSafetyAuditResult } from "@/lib/diet-safety-guardian";
import { autoFormulateDiet } from "@/lib/diet-auto-formulator";
import { 
  generateCompoundingPrescription, 
  generateCompoundingPrescriptionText, 
  CompoundingPrescription 
} from "@/lib/compounding-pharmacy";
import { calculateDietCostComparison, DietCostComparison } from "@/lib/diet-cost-estimator";
import { ExamDocument } from "@/types";

interface DietPlanViewerProps {
  plan: NutritionPlan;
  patient?: Patient;
  tutor?: Tutor;
  exams?: ExamDocument[];
  onSavePlan?: (newPlan: NutritionPlan) => void;
}

export function DietPlanViewer({ plan, patient, tutor, exams = [], onSavePlan }: DietPlanViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [isKitchenScaleOpen, setIsKitchenScaleOpen] = useState(false);
  const [isBatchCookingModalOpen, setIsBatchCookingModalOpen] = useState(false);
  const [isCompoundingModalOpen, setIsCompoundingModalOpen] = useState(false);
  const [isCostComparisonModalOpen, setIsCostComparisonModalOpen] = useState(false);
  const [autoFormulationNotice, setAutoFormulationNotice] = useState<string | null>(null);
  const [batchCookingDays, setBatchCookingDays] = useState<number>(7);
  const [kitchenScalePortion, setKitchenScalePortion] = useState<'MEAL' | 'DAILY'>('MEAL');
  const [completedIngredients, setCompletedIngredients] = useState<number[]>([]);

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

  // Auditoria do Guardião de Contraindicações e Alergênicos
  const safetyAudit: DietSafetyAuditResult = patient
    ? auditDietSafety({
        patient,
        items: isEditing ? items : currentPlan.items,
        summary,
        isRenalPatient,
      })
    : { isSafe: true, hasCriticalBlock: false, violations: [], safetyScore: 100 };

  // Planejador de Marmitas da Semana e Lista de Compras
  const batchPlan = calculateBatchCookingPlan({
    items: isEditing ? items : currentPlan.items,
    supplements: isEditing ? supplements : currentPlan.supplements,
    mealsPerDay: isEditing ? mealsPerDay : currentPlan.meals_per_day,
    days: batchCookingDays,
    recommendedCalciumCarbonateGrams: summary.recommendedCalciumCarbonateGrams,
    recommendedOmega3DoseMg: summary.recommendedOmega3DoseMg,
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

  const handleAutoFormulate = () => {
    if (!patient) return;
    const result = autoFormulateDiet(patient, exams, dailyKcal, mealsPerDay);
    setTitle(result.planDraft.title);
    setItems(result.planDraft.items);
    setSupplements(result.planDraft.supplements);
    setHydrationTarget(result.planDraft.hydration_target_ml_day);
    setNotes(result.planDraft.notes || "");
    setIsEditing(true);
    setAutoFormulationNotice(
      `✓ Dieta personalizada calculada pela IA para ${patient.name} (${result.clinicalRationale[0] || 'Equilíbrio zootécnico'})`
    );
    setTimeout(() => setAutoFormulationNotice(null), 10000);
  };

  const compoundingPrescription: CompoundingPrescription | null = patient
    ? generateCompoundingPrescription(patient, currentPlan, exams)
    : null;

  const costComparison: DietCostComparison = calculateDietCostComparison(
    isEditing ? { ...currentPlan, items } : currentPlan,
    activeSpecies
  );

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
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8">
      {/* CABEÇALHO DO PLANO */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-200">
        <div className="flex items-start space-x-3 sm:space-x-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="font-extrabold text-slate-800 text-base sm:text-xl">
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
              <span className="text-[10px] sm:text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                v{currentPlan.version}.0 Ativo
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
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
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none touch-scroll w-full lg:w-auto py-1">
          {!isEditing ? (
            <>
              <button
                onClick={handleCopyWhatsApp}
                className="px-3 sm:px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs shrink-0 min-h-[38px]"
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
                className="px-3 sm:px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs shrink-0 min-h-[38px]"
                title="Imprimir cartão da receita nutricional"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Cartão</span>
              </button>

              <button
                type="button"
                onClick={handleAutoFormulate}
                className="px-3 sm:px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 active:from-purple-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs shrink-0 min-h-[38px]"
                title="Auto-formular receita por IA considerando peso, ECC, comorbidades e laudos"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                <span>Auto-Formular IA</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCompoundingModalOpen(true)}
                className="px-3 sm:px-3.5 py-2 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs shrink-0 min-h-[38px]"
                title="Gerar receita magistral para farmácia de manipulação veterinária"
              >
                <Pill className="w-3.5 h-3.5 text-purple-600" />
                <span>Manipulada</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCostComparisonModalOpen(true)}
                className="px-3 sm:px-3.5 py-2 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs shrink-0 min-h-[38px]"
                title="Comparativo de custo financeiro mensal vs rações comerciais super premium"
              >
                <Coins className="w-3.5 h-3.5 text-teal-600" />
                <span>Custo vs Ração</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCompletedIngredients([]);
                  setIsKitchenScaleOpen(true);
                }}
                className="px-3 sm:px-3.5 py-2 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs shrink-0 min-h-[38px]"
                title="Abrir o assistente interativo de pesagem e tara da refeição"
              >
                <Scale className="w-3.5 h-3.5 text-amber-700" />
                <span>Modo Balança</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBatchCookingModalOpen(true)}
                className="px-3 sm:px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs shrink-0 min-h-[38px]"
                title="Planejar marmitas para 7 a 30 dias e gerar lista de compras com fatores de cocção"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Marmitas</span>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all shrink-0 min-h-[38px]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Cardápio</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2 shrink-0">
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

      {/* PAINEL DO GUARDIÃO DE CONTRAINDICAÇÕES E SEGURANÇA */}
      {safetyAudit.violations.length > 0 && (
        <div className={`mb-6 p-4 sm:p-5 rounded-2xl border transition-all ${
          safetyAudit.hasCriticalBlock
            ? 'bg-rose-50/90 border-rose-300 text-rose-950'
            : 'bg-amber-50/90 border-amber-300 text-amber-950'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-rose-200/60">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                safetyAudit.hasCriticalBlock
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}>
                {safetyAudit.hasCriticalBlock ? '🚨 Contraindicação Crítica' : '⚠️ Alerta de Segurança Zootécnica'}
              </span>
              <span className="text-xs font-bold text-slate-700">
                Guardião de Segurança Dietética
              </span>
            </div>

            <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
              safetyAudit.safetyScore >= 80 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
            }`}>
              Score de Segurança: {safetyAudit.safetyScore} / 100
            </span>
          </div>

          <div className="space-y-2.5 mt-3">
            {safetyAudit.violations.map((violation) => (
              <div key={violation.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-slate-900 flex items-center">
                    {violation.severity === 'CRITICAL' ? '⛔ ' : '⚠️ '}
                    {violation.title}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    violation.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {violation.severity === 'CRITICAL' ? 'Bloqueio Imediato' : 'Revisão Recomendada'}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{violation.message}</p>
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[11px] text-emerald-800 font-semibold flex items-center">
                  <span className="text-emerald-600 font-bold mr-1">Conduta Sugerida:</span> {violation.suggestedAction}
                </div>
              </div>
            ))}
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

      {/* PAINEL ZOOTÉCNICO: MATÉRIA SECA E DENSIDADE NUTRICIONAL (NRC 2006 / FEDIAF / IRIS) */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-6 border border-emerald-700/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-emerald-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Padrão Ouro Zootécnico • Base Matéria Seca (MS) e Densidade / 1000 kcal
              </h4>
              <p className="text-[11px] text-slate-300">
                Métricas oficiais de referência clínica conforme NRC (2006), FEDIAF e IRIS 2023
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700/60">
              MS Estimada: {summary.dryMatterPercent}% ({summary.dryMatterGrams}g MS/dia)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3.5">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-emerald-900/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Proteína Bruta</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-lg font-black text-emerald-300">{summary.proteinPercentDryMatter}%</span>
              <span className="text-[10px] text-slate-400 font-semibold">na MS</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">
              <strong>{summary.proteinGramsPer1000Kcal} g</strong> / 1000 kcal
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-emerald-900/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Extrato Etéreo (Gordura)</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-lg font-black text-amber-300">{summary.fatPercentDryMatter}%</span>
              <span className="text-[10px] text-slate-400 font-semibold">na MS</span>
            </div>
            <p className="text-[11px] text-amber-400 font-medium mt-1">
              <strong>{summary.fatGramsPer1000Kcal} g</strong> / 1000 kcal
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-emerald-900/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carboidratos (ENN)</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-lg font-black text-blue-300">{summary.carbPercentDryMatter}%</span>
              <span className="text-[10px] text-slate-400 font-semibold">na MS</span>
            </div>
            <p className="text-[11px] text-blue-400 font-medium mt-1">
              <strong>{summary.carbGramsPer1000Kcal} g</strong> / 1000 kcal
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-emerald-900/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fósforo & Cálcio</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xs font-bold text-slate-200">P: {summary.phosphorusGramsPer1000Kcal}g</span>
              <span className="text-[10px] text-slate-400">/ 1000 kcal</span>
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xs font-bold text-slate-200">Ca: {summary.calciumGramsPer1000Kcal}g</span>
              <span className="text-[10px] text-slate-400">/ 1000 kcal</span>
            </div>
            <span className="block text-[10px] text-emerald-300 font-bold mt-1">
              Relação Ca:P = {summary.estimatedCaPRatio}
            </span>
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

        <div className="border border-slate-200 rounded-2xl overflow-x-auto scrollbar-none touch-scroll shadow-2xs">
          <table className="w-full text-left text-xs min-w-[500px]">

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

      {/* MODAL: MODO BALANÇA DE COZINHA (AUXILIAR DE PREPARO E PESAGEM) */}
      {isKitchenScaleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Cabeçalho do Modo Balança */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Modo Balança de Cozinha</h3>
                  <p className="text-xs text-amber-100">
                    Guia interativo com função Tara para pesagem sequencial precisa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsKitchenScaleOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alternador de Porção (Por Refeição vs Diário) */}
            <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Fracionamento da Pesagem:
              </span>
              <div className="inline-flex bg-white p-1 rounded-xl border border-amber-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setKitchenScalePortion("MEAL");
                    setCompletedIngredients([]);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    kitchenScalePortion === "MEAL"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "text-amber-800 hover:bg-amber-50"
                  }`}
                >
                  1 Refeição Individual (~{summary.gramsPerMeal}g)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKitchenScalePortion("DAILY");
                    setCompletedIngredients([]);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    kitchenScalePortion === "DAILY"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "text-amber-800 hover:bg-amber-50"
                  }`}
                >
                  Lote Diário Total ({summary.totalGrams}g)
                </button>
              </div>
            </div>

            {/* Conteúdo com Barra de Rolagem */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Instruções de Tara */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 leading-relaxed flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Dica Zootécnica:</strong> Coloque a tigela vazia na balança e aperte <em>TARA / ZERO</em>. Adicione os alimentos sequencialmente conferindo o peso individual ou o peso acumulado na balança.
                </p>
              </div>

              {/* Lista Sequencial de Ingredientes */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Ingredientes (Pesados Cozidos e Escorridos)
                </h4>

                <div className="space-y-2.5">
                  {(isEditing ? items : currentPlan.items).map((item, idx) => {
                    const factor = kitchenScalePortion === "MEAL" ? (1 / (isEditing ? mealsPerDay : currentPlan.meals_per_day)) : 1;
                    const itemWeight = Math.round(item.quantity_grams * factor);
                    const cumulativeWeight = (isEditing ? items : currentPlan.items)
                      .slice(0, idx + 1)
                      .reduce((acc, it) => acc + Math.round(it.quantity_grams * factor), 0);
                    const isDone = completedIngredients.includes(idx);

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setCompletedIngredients((prev) =>
                            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                          );
                        }}
                        className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          isDone
                            ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 opacity-80"
                            : "bg-white border-slate-200 hover:border-amber-300 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                              isDone ? "bg-emerald-600 text-white" : "border-2 border-slate-300 text-slate-400"
                            }`}
                          >
                            {isDone ? "✓" : idx + 1}
                          </div>

                          <div>
                            <span className={`text-sm font-bold block ${isDone ? "line-through text-slate-500" : "text-slate-800"}`}>
                              {item.ingredient_name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Peso acumulado na tigela: <strong className="text-slate-600">{cumulativeWeight} g</strong>
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-base font-black ${isDone ? "text-emerald-700" : "text-amber-700"}`}>
                            +{itemWeight} g
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                            {isDone ? "Pesado" : "Pesar agora"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Checklist de Suplementos Recomendados */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                  Suplementação Obrigatória desta Porção
                </h4>
                <div className="space-y-1.5 text-xs text-amber-950">
                  {summary.recommendedCalciumCarbonateGrams > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>
                        <strong>Carbonato de Cálcio (ou casca em pó):</strong> ~{
                          (summary.recommendedCalciumCarbonateGrams * (kitchenScalePortion === "MEAL" ? (1 / (isEditing ? mealsPerDay : currentPlan.meals_per_day)) : 1)).toFixed(1)
                        } g
                      </span>
                    </div>
                  )}

                  {summary.recommendedOmega3DoseMg > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>
                        <strong>Ômega-3 (EPA + DHA):</strong> ~{
                          Math.round(summary.recommendedOmega3DoseMg * (kitchenScalePortion === "MEAL" ? (1 / (isEditing ? mealsPerDay : currentPlan.meals_per_day)) : 1))
                        } mg
                      </span>
                    </div>
                  )}

                  {(isEditing ? supplements : currentPlan.supplements).map((sup, sIdx) => (
                    <div key={sIdx} className="flex items-center space-x-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{sup}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mensagem de Conclusão */}
              {completedIngredients.length === (isEditing ? items : currentPlan.items).length && (
                <div className="bg-emerald-600 text-white rounded-2xl p-4 text-center animate-bounce-short">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-emerald-200" />
                  <h4 className="font-extrabold text-sm">Refeição 100% Pesada e Pronta!</h4>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Todos os ingredientes foram dosados com precisão zootécnica.
                  </p>
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Progresso: {completedIngredients.length} de {(isEditing ? items : currentPlan.items).length} itens pesados
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCompletedIngredients([])}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Reiniciar
                </button>
                <button
                  type="button"
                  onClick={() => setIsKitchenScaleOpen(false)}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: PLANEJADOR DE MARMITAS & LISTA DE COMPRAS COM FATORES DE COCÇÃO */}
      {isBatchCookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Cabeçalho do Planejador */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Planejador de Marmitas & Lista de Compras</h3>
                  <p className="text-xs text-indigo-100">
                    Calcula a compra de ingredientes crus com fatores de cocção zootécnicos (perda de água)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBatchCookingModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seletor de Período do Lote */}
            <div className="px-6 py-3 bg-indigo-50/70 border-b border-indigo-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Período do Lote de Marmitas:
              </span>
              <div className="inline-flex bg-white p-1 rounded-xl border border-indigo-200 shadow-2xs">
                {[7, 15, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setBatchCookingDays(d)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      batchCookingDays === d
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "text-indigo-800 hover:bg-indigo-50"
                    }`}
                  >
                    {d === 7 ? "7 Dias (Semanal)" : d === 15 ? "15 Dias (Quinzenal)" : "30 Dias (Mensal)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Conteúdo com Barra de Rolagem */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* KPIs de Produção */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Marmitas</span>
                  <span className="text-xl font-black text-slate-800">{batchPlan.totalMeals} potes</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">de <strong>{batchPlan.portionsPerMealGrams}g</strong> cada</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peso Cozido Final</span>
                  <span className="text-xl font-black text-indigo-700">
                    {((summary.totalGrams * batchCookingDays) / 1000).toFixed(2)} kg
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">alimento cozido e pronto</span>
                </div>

                <div className="bg-indigo-50/80 p-3.5 rounded-2xl border border-indigo-200">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Peso Cru a Comprar</span>
                  <span className="text-xl font-black text-indigo-900">{batchPlan.totalRawWeightKg} kg</span>
                  <span className="text-[11px] text-indigo-700 block mt-0.5">açougue e feira (peso bruto)</span>
                </div>
              </div>

              {/* Tabela de Compras com Fator de Cocção */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Lista de Compras (Ingredientes Crus com Fator de Cocção Zootécnico)
                </h4>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Alimento</th>
                        <th className="px-4 py-3 font-semibold text-center">Fator Cocção</th>
                        <th className="px-4 py-3 font-semibold text-center">Total Cozido</th>
                        <th className="px-4 py-3 font-semibold text-right">Comprar Cru</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {batchPlan.shoppingList.map((shop, sIdx) => (
                        <tr key={sIdx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 block">{shop.ingredient_name}</span>
                            <span className="text-[10px] text-slate-400">{shop.preparationTip}</span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-[11px] text-slate-500">
                            {shop.cookingFactor}x
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">
                            {shop.totalCookedGrams} g
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-black text-indigo-700 block">
                              {shop.rawKgFormatted}
                            </span>
                            <span className="text-[10px] text-slate-400">({shop.rawGramsToBuy} g)</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Suplementação Total do Período */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                  Suplementação Total para o Lote de {batchCookingDays} Dias
                </h4>
                <div className="space-y-1.5 text-xs text-amber-950 font-medium">
                  {batchPlan.totalSupplementsList.map((sup, supIdx) => (
                    <div key={supIdx} className="flex items-center space-x-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>
                        <strong>{sup.name}:</strong> {sup.totalAmount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dicas Zootécnicas de Armazenamento e Descongelamento */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider">
                  Diretrizes de Boas Práticas e Congelamento:
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600 text-[11px]">
                  {batchPlan.storageInstructions.map((inst, iIdx) => (
                    <li key={iIdx} className="leading-relaxed">{inst}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {batchPlan.totalMeals} marmitas • {batchPlan.totalRawWeightKg} kg cru a comprar
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `🛒 *Lista de Compras Essência Nutri Pet (${batchCookingDays} dias para ${patient?.name})*\n` +
                      batchPlan.shoppingList.map(s => `• ${s.ingredient_name}: ${s.rawKgFormatted} (${s.rawGramsToBuy}g cru)`).join('\n') +
                      `\n\n💊 *Suplementos:*\n` + batchPlan.totalSupplementsList.map(s => `• ${s.name}: ${s.totalAmount}`).join('\n') +
                      `\n\nTotal de Marmitas: ${batchPlan.totalMeals} potes de ${batchPlan.portionsPerMealGrams}g.`;
                    navigator.clipboard.writeText(text);
                    alert("Lista de compras copiada para o WhatsApp!");
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Lista de Compras</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBatchCookingModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO RECEITUÁRIO DE MANIPULAÇÃO VETERINÁRIA */}
      {isCompoundingModalOpen && compoundingPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Cabeçalho */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-purple-50/70">
              <div className="flex items-center space-x-3">
                <span className="p-2.5 rounded-2xl bg-purple-100 text-purple-800">
                  <Pill className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Receituário de Manipulação Veterinária Personalizada
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fórmula magistral calculada por peso metabólico (NRC/FEDIAF) • 30 Sachês Palatabilizados
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCompoundingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Card Resumo do Paciente & Veículo */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    {compoundingPrescription.patientName} ({compoundingPrescription.species === "CANINE" ? "Canino" : "Felino"})
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Peso: {compoundingPrescription.weightKg} kg • Posologia: 1 sachê/dia matinal
                  </span>
                </div>
                <div className="text-right sm:text-right">
                  <span className="inline-block px-2.5 py-1 bg-purple-100 text-purple-800 font-bold rounded-lg text-[10px]">
                    {compoundingPrescription.pharmaceuticalFormLabel}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    {compoundingPrescription.flavoring}
                  </span>
                </div>
              </div>

              {/* Tabela de Princípios Ativos */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Composição Farmacológica por Sachê Diário (Dose Unitária):
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {compoundingPrescription.activeIngredients.length} ativos
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Princípio Ativo</th>
                        <th className="px-4 py-2.5 font-semibold text-center whitespace-nowrap">Dose Diária</th>
                        <th className="px-4 py-2.5 font-semibold">Ação Terapêutica / Finalidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {compoundingPrescription.activeIngredients.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="px-4 py-2.5 font-bold text-slate-800 whitespace-nowrap">
                            {item.name}
                          </td>
                          <td className="px-4 py-2.5 text-center font-mono font-black text-purple-700 whitespace-nowrap">
                            {item.dailyDoseFormatted}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 text-[11px] leading-relaxed">
                            {item.functionRationale}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Posologia ao Tutor */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-emerald-950">
                <strong className="block font-bold text-xs text-emerald-900 mb-1">
                  Posologia Recomendada ao Tutor:
                </strong>
                <p className="text-[11px] leading-relaxed text-emerald-900/90">
                  {compoundingPrescription.posologyInstructions}
                </p>
              </div>

              {/* Diretrizes Técnicas ao Farmacêutico */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <strong className="block font-bold text-xs text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
                  Orientações Técnicas ao Laboratório de Manipulação:
                </strong>
                <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600">
                  {compoundingPrescription.technicGuidelines.map((g, gIdx) => (
                    <li key={gIdx}>{g}</li>
                  ))}
                  <li>Validade técnica recomendada: {compoundingPrescription.expirationDays} dias.</li>
                </ul>
              </div>
            </div>

            {/* Rodapé */}
            <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
              <span className="text-[11px] text-slate-500">
                Responsável: <strong>{compoundingPrescription.professionalName}</strong> ({compoundingPrescription.crmvCrz})
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = generateCompoundingPrescriptionText(compoundingPrescription);
                    navigator.clipboard.writeText(text);
                    alert("Receituário copiado com sucesso para envio pelo WhatsApp!");
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar para WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = generateCompoundingPrescriptionText(compoundingPrescription);
                    const win = window.open("", "_blank");
                    if (win) {
                      win.document.write(`<pre style="font-family: monospace; font-size: 13px; line-height: 1.5; padding: 20px;">${text}</pre>`);
                      win.document.close();
                      win.print();
                    }
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Imprimir Receita</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCompoundingModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE COMPARATIVO DE CUSTO FINANCEIRO (AN VS RAÇÃO) */}
      {isCostComparisonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Cabeçalho */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-teal-50/70">
              <div className="flex items-center space-x-3">
                <span className="p-2.5 rounded-2xl bg-teal-100 text-teal-800">
                  <Coins className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Comparativo Financeiro: Alimentação Natural vs. Ração Comercial
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transparência orçamentária para o tutor e comprovação do retorno em saúde preventiva.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCostComparisonModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* 3 Cards de Indicadores Financeiros */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* AN Total */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Alimentação Natural (AN Prescrita)
                  </span>
                  <div className="flex items-baseline space-x-1 text-emerald-700">
                    <span className="text-2xl font-black">R$ {costComparison.totalMonthlyNaturalDietBrl.toFixed(2)}</span>
                    <span className="text-[10px] font-semibold text-slate-500">/mês</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    R$ {costComparison.dailyNaturalCostBrl.toFixed(2)}/dia (ingredientes + R$ 3,00 de suplemento)
                  </span>
                </div>

                {/* Ração Terapêutica */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Ração Comercial Coadjuvante
                  </span>
                  <div className="flex items-baseline space-x-1 text-slate-800">
                    <span className="text-2xl font-black">R$ {costComparison.therapeuticKibbleMonthlyCostBrl.toFixed(2)}</span>
                    <span className="text-[10px] font-semibold text-slate-500">/mês</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    R$ {(costComparison.therapeuticKibbleMonthlyCostBrl / 30).toFixed(2)}/dia ({costComparison.kibbleMonthlyKg} kg secos/mês)
                  </span>
                </div>

                {/* Balanço / Economia */}
                <div className={`p-4 rounded-2xl border ${
                  costComparison.isNaturalCheaperThanTherapeutic
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                    : "bg-teal-50/80 border-teal-200 text-teal-950"
                }`}>
                  <span className="text-[10px] font-bold uppercase block mb-1">
                    {costComparison.isNaturalCheaperThanTherapeutic ? "Economia Mensal Estimada" : "Diferencial de Investimento"}
                  </span>
                  <div className="flex items-baseline space-x-1 font-black">
                    <span className="text-2xl">
                      {costComparison.isNaturalCheaperThanTherapeutic ? "–" : "+"} R$ {Math.abs(costComparison.differenceTherapeuticBrl).toFixed(2)}
                    </span>
                    <span className="text-[10px]">/mês</span>
                  </div>
                  <span className="text-[10px] block mt-1 font-semibold">
                    {costComparison.isNaturalCheaperThanTherapeutic ? "✓ AN mais econômica que a ração!" : "Custo equivalente e biológico"}
                  </span>
                </div>
              </div>

              {/* Destaque do Ganho Biológico & Hidratação */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 flex items-start space-x-3 text-slate-800">
                <Droplets className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs font-bold text-teal-950 mb-0.5">
                    Retorno Biológico em Saúde (ROI Preventivo):
                  </strong>
                  <p className="text-[11px] leading-relaxed text-teal-900">
                    {costComparison.preventiveHealthRoiSummary}
                  </p>
                </div>
              </div>

              {/* Tabela de Decomposição dos Custos dos Ingredientes */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center">
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                    Detalhamento de Custos dos Ingredientes Crus (Mensal):
                  </span>
                  <span className="text-[10px] text-slate-500">Valores médios feira/açougue</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Ingrediente</th>
                        <th className="px-4 py-2.5 font-semibold text-center whitespace-nowrap">Prato / Dia</th>
                        <th className="px-4 py-2.5 font-semibold text-center whitespace-nowrap">Comprar / Mês (Cru)</th>
                        <th className="px-4 py-2.5 font-semibold text-center whitespace-nowrap">Preço Médio / kg</th>
                        <th className="px-4 py-2.5 font-semibold text-right whitespace-nowrap">Custo Mensal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {costComparison.naturalIngredientsBreakdown.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="px-4 py-2.5 font-bold text-slate-800">
                            {item.name}
                          </td>
                          <td className="px-4 py-2.5 text-center font-mono text-slate-600">
                            {item.dailyCookedGrams}g
                          </td>
                          <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-900">
                            {item.monthlyRawKg} kg
                          </td>
                          <td className="px-4 py-2.5 text-center font-mono text-slate-500">
                            R$ {item.unitPricePerKgBrl.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-black text-slate-900">
                            R$ {item.monthlyCostBrl.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50/80 font-bold">
                        <td className="px-4 py-2.5 text-slate-800" colSpan={4}>
                          Subtotal Ingredientes de Feira / Açougue (30 dias)
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-black text-slate-900">
                          R$ {costComparison.monthlyNaturalCostBrl.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50/80 font-bold">
                        <td className="px-4 py-2.5 text-purple-800" colSpan={4}>
                          Suplementação Mineral-Vitamínica Manipulada (30 sachês)
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-black text-purple-900">
                          R$ {costComparison.supplementsMonthlyCostBrl.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
              <span className="text-[11px] text-slate-500">
                Total consolidado: <strong>R$ {costComparison.totalMonthlyNaturalDietBrl.toFixed(2)} / mês</strong>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `💰 *Comparativo Financeiro Essência Nutri Pet (${patient?.name})*\n` +
                      `• Alimentação Natural: R$ ${costComparison.totalMonthlyNaturalDietBrl.toFixed(2)} / mês (R$ ${costComparison.dailyNaturalCostBrl.toFixed(2)}/dia)\n` +
                      `• Ração Comercial Coadjuvante: R$ ${costComparison.therapeuticKibbleMonthlyCostBrl.toFixed(2)} / mês\n` +
                      `• Balanço: ${costComparison.isNaturalCheaperThanTherapeutic ? 'Economia de' : 'Diferença de'} R$ ${Math.abs(costComparison.differenceTherapeuticBrl).toFixed(2)} / mês\n` +
                      `• Ganho Hídrico: +${costComparison.moistureAdvantageLitersPerMonth} Litros de água natural/mês!`;
                    navigator.clipboard.writeText(text);
                    alert("Resumo financeiro copiado para o WhatsApp!");
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Resumo Financeiro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCostComparisonModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
