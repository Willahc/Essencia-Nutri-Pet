"use client";

import React, { useState, useRef } from "react";
import { ExamDocument, Patient, ExamParameterResult } from "@/types";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Trash2,
  UserCheck,
  Building,
  Calendar,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface BatchExamUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  activePatientId?: string;
  onExamsUploaded: (newExams: ExamDocument[]) => void;
}

interface QueuedFileItem {
  id: string;
  file: File;
  name: string;
  sizeFormatted: string;
  status: "QUEUED" | "PROCESSING" | "EXTRACTED" | "ERROR";
  detectedLab?: string;
  detectedDate?: string;
  detectedPatientName?: string;
  matchedPatientId?: string;
  extractedResultsCount?: number;
  results?: ExamParameterResult[];
}

export function BatchExamUploadModal({
  isOpen,
  onClose,
  patients,
  activePatientId,
  onExamsUploaded,
}: BatchExamUploadModalProps) {
  const [queue, setQueue] = useState<QueuedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: QueuedFileItem[] = Array.from(files).map((f, idx) => {
      const sizeKb = (f.size / 1024).toFixed(0);
      const sizeFormatted = f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeKb} KB`;

      // Tenta inferir o nome do pet pelo nome do arquivo
      const lowerName = f.name.toLowerCase();
      const matched = patients.find((p) => lowerName.includes(p.name.toLowerCase()));

      return {
        id: `queue-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        file: f,
        name: f.name,
        sizeFormatted,
        status: "QUEUED",
        matchedPatientId: matched?.id || activePatientId || (patients[0]?.id ?? ""),
        detectedLab: "Laboratório Veterinário Integrado",
        detectedDate: new Date().toISOString().split("T")[0],
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProcessQueue = async () => {
    setIsProcessingAll(true);

    const updatedQueue: QueuedFileItem[] = [];

    for (const item of queue) {
      // Simula / executa a extração por IA
      await new Promise((resolve) => setTimeout(resolve, 600));

      const matchedPat = patients.find((p) => p.id === item.matchedPatientId) || patients[0];
      const isFeline = matchedPat?.species === "FELINE";

      const mockParameters: ExamParameterResult[] = [
        {
          id: `res-c-${Date.now()}`,
          parameter: "Creatinina Sérica",
          category: "BIOCHEMISTRY",
          value: isFeline ? 1.4 : 1.1,
          unit: "mg/dL",
          reference_range: isFeline ? "0.6 - 1.6" : "0.5 - 1.4",
          is_out_of_range: false,
          is_uncertain: false,
          confidence_score: 0.98,
        },
        {
          id: `res-u-${Date.now()}`,
          parameter: "Ureia Sérica",
          category: "BIOCHEMISTRY",
          value: isFeline ? 42 : 38,
          unit: "mg/dL",
          reference_range: "20 - 60",
          is_out_of_range: false,
          is_uncertain: false,
          confidence_score: 0.96,
        },
        {
          id: `res-ht-${Date.now()}`,
          parameter: "Hematócrito (Ht)",
          category: "HEMATOLOGY",
          value: isFeline ? 34 : 42,
          unit: "%",
          reference_range: isFeline ? "28 - 45" : "37 - 55",
          is_out_of_range: false,
          is_uncertain: false,
          confidence_score: 0.99,
        },
      ];

      updatedQueue.push({
        ...item,
        status: "EXTRACTED",
        detectedLab: item.name.includes("Provet") ? "Provet Diagnósticos" : item.name.includes("DrTIS") ? "DrTIS Diagnósticos" : "BioVet Laboratório",
        detectedPatientName: matchedPat?.name || "Paciente Identificado",
        extractedResultsCount: mockParameters.length,
        results: mockParameters,
      });
    }

    setQueue(updatedQueue);
    setIsProcessingAll(false);
  };

  const handleConfirmAndSave = () => {
    const readyItems = queue.filter((i) => i.status === "EXTRACTED");
    if (readyItems.length === 0) return;

    const newExams: ExamDocument[] = readyItems.map((item) => ({
      id: `ex-up-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      patient_id: item.matchedPatientId || activePatientId || patients[0].id,
      laboratory_name: item.detectedLab || "Laboratório Clínico Veterinário",
      exam_date: item.detectedDate || new Date().toISOString().split("T")[0],
      file_name: item.name,
      file_url: `/mock-docs/${item.name}`,
      file_hash_sha256: `sha256_${Date.now()}_${item.name}`,
      extraction_status: "PENDING_REVIEW",
      extracted_results: item.results || [],
      professional_review_notes: `Laudo importado em lote via OCR Supervisionado.`,
    }));

    onExamsUploaded(newExams);
    onClose();
  };

  const allExtracted = queue.length > 0 && queue.every((i) => i.status === "EXTRACTED");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
              <UploadCloud className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900">Upload em Lote & Drag-and-Drop de Laudos</h3>
              <p className="text-xs text-slate-500">
                Arraste múltiplos arquivos PDF ou imagens para extração contínua por IA e vinculação automática.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Área de Drag and Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/50"
                : "border-slate-200 hover:border-emerald-400 bg-slate-50/50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFilesSelected(e.target.files)}
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">
              Arraste e solte seus laudos em PDF aqui ou <span className="text-emerald-600 underline">clique para selecionar</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Suporte a múltiplos laudos de hemograma, bioquímicos, urina e imagem simultaneamente.
            </p>
          </div>

          {/* Fila de Arquivos */}
          {queue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Fila de Processamento ({queue.length} arquivos)</span>
                {queue.some((i) => i.status === "QUEUED") && (
                  <button
                    onClick={handleProcessQueue}
                    disabled={isProcessingAll}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
                  >
                    {isProcessingAll ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Extraindo por IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Iniciar Extração em Lote</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <FileText className="w-5 h-5 text-slate-500 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{item.sizeFormatted}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {/* Seletor do Paciente Vinculado */}
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] text-slate-400">Vincular a:</span>
                        <select
                          value={item.matchedPatientId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQueue((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, matchedPatientId: val } : i))
                            );
                          }}
                          className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-hidden"
                        >
                          {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.species === "CANINE" ? "🐕" : "🐈"})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status */}
                      {item.status === "QUEUED" && (
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                          Na Fila
                        </span>
                      )}
                      {item.status === "PROCESSING" && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" /> Extraindo
                        </span>
                      )}
                      {item.status === "EXTRACTED" && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Pronto ({item.extractedResultsCount} parâm.)
                        </span>
                      )}

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <span className="text-xs text-slate-500">
            {allExtracted ? (
              <strong className="text-emerald-700">✓ Todos os {queue.length} laudos foram processados pela IA!</strong>
            ) : (
              <span>Os laudos serão salvos com status "Pendente de Revisão" no prontuário.</span>
            )}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirmAndSave}
              disabled={!allExtracted}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm ${
                allExtracted
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span>Salvar e Vincular Laudos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
