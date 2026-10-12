"use client";

import React, { useRef } from "react";
import { Patient, Tutor, AppointmentRecord, MeasurementRecord, NutritionPlan, ExamDocument } from "@/types";
import { Printer, X, ShieldCheck, HeartPulse, ExternalLink, Download } from "lucide-react";

interface EvolutionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  tutor: Tutor;
  appointments: AppointmentRecord[];
  measurements: MeasurementRecord[];
  plan: NutritionPlan;
  exam: ExamDocument;
}

export function EvolutionReportModal({
  isOpen,
  onClose,
  patient,
  tutor,
  appointments,
  measurements,
  plan,
  exam,
}: EvolutionReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleOpenStandalone = () => {
    if (!reportRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <title>Laudo de Evolucao Nutricional - ${patient.name}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @page { margin: 15mm; }
            }
          </style>
        </head>
        <body class="bg-white p-8 max-w-4xl mx-auto font-sans text-xs text-slate-900">
          <div class="mb-4 flex justify-end print:hidden">
            <button onclick="window.print()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm">
              Imprimir / Salvar como PDF
            </button>
          </div>
          ${reportRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Barra Superior com Controles */}
        <div className="bg-slate-900 px-3.5 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-white shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
            <span className="font-bold text-xs sm:text-sm truncate">Relatório Nutricional</span>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            <button
              onClick={handleOpenStandalone}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Aba</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>PDF</span>
            </button>

            <button onClick={onClose} className="p-1 sm:p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Relatório Formatado (Imprimível) */}
        <div className="p-4 sm:p-8 lg:p-12 overflow-y-auto touch-scroll flex-1 bg-white" ref={reportRef}>
          {/* Cabeçalho do Laudo */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-800 pb-4 sm:pb-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-sm shrink-0">
                🐾
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">Essência Nutri Pet</h1>
                <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium">Clínica & Nutrição Especializada de Pequenos Animais</p>
                <p className="text-[9px] sm:text-[10px] text-slate-400">Plataforma Longitudinal de Acompanhamento com IA Supervisionada</p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded text-[10px] uppercase border border-emerald-200 mb-1">
                Laudo Nutricional Oficial
              </span>
              <p className="text-[11px] font-bold text-slate-800">Dr. Roberto Almeida</p>
              <p className="text-[10px] text-slate-500">Zootecnista / Nutrólogo • CRZ 4821</p>
              <p className="text-[10px] text-slate-400">Emissão: {new Date().toLocaleDateString("pt-BR")}</p>
            </div>
          </div>

          <div className="space-y-6 text-xs text-slate-800 font-sans">
            {/* Dados Cadastrais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1.5">Identificação do Paciente</h3>
                <p><span className="text-slate-500">Nome:</span> <strong className="text-slate-900">{patient.name}</strong></p>
                <p><span className="text-slate-500">Espécie / Raça:</span> {patient.species === 'CANINE' ? 'Canino' : 'Felino'} • {patient.breed}</p>
                <p><span className="text-slate-500">Sexo / Status:</span> {patient.sex === 'MALE' ? 'Macho' : 'Fêmea'} ({patient.is_neutered ? 'Castrado' : 'Inteiro'})</p>
                <p><span className="text-slate-500">Nascimento:</span> {new Date(patient.birth_date).toLocaleDateString("pt-BR")}</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1.5">Responsável (Tutor)</h3>
                <p><span className="text-slate-500">Tutor(a):</span> <strong className="text-slate-900">{tutor.name}</strong></p>
                <p><span className="text-slate-500">Telefone:</span> {tutor.phone}</p>
                <p><span className="text-slate-500">E-mail:</span> {tutor.email}</p>
                <p><span className="text-slate-500">Localidade:</span> {tutor.city}/{tutor.state}</p>
              </div>
            </div>

            {/* Curva Evolutiva de Peso e ECC */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 pb-1 border-b border-slate-200">
                1. Acompanhamento Ponderal e Escore Corporal (ECC 1-9)
              </h3>
              <div className="overflow-x-auto scrollbar-none touch-scroll -mx-1 px-1">
                <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden min-w-[500px]">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Data</th>
                      <th className="p-2.5">Peso Aferido</th>
                      <th className="p-2.5">ECC (1-9)</th>
                      <th className="p-2.5">Circ. Abdominal</th>
                      <th className="p-2.5">Observações Clínicas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {measurements.map((m) => (
                      <tr key={m.id}>
                        <td className="p-2.5 font-medium whitespace-nowrap">{new Date(m.date).toLocaleDateString("pt-BR")}</td>
                        <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">{m.weight_kg} kg</td>
                        <td className="p-2.5 whitespace-nowrap">{m.bcs}/9</td>
                        <td className="p-2.5 whitespace-nowrap">{m.abdominal_circumference_cm ? `${m.abdominal_circumference_cm} cm` : '-'}</td>
                        <td className="p-2.5 text-slate-600 text-[11px]">{m.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Prescrição Nutricional Vigente */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 pb-1 border-b border-slate-200">
                2. Prescrição Dietética Homologada (Plano Atual: v{plan.version}.0)
              </h3>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <span className="text-slate-500 block text-[10px]">Energia Prescrita (MER / NEM):</span>
                  <strong className="text-sm text-emerald-800">{plan.daily_energy_kcal} kcal/dia</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Fracionamento Diário:</span>
                  <strong className="text-sm text-slate-900">{plan.meals_per_day} refeições ao dia</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Meta de Hidratação:</span>
                  <strong className="text-sm text-cyan-800">{plan.hydration_target_ml_day} mL/dia</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-slate-700 text-[11px] mb-1.5">Composição dos Alimentos (Porção Diária Cozida):</h4>
                  <ul className="space-y-1 text-slate-700">
                    {plan.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between border-b border-slate-100 py-0.5">
                        <span>• {it.ingredient_name}</span>
                        <strong className="text-slate-900">{it.quantity_grams}g</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 text-[11px] mb-1.5">Suplementação e Manejo Obrigatório:</h4>
                  <ul className="space-y-1 text-slate-700">
                    {plan.supplements.map((sup, idx) => (
                      <li key={idx}>✓ {sup}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-slate-500 mt-2 bg-white p-2 rounded border border-slate-200">
                    {plan.notes}
                  </p>
                </div>
              </div>
            </div>

            {/* Assinatura do Profissional */}
            <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-300 flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
              <div className="text-[10px] text-slate-400">
                <p>Relatório gerado digitalmente pela plataforma Essência Nutri Pet.</p>
                <p>Autenticação do Laudo: SHA-256 {exam.file_hash_sha256.slice(0, 24)}...</p>
              </div>

              <div className="text-center w-full sm:w-64 border-t border-slate-800 pt-2">
                <p className="font-bold text-slate-900 text-xs">Dr. Roberto Almeida</p>
                <p className="text-[10px] text-slate-500">Zootecnista / Especialista em Nutrição Animal</p>
                <p className="text-[10px] text-slate-400">CRZ 4821 / CRMV-SP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
