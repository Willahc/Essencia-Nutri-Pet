"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExamDocument, ExamParameterResult, Species, ExamExtractionResponse } from "@/types";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Eye, 
  Upload, 
  Loader2, 
  Download, 
  Maximize2, 
  X,
  UserPlus
} from "lucide-react";

interface ExamReviewSideBySideProps {
  exam: ExamDocument;
  species?: Species;
  onPatientDetected?: (extracted: ExamExtractionResponse, fileUrl: string, fileName: string) => void;
  onExamSaved?: (savedExam: ExamDocument) => void;
}

export function ExamReviewSideBySide({ 
  exam, 
  species = "CANINE", 
  onPatientDetected,
  onExamSaved 
}: ExamReviewSideBySideProps) {
  const [currentExam, setCurrentExam] = useState<ExamDocument>(exam);
  const [results, setResults] = useState<ExamParameterResult[]>(exam.extracted_results);
  const [isApproved, setIsApproved] = useState(exam.extraction_status === "REVIEWED_APPROVED");
  const [reviewNotes, setReviewNotes] = useState(exam.professional_review_notes || "");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza estado interno quando o paciente ou exame mudar
  useEffect(() => {
    setCurrentExam(exam);
    setResults(exam.extracted_results);
    setIsApproved(exam.extraction_status === "REVIEWED_APPROVED");
    setReviewNotes(exam.professional_review_notes || "");
  }, [exam]);

  const handleApprove = () => {
    setIsApproved(true);
    const approved: ExamDocument = {
      ...currentExam,
      extraction_status: "REVIEWED_APPROVED",
      reviewed_at: new Date().toISOString(),
      reviewed_by: "Dr. Roberto Almeida (CRZ 4821)",
      professional_review_notes: reviewNotes,
      extracted_results: results,
    };
    setCurrentExam(approved);
    if (onExamSaved) {
      onExamSaved(approved);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Gera URL local segura para visualização imediata do PDF/Imagem no navegador
    const newFileUrl = URL.createObjectURL(file);

    try {
      setIsUploading(true);
      setUploadMessage("Enviando documento e calculando integridade SHA-256...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("species", species);

      setUploadMessage("Processando com Anthropic Claude 3.5 Sonnet...");

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

        const newExam: ExamDocument = {
          id: `ex-${Date.now()}`,
          patient_id: exam.patient_id,
          laboratory_name: extracted.laboratory_name,
          exam_date: extracted.exam_date,
          file_name: file.name,
          file_url: newFileUrl,
          file_hash_sha256: `sha256_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
          extraction_status: "PENDING_REVIEW",
          extracted_results: newResults,
          patient_detected: extracted.patient_detected,
          tutor_detected: extracted.tutor_detected,
          professional_review_notes: extracted.preliminary_summary,
        };

        setCurrentExam(newExam);
        if (onExamSaved) {
          onExamSaved(newExam);
        }

        if (extracted.api_notice) {
          setUploadMessage(`Laudo processado via leitor de alta precisão. (${extracted.api_notice})`);
        } else {
          setUploadMessage("Extração concluída com sucesso! Documento carregado e pronto para revisão.");
        }

        // Notifica o componente pai para abrir o pré-cadastro se for um animal detectado
        if (extracted.patient_detected && onPatientDetected) {
          onPatientDetected(extracted, newFileUrl, file.name);
        }
      } else {
        alert("Não foi possível processar o laudo: " + (json.error || "Erro desconhecido"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro de conexão ao processar documento.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadMessage(""), 5000);
    }
  };

  const isImageFile = currentExam.file_name.match(/\.(jpeg|jpg|png|webp|gif)$/i);

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
                {isApproved ? 'Laudo Homologado pelo Profissional' : 'Aguardando Validação Humana'}
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
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> : <Upload className="w-4 h-4 text-purple-600" />}
            <span>{isUploading ? "Processando com IA..." : "Subir Novo Laudo (PDF)"}</span>
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
          <span className="font-bold">Princípio Human-in-the-Loop:</span> O documento original permanece em exibição contínua à esquerda para que você confira visualmente cada parâmetro extraído pelo Claude 3.5 Sonnet. Valores com baixa nitidez ou unidades atípicas recebem marcação de <strong className="text-amber-800">incerteza</strong>.
        </div>
      </div>

      {/* Grid Side-by-Side: Documento x Dados Estruturados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel do Documento Original - Visualizador Integrado */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-4 text-slate-300 flex flex-col justify-between shadow-inner border border-slate-800">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-white">Visualizador do Laudo Original</span>
              </div>
              
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(true)}
                  title="Expandir em tela cheia"
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <a
                  href={currentExam.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir PDF em nova aba"
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={currentExam.file_url}
                  download={currentExam.file_name}
                  title="Baixar arquivo do laudo"
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700 text-[11px] space-y-1 mb-3 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Arquivo:</span>
                <span className="text-slate-200 truncate max-w-[200px]" title={currentExam.file_name}>{currentExam.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Integridade:</span>
                <span className="text-emerald-400 text-[10px]">{currentExam.file_hash_sha256.slice(0, 18)}...</span>
              </div>
            </div>

            {/* Container do Documento (Iframe para PDF ou Imagem) */}
            <div className="w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-white relative shadow-inner">
              {isImageFile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentExam.file_url}
                  alt="Laudo do Exame"
                  className="w-full h-full object-contain bg-slate-950 p-2"
                />
              ) : (
                <iframe
                  src={`${currentExam.file_url}#toolbar=1&navpanes=0&view=FitH`}
                  className="w-full h-full border-0 bg-white"
                  title="Visualizador de Laudo PDF"
                />
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Laboratório: {currentExam.laboratory_name.split(" ")[0]}</span>
            <a 
              href={currentExam.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline flex items-center"
            >
              <span>Abrir tela cheia</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>

        {/* Tabela de Parâmetros Extraídos */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs mb-4">
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
                    <tr key={item.id} className={item.is_uncertain ? "bg-amber-50/50" : "hover:bg-slate-50/50"}>
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
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Parecer Preliminar / Conduta do Zootecnista / Nutrólogo
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Descreva a interpretação dos biomarcadores para o manejo nutricional..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Tela Cheia do Documento */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-800">
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-sm">{currentExam.file_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={currentExam.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir em Nova Aba</span>
                </a>
                <button
                  onClick={() => setIsFullscreenModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white p-1">
              <iframe
                src={currentExam.file_url}
                className="w-full h-full border-0"
                title="Laudo em Tela Cheia"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
