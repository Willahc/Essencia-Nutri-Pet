"use client";

import React, { useState } from "react";
import { ExamDocument, ExamParameterResult } from "@/types";
import { FileText, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, ExternalLink, Check, Eye } from "lucide-react";

interface ExamReviewSideBySideProps {
  exam: ExamDocument;
}

export function ExamReviewSideBySide({ exam }: ExamReviewSideBySideProps) {
  const [results, setResults] = useState<ExamParameterResult[]>(exam.extracted_results);
  const [isApproved, setIsApproved] = useState(exam.extraction_status === "REVIEWED_APPROVED");
  const [reviewNotes, setReviewNotes] = useState(exam.professional_review_notes || "");

  const handleApprove = () => {
    setIsApproved(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      {/* Cabeçalho do Módulo de Exames */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-800 text-lg">Revisão Assistida de Laudos (OCR & IA)</h3>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isApproved ? 'Laudo Aprovado pelo Profissional' : 'Aguardando Validação Humana'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {exam.laboratory_name} • Data do Laudo: {new Date(exam.exam_date).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!isApproved ? (
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Aprovar & Homologar Extração</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle className="w-4 h-4" />
              <span>Homologado por Dr. Roberto Almeida</span>
            </div>
          )}
        </div>
      </div>

      {/* Alerta de Governança e Human-in-the-Loop */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 mb-6 flex items-start space-x-3">
        <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-bold">Diretriz Clínica Essência Nutri Pet:</span> Os valores foram extraídos automaticamente do documento original com verificação de integridade criptográfica (SHA-256). Parâmetros com baixa nitidez ou unidades atípicas foram sinalizados como <strong className="text-amber-800">incertos</strong> para conferência visual obrigatória.
        </div>
      </div>

      {/* Grid Side-by-Side: Documento x Dados Estruturados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel do Documento Original */}
        <div className="lg:col-span-5 bg-slate-900 rounded-xl p-5 text-slate-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-white">Documento Original Preservado</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">PDF Seguro</span>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-3.5 border border-slate-700 text-xs space-y-2 mb-4 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Arquivo:</span>
                <span className="text-slate-200 break-all">{exam.file_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Hash SHA-256:</span>
                <span className="text-emerald-400 text-[10px] break-all">{exam.file_hash_sha256}</span>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-950/60 rounded-xl p-6 text-center">
              <Eye className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Visualizador PDF Integrado</p>
              <p className="text-[10px] text-slate-600 mt-1">Bucket Privado • URL Pré-assinada de 15 minutos</p>
              <button 
                type="button"
                className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1 transition-colors"
                onClick={() => alert("No ambiente com S3/R2 configurado, abre o PDF original em aba segura.")}
              >
                <span>Abrir Laudo Completo</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-800">
            Origem: BioVet Laboratório • Equipamento: Analisador Bioquímico Automatizado
          </div>
        </div>

        {/* Tabela de Parâmetros Extraídos */}
        <div className="lg:col-span-7">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Marcador / Parâmetro</th>
                  <th className="px-4 py-3 font-semibold text-right">Resultado</th>
                  <th className="px-4 py-3 font-semibold text-center">Referência</th>
                  <th className="px-4 py-3 font-semibold text-center">Status / IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {results.map((item) => (
                  <tr key={item.id} className={item.is_uncertain ? "bg-amber-50/40" : "hover:bg-slate-50/50"}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <span>{item.parameter}</span>
                        {item.page_number && (
                          <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                            pág {item.page_number}
                          </span>
                        )}
                      </div>
                      {item.is_uncertain && item.uncertainty_reason && (
                        <p className="text-[10px] text-amber-700 font-normal mt-0.5 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600 shrink-0" />
                          {item.uncertainty_reason}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${
                        item.is_out_of_range ? 'text-rose-600' : 'text-slate-800'
                      }`}>
                        {item.value} {item.unit}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center text-slate-500 text-[11px] font-mono">
                      {item.reference_range} {item.unit}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {item.is_uncertain ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Verificar
                        </span>
                      ) : item.is_out_of_range ? (
                        <span className="inline-flex items-center text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          Alterado
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Parecer do Profissional */}
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Parecer / Conduta do Zootecnista / Nutrólogo
            </label>
            <textarea
              rows={2}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Ex.: Dislipidemia moderada compatível com sobrepeso crônico. Função renal preservada. Dieta hipolipídica recomendada..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
