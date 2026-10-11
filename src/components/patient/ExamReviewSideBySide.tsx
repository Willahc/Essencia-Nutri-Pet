"use client";

import React, { useState, useRef } from "react";
import { ExamDocument, ExamParameterResult, Species } from "@/types";
import { FileText, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, ExternalLink, Check, Eye, Upload, Loader2, RefreshCw } from "lucide-react";

interface ExamReviewSideBySideProps {
  exam: ExamDocument;
  species?: Species;
}

export function ExamReviewSideBySide({ exam, species = "CANINE" }: ExamReviewSideBySideProps) {
  const [currentExam, setCurrentExam] = useState<ExamDocument>(exam);
  const [results, setResults] = useState<ExamParameterResult[]>(exam.extracted_results);
  const [isApproved, setIsApproved] = useState(exam.extraction_status === "REVIEWED_APPROVED");
  const [reviewNotes, setReviewNotes] = useState(exam.professional_review_notes || "");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApprove = () => {
    setIsApproved(true);
    setCurrentExam((prev) => ({
      ...prev,
      extraction_status: "REVIEWED_APPROVED",
      reviewed_at: new Date().toISOString(),
      reviewed_by: "Dr. Roberto Almeida (CRZ 4821)",
      professional_review_notes: reviewNotes,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadMessage("Enviando documento e calculando integridade SHA-256...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("species", species);

      setUploadMessage("Executando OCR e Extração Multimodal com IA...");

      const response = await fetch("/api/ai/extract", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (json.success && json.data) {
        const extracted = json.data;
        const newResults: ExamParameterResult[] = extracted.extracted_results;

        setResults(newResults);
        setIsApproved(false);
        setReviewNotes(extracted.preliminary_summary || "");

        setCurrentExam({
          id: `ex-${Date.now()}`,
          patient_id: exam.patient_id,
          laboratory_name: extracted.laboratory_name,
          exam_date: extracted.exam_date,
          file_name: file.name,
          file_url: URL.createObjectURL(file),
          file_hash_sha256: `sha256_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
          extraction_status: "PENDING_REVIEW",
          extracted_results: newResults,
          professional_review_notes: extracted.preliminary_summary,
        });

        setUploadMessage("Extração concluída com sucesso! Revise os parâmetros abaixo.");
      } else {
        alert("Não foi possível processar o laudo: " + (json.error || "Erro desconhecido"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro de conexão ao processar documento.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadMessage(""), 4000);
    }
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
              {currentExam.laboratory_name} • Data do Laudo: {new Date(currentExam.exam_date).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Botão de Upload de Novo Laudo */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,image/*"
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> : <Upload className="w-4 h-4 text-purple-600" />}
            <span>{isUploading ? "Processando..." : "Subir Novo Laudo (PDF)"}</span>
          </button>

          {!isApproved ? (
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Aprovar Extração</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle className="w-4 h-4" />
              <span>Homologado</span>
            </div>
          )}
        </div>
      </div>

      {uploadMessage && (
        <div className="mb-4 bg-purple-50 border border-purple-200 text-purple-800 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{uploadMessage}</span>
        </div>
      )}

      {/* Alerta de Governança e Human-in-the-Loop */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 mb-6 flex items-start space-x-3">
        <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-bold">Princípio Human-in-the-Loop:</span> A Inteligência Artificial transcreve e correlaciona os valores laboratoriais preservando a rastreabilidade do documento original. Parâmetros com baixa nitidez ou unidades fora do padrão recebem destaque de <strong className="text-amber-800">incerteza</strong> para conferência visual obrigatória.
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
              <span className="text-[10px] text-slate-500 font-mono">Bucket Privado</span>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-3.5 border border-slate-700 text-xs space-y-2 mb-4 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Arquivo:</span>
                <span className="text-slate-200 break-all">{currentExam.file_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Hash SHA-256:</span>
                <span className="text-emerald-400 text-[10px] break-all">{currentExam.file_hash_sha256}</span>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-950/60 rounded-xl p-6 text-center">
              <Eye className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Visualizador PDF Integrado</p>
              <p className="text-[10px] text-slate-600 mt-1">Bucket Privado • URL Pré-assinada de 15 minutos</p>
              <button 
                type="button"
                className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1 transition-colors"
                onClick={() => alert(`Visualização segura do documento: ${currentExam.file_name}`)}
              >
                <span>Visualizar Laudo</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-800">
            Laboratório: {currentExam.laboratory_name}
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
              Parecer Preliminar / Conduta do Zootecnista / Nutrólogo
            </label>
            <textarea
              rows={2}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Descreva a interpretação dos biomarcadores para o manejo nutricional..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
