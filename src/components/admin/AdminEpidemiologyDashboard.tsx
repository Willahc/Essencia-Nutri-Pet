"use client";

import React, { useState, useMemo } from "react";
import { Patient, ExamDocument, MeasurementRecord, Species } from "@/types";
import {
  generateClinicalCensus,
  ClinicalCensusData,
  AnalyzedPatientProfile,
  DEFICIENCY_CATEGORIES,
  DeficiencyCategory,
} from "@/lib/clinical-census";
import {
  Activity,
  Users,
  Scale,
  Droplets,
  HeartPulse,
  Sparkles,
  ShieldAlert,
  Flame,
  Bug,
  Clock,
  Wind,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ChevronRight,
  ExternalLink,
  BarChart3,
  Stethoscope,
  Info,
  Check,
  X,
  FileSpreadsheet
} from "lucide-react";

interface AdminEpidemiologyDashboardProps {
  patients: Patient[];
  exams: ExamDocument[];
  measurements: MeasurementRecord[];
  onSelectPatient: (patientId: string) => void;
}

export function AdminEpidemiologyDashboard({
  patients,
  exams,
  measurements,
  onSelectPatient,
}: AdminEpidemiologyDashboardProps) {
  const [speciesFilter, setSpeciesFilter] = useState<"ALL" | "CANINE" | "FELINE">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<DeficiencyCategory | "ALL">("ALL");
  const [severityFilter, setSeverityFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "NONE">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProfileForModal, setSelectedProfileForModal] = useState<AnalyzedPatientProfile | null>(null);

  // Calcula os dados agregados do censo
  const censusData: ClinicalCensusData = useMemo(() => {
    return generateClinicalCensus(patients, exams, measurements);
  }, [patients, exams, measurements]);

  // Filtra a lista individual de pacientes
  const filteredProfiles = useMemo(() => {
    return censusData.allPatientProfiles.filter((profile) => {
      // Filtro de espécie
      if (speciesFilter !== "ALL" && profile.species !== speciesFilter) return false;

      // Filtro de severidade
      if (severityFilter !== "ALL") {
        if (severityFilter === "HIGH" && profile.highestSeverity !== "HIGH") return false;
        if (severityFilter === "MEDIUM" && profile.highestSeverity !== "MEDIUM") return false;
        if (severityFilter === "NONE" && profile.highestSeverity !== "NONE" && profile.highestSeverity !== "LOW") return false;
      }

      // Filtro de categoria de deficiência
      if (categoryFilter !== "ALL") {
        const hasCategory = profile.deficiencies.some((d) => d.category === categoryFilter);
        if (!hasCategory) return false;
      }

      // Filtro de busca textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = profile.patient.name.toLowerCase().includes(q);
        const matchBreed = profile.patient.breed.toLowerCase().includes(q);
        const matchDef = profile.deficiencies.some((d) => d.name.toLowerCase().includes(q) || d.detail.toLowerCase().includes(q));
        if (!matchName && !matchBreed && !matchDef) return false;
      }

      return true;
    });
  }, [censusData, speciesFilter, categoryFilter, severityFilter, searchQuery]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. TOPO: TÍTULO INSTITUCIONAL & AÇÕES EXECUTIVAS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4 sm:pb-6 mb-4 sm:mb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-emerald-100/80 text-emerald-800 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                Painel do Administrador • Censo Clínico
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Mapeamento transversal de saúde dos pacientes, comorbidades prevalentes e comparativo epidemiológico entre{" "}
              <strong className="text-slate-700">Caninos</strong> e <strong className="text-slate-700">Felinos</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto justify-center px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center space-x-2 transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir Relatório</span>
            </button>
          </div>
        </div>

        {/* 2. KPIS GLOBAIS DE SAÚDE */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total de Pets */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
              <span>Total de Pacientes</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900">{censusData.totalPatients}</span>
              <span className="text-xs text-slate-500 font-semibold">pets</span>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800">🐕 {censusData.canineCount} caninos</span>
              <span>•</span>
              <span className="font-bold text-slate-800">🐈 {censusData.felineCount} felinos</span>
            </div>
          </div>

          {/* Taxa de Deficiências */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70">
            <div className="flex items-center justify-between text-xs text-amber-800 mb-2 font-medium">
              <span>Com Alterações / Deficiências</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-amber-950">{censusData.petsWithDeficienciesCount}</span>
              <span className="text-xs text-amber-800 font-bold">({censusData.petsWithDeficienciesRate}%)</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-2 truncate">
              Condições renais, articulares, alérgicas ou ponderais
            </p>
          </div>

          {/* Casos de Alta Gravidade */}
          <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/70">
            <div className="flex items-center justify-between text-xs text-rose-800 mb-2 font-medium">
              <span>Alta Gravidade / Críticos</span>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-rose-950">{censusData.globalSeverityBreakdown.high}</span>
              <span className="text-xs text-rose-800 font-bold">
                ({((censusData.globalSeverityBreakdown.high / (censusData.totalPatients || 1)) * 100).toFixed(0)}%)
              </span>
            </div>
            <p className="text-[11px] text-rose-700 mt-2 truncate">
              DRC avançada, cardiopatias severas ou hipercalcemia
            </p>
          </div>

          {/* Condição Corporal / ECC */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/70">
            <div className="flex items-center justify-between text-xs text-emerald-800 mb-2 font-medium">
              <span>Sobrepeso & Obesidade</span>
              <Scale className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-emerald-950">
                {censusData.canineSummary.bcsDistribution.overweight.count +
                  censusData.canineSummary.bcsDistribution.obese.count +
                  censusData.felineSummary.bcsDistribution.overweight.count +
                  censusData.felineSummary.bcsDistribution.obese.count}
              </span>
              <span className="text-xs text-emerald-800 font-bold">
                (
                {(
                  ((censusData.canineSummary.bcsDistribution.overweight.count +
                    censusData.canineSummary.bcsDistribution.obese.count +
                    censusData.felineSummary.bcsDistribution.overweight.count +
                    censusData.felineSummary.bcsDistribution.obese.count) /
                    (censusData.totalPatients || 1)) *
                  100
                ).toFixed(0)}
                %)
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-2 truncate">
              Escore corporal ≥ 6/9 demandando manejo calórico
            </p>
          </div>
        </div>
      </div>

      {/* 3. COMPARATIVO EPIDEMIOLÓGICO: O QUE MAIS AFETA CANINOS VS FELINOS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-teal-600" />
              O que mais afeta cada espécie? (Caninos vs. Felinos)
            </h3>
            <p className="text-xs text-slate-500">
              Ranking de prevalência das deficiências e condições clínicas mais frequentes identificadas no censo.
            </p>
          </div>

          <div className="flex flex-wrap sm:inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
            <button
              onClick={() => setSpeciesFilter("ALL")}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all text-center ${
                speciesFilter === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Geral
            </button>
            <button
              onClick={() => setSpeciesFilter("CANINE")}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all text-center ${
                speciesFilter === "CANINE" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🐕 Caninos ({censusData.canineCount})
            </button>
            <button
              onClick={() => setSpeciesFilter("FELINE")}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all text-center ${
                speciesFilter === "FELINE" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🐈 Felinos ({censusData.felineCount})
            </button>
          </div>
        </div>

        {/* CARDS COMPARATIVOS LADO A LADO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Caninos */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🐕</span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Espécie Canina</h4>
                  <span className="text-[11px] text-slate-500">
                    {censusData.canineCount} cães monitorados • {censusData.canineSummary.withDeficienciesRate}% com alterações
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold">
                {censusData.canineSummary.withDeficiencies} pets afetados
              </span>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Top Deficiências & Condições em Cães:
              </span>
              {censusData.canineSummary.topDeficiencies.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhuma deficiência detectada no banco.</p>
              ) : (
                censusData.canineSummary.topDeficiencies.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-slate-400 text-[10px]">#{idx + 1}</span>
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                      <span className="font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {item.count} cães ({item.percentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.category === "RENAL_URINARY"
                            ? "bg-amber-500"
                            : item.category === "OSTEOARTICULAR"
                            ? "bg-indigo-500"
                            : item.category === "CARDIOVASCULAR"
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ponderal Canino */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/70 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Escores Corporais (ECC Médio):</span>
              <div className="flex items-center space-x-3 text-[11px] text-slate-600">
                <span>Eutróficos: <strong>{censusData.canineSummary.bcsDistribution.ideal.percentage}%</strong></span>
                <span>•</span>
                <span>Sobrepeso: <strong>{censusData.canineSummary.bcsDistribution.overweight.percentage}%</strong></span>
                <span>•</span>
                <span>Obesos: <strong>{censusData.canineSummary.bcsDistribution.obese.percentage}%</strong></span>
              </div>
            </div>
          </div>

          {/* Card Felinos */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🐈</span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Espécie Felina</h4>
                  <span className="text-[11px] text-slate-500">
                    {censusData.felineCount} gatos monitorados • {censusData.felineSummary.withDeficienciesRate}% com alterações
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold">
                {censusData.felineSummary.withDeficiencies} pets afetados
              </span>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Top Deficiências & Condições em Gatos:
              </span>
              {censusData.felineSummary.topDeficiencies.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhuma deficiência detectada no banco.</p>
              ) : (
                censusData.felineSummary.topDeficiencies.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-slate-400 text-[10px]">#{idx + 1}</span>
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                      <span className="font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {item.count} felinos ({item.percentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.category === "RENAL_URINARY"
                            ? "bg-amber-500"
                            : item.category === "RESPIRATORY"
                            ? "bg-sky-500"
                            : item.category === "DERMATO_ALLERGIC"
                            ? "bg-pink-500"
                            : "bg-teal-500"
                        }`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ponderal Felino */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/70 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Escores Corporais (ECC Médio):</span>
              <div className="flex items-center space-x-3 text-[11px] text-slate-600">
                <span>Eutróficos: <strong>{censusData.felineSummary.bcsDistribution.ideal.percentage}%</strong></span>
                <span>•</span>
                <span>Sobrepeso: <strong>{censusData.felineSummary.bcsDistribution.overweight.percentage}%</strong></span>
                <span>•</span>
                <span>Obesos: <strong>{censusData.felineSummary.bcsDistribution.obese.percentage}%</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* TABELA COMPARATIVA DE PREVALÊNCIA POR CATEGORIA CLÍNICA */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs mt-4">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
              Comparativo Sistêmico por Categoria Clínica
            </span>
            <span className="text-[10px] text-slate-500">Percentual em relação ao total da espécie</span>
          </div>

          <div className="overflow-x-auto scrollbar-none touch-scroll">
            <table className="w-full text-left text-xs min-w-[680px]">
              <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sistema / Categoria</th>
                  <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Caninos (Prevalência)</th>
                  <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Felinos (Prevalência)</th>
                  <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Espécie Mais Afetada</th>
                  <th className="px-4 py-3 font-semibold">Manejo Zootécnico & Nutricional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {censusData.crossSpeciesComparison.map((row) => (
                  <tr key={row.category} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        row.category === "RENAL_URINARY" ? "bg-amber-500" :
                        row.category === "OSTEOARTICULAR" ? "bg-indigo-500" :
                        row.category === "CARDIOVASCULAR" ? "bg-red-500" :
                        row.category === "HEPATIC_BILIARY" ? "bg-rose-500" :
                        row.category === "DERMATO_ALLERGIC" ? "bg-pink-500" :
                        row.category === "RESPIRATORY" ? "bg-sky-500" :
                        "bg-emerald-500"
                      }`} />
                      <span>{row.categoryLabel}</span>
                    </td>

                    <td className="px-4 py-3 text-center font-mono">
                      <span className="font-bold text-slate-900">{row.canineCount}</span>
                      <span className="text-[11px] text-slate-400 ml-1">({row.caninePercentage}%)</span>
                    </td>

                    <td className="px-4 py-3 text-center font-mono">
                      <span className="font-bold text-slate-900">{row.felineCount}</span>
                      <span className="text-[11px] text-slate-400 ml-1">({row.felinePercentage}%)</span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {row.mostAffectedSpecies === "CANINE" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          🐕 Caninos (+{row.differencePercent}%)
                        </span>
                      ) : row.mostAffectedSpecies === "FELINE" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          🐈 Felinos (+{row.differencePercent}%)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Igual</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-600 text-[11px] leading-relaxed">
                      {row.zootecnicTip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. PAINEL DE ACOMPANHAMENTO INDIVIDUAL PACIENTE POR PACIENTE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center">
              <Users className="w-5 h-5 mr-2 text-emerald-600" />
              Monitor Individual de Pacientes ({filteredProfiles.length} listados)
            </h3>
            <p className="text-xs text-slate-500">
              Acompanhamento de cada animal cadastrado, detalhamento de deficiências ativas e acesso direto ao prontuário.
            </p>
          </div>

          {/* Campo de Busca */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por pet, raça ou doença..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Barra de Filtros Rápidos */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1">Filtros:</span>

          {/* Filtro Espécie */}
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Todas as Espécies</option>
            <option value="CANINE">Apenas Caninos</option>
            <option value="FELINE">Apenas Felinos</option>
          </select>

          {/* Filtro Categoria de Deficiência */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Todas as Categorias</option>
            {Object.values(DEFICIENCY_CATEGORIES).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Filtro Gravidade */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Todas as Gravidades</option>
            <option value="HIGH">Alta Gravidade / Crítico</option>
            <option value="MEDIUM">Moderado / Atenção</option>
            <option value="NONE">Estável / Sem Deficiências</option>
          </select>

          {(speciesFilter !== "ALL" || categoryFilter !== "ALL" || severityFilter !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setSpeciesFilter("ALL");
                setCategoryFilter("ALL");
                setSeverityFilter("ALL");
                setSearchQuery("");
              }}
              className="text-[11px] font-bold text-rose-600 hover:underline px-2 py-1"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* LISTAGEM DE PACIENTES */}
        <div className="grid grid-cols-1 gap-3">
          {filteredProfiles.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
              Nenhum paciente encontrado com os filtros selecionados.
            </div>
          ) : (
            filteredProfiles.map((item) => {
              const p = item.patient;
              return (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-sm rounded-2xl p-4 sm:p-5 transition-all flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  {/* Identificação do Pet */}
                  <div className="flex items-start space-x-3.5 min-w-[240px]">
                    <div className="text-3xl p-2 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
                      {p.avatar_url || (p.species === "CANINE" ? "🐕" : "🐈")}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base">{p.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            p.species === "CANINE" ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {p.species === "CANINE" ? "Canino" : "Felino"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.breed} • {p.sex === "MALE" ? "Macho" : "Fêmea"} {p.is_neutered ? "(Castrado)" : ""}
                      </p>
                      <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-600">
                        <span className="font-semibold">{item.weightKg} kg</span>
                        <span>•</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-md font-bold text-[10px] ${
                            item.nutritionalStatus === "OBESO"
                              ? "bg-rose-100 text-rose-800"
                              : item.nutritionalStatus === "SOBREPESO"
                              ? "bg-amber-100 text-amber-800"
                              : item.nutritionalStatus === "MAGREZA"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          ECC {item.bcs}/9 ({item.nutritionalStatus})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deficiências e Condições Clínicas Detectadas */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {item.deficiencies.length === 0 ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Check-up e Parâmetros em Faixa Fisiológica Adequada
                        </span>
                      ) : (
                        item.deficiencies.map((def) => {
                          const meta = DEFICIENCY_CATEGORIES[def.category];
                          return (
                            <span
                              key={def.id}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center space-x-1 ${
                                meta?.colorBg || "bg-slate-100"
                              } ${meta?.colorText || "text-slate-800"} ${meta?.borderColor || "border-slate-200"}`}
                              title={def.detail}
                            >
                              <span>{def.name}</span>
                              {def.severity === "HIGH" && (
                                <span className="ml-1 w-2 h-2 rounded-full bg-rose-600 animate-pulse" title="Alta Gravidade" />
                              )}
                            </span>
                          );
                        })
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 italic truncate max-w-xl">
                      <strong className="text-slate-700 not-italic">Foco Zootécnico:</strong> {item.primaryDietaryFocus}
                    </p>
                  </div>

                  {/* Status de Gravidade & Botão de Ação */}
                  <div className="flex items-center space-x-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div>
                      {item.highestSeverity === "HIGH" ? (
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center">
                          <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                          Crítico / Alta
                        </span>
                      ) : item.highestSeverity === "MEDIUM" ? (
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                          Atenção
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Estável
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectPatient(p.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
                    >
                      <span>Abrir Prontuário</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
