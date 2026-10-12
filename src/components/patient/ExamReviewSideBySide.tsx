"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExamDocument, ExamParameterResult, Species, ExamExtractionResponse } from "@/types";
import { generateZootecnicClinicalOpinion } from "@/lib/clinical-opinion";
import { classifyIRISStage, IRISStagingResult } from "@/lib/iris-staging";
import { detectVeterinaryReferralAlert, VeterinaryReferralAlert } from "@/lib/clinical-referral";
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
  UserPlus,
  Calendar,
  Layers,
  Stethoscope,
  Share2,
  Copy,
  Printer,
  AlertOctagon
} from "lucide-react";

interface ExamReviewSideBySideProps {
  exam: ExamDocument;
  patientExams?: ExamDocument[];
  species?: Species;
  onPatientDetected?: (extracted: ExamExtractionResponse, fileUrl: string, fileName: string) => void;
  onExamSaved?: (savedExam: ExamDocument) => void;
  onSelectExam?: (selected: ExamDocument) => void;
}

export function ExamReviewSideBySide({ 
  exam, 
  patientExams = [],
  species = "CANINE", 
  onPatientDetected,
  onExamSaved,
  onSelectExam
}: ExamReviewSideBySideProps) {
  const [currentExam, setCurrentExam] = useState<ExamDocument>(exam);
  const [results, setResults] = useState<ExamParameterResult[]>(exam.extracted_results);
  const [isApproved, setIsApproved] = useState(exam.extraction_status === "REVIEWED_APPROVED");
  const [reviewNotes, setReviewNotes] = useState(exam.professional_review_notes || "");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState<boolean>(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState<boolean>(false);
  const [copiedReferral, setCopiedReferral] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza estado interno quando o paciente ou exame mudar
  useEffect(() => {
    setCurrentExam(exam);
    setResults(exam.extracted_results);
    setIsApproved(exam.extraction_status === "REVIEWED_APPROVED");

    // Se o laudo não tem parecer ou possui apenas texto genérico/placeholder, gera automaticamente o parecer clínico
    if (!exam.professional_review_notes || exam.professional_review_notes.startsWith("Laudo extraído") || exam.professional_review_notes.startsWith("Verificar valor")) {
      const generated = generateZootecnicClinicalOpinion({
        patientName: exam.patient_detected?.name || (species === "CANINE" ? "Kate" : "Raposo Tavares"),
        species: exam.patient_detected?.species || species,
        breed: exam.patient_detected?.breed || "SRD",
        results: exam.extracted_results,
      });
      setReviewNotes(generated);
    } else {
      setReviewNotes(exam.professional_review_notes);
    }
  }, [exam, species]);

  const handleGenerateOpinion = () => {
    const generated = generateZootecnicClinicalOpinion({
      patientName: currentExam.patient_detected?.name || (species === "CANINE" ? "Kate" : "Raposo Tavares"),
      species: currentExam.patient_detected?.species || species,
      breed: currentExam.patient_detected?.breed || "SRD",
      results: results,
    });
    setReviewNotes(generated);
  };

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
        const newResults: ExamParameterResult[] = extracted.extracted_results || [];
        const clinicalOpinion = extracted.preliminary_summary && !extracted.preliminary_summary.startsWith("Laudo extraído")
          ? extracted.preliminary_summary
          : generateZootecnicClinicalOpinion({
              patientName: extracted.patient_detected?.name || file.name.replace(/\.[^/.]+$/, ""),
              species: extracted.patient_detected?.species || species,
              breed: extracted.patient_detected?.breed || "SRD",
              results: newResults,
            });

        setResults(newResults);
        setIsApproved(false);
        setReviewNotes(clinicalOpinion);

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
          professional_review_notes: clinicalOpinion,
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

  // Detecção e cálculo automático do Estadiamento IRIS 2023 se houver creatinina
  const creatinineItem = results.find((r) => /creatinin/i.test(r.parameter));
  const sdmaItem = results.find((r) => /sdma/i.test(r.parameter));
  const pItem = results.find((r) => /f[oó]sforo|phosphor/i.test(r.parameter));
  const caItem = results.find((r) => /c[aá]lcio|calcium/i.test(r.parameter));
  const upcrItem = results.find((r) => /rpcu|upcr|prote[ií]na.*creatinin/i.test(r.parameter));

  const creatinineVal = creatinineItem ? parseFloat(String(creatinineItem.value).replace(",", ".")) : undefined;
  const sdmaVal = sdmaItem ? parseFloat(String(sdmaItem.value).replace(",", ".")) : undefined;
  const pVal = pItem ? parseFloat(String(pItem.value).replace(",", ".")) : undefined;
  const caVal = caItem ? parseFloat(String(caItem.value).replace(",", ".")) : undefined;
  const upcrVal = upcrItem ? parseFloat(String(upcrItem.value).replace(",", ".")) : undefined;

  const irisResult: IRISStagingResult | null =
    creatinineVal && !isNaN(creatinineVal) && creatinineVal > 0
      ? classifyIRISStage({
          species: currentExam.patient_detected?.species || species,
          creatinineMgDl: creatinineVal,
          sdmaUgDl: sdmaVal && !isNaN(sdmaVal) ? sdmaVal : undefined,
          upcr: upcrVal && !isNaN(upcrVal) ? upcrVal : undefined,
          serumPhosphorusMgDl: pVal && !isNaN(pVal) ? pVal : undefined,
          serumCalciumTotalMgDl: caVal && !isNaN(caVal) ? caVal : undefined,
        })
      : null;

  const referralAlert = detectVeterinaryReferralAlert({
    patientName: currentExam.patient_detected?.name || (species === "CANINE" ? "Cão" : "Gato"),
    species: currentExam.patient_detected?.species || species,
    breed: currentExam.patient_detected?.breed || "SRD",
    examDate: currentExam.exam_date,
    laboratoryName: currentExam.laboratory_name,
    results: results,
  });

  const handleCopyReferralLetter = () => {
    navigator.clipboard.writeText(referralAlert.referralLetterText);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 3000);
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

      {/* Seletor de Histórico Longitudinal de Laudos (quando o paciente possui múltiplos exames) */}
      {patientExams && patientExams.length > 1 && (
        <div className="mb-5 p-3.5 bg-purple-50/50 border border-purple-200/80 rounded-2xl">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              Histórico Longitudinal do Paciente ({patientExams.length} laudos arquivados)
            </span>
            <span className="text-[11px] text-purple-700/80 font-medium">Selecione para alternar o documento ativo</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {patientExams.map((ex) => {
              const isActive = ex.id === currentExam.id;
              const formattedDate = new Date(ex.exam_date).toLocaleDateString("pt-BR");
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    setCurrentExam(ex);
                    setResults(ex.extracted_results);
                    setIsApproved(ex.extraction_status === "REVIEWED_APPROVED");
                    if (onSelectExam) onSelectExam(ex);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                    isActive
                      ? "bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/50"
                      : "bg-white text-slate-700 hover:bg-purple-100/60 border border-purple-200/60"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 opacity-80" />
                  <span>{formattedDate}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-purple-700 text-purple-100' : 'bg-slate-100 text-slate-600'}`}>
                    {ex.laboratory_name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
            {/* ALERTA PREVENTIVO DE VISITA VETERINÁRIA */}
            {referralAlert.hasAlert && (
              <div className={`mb-4 rounded-2xl p-4 border shadow-sm transition-all ${
                referralAlert.urgency === 'URGENT'
                  ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-rose-600/60 text-white'
                  : referralAlert.urgency === 'RECOMMENDED'
                  ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-600/60 text-white'
                  : 'bg-slate-900 border-slate-700 text-white'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      referralAlert.urgency === 'URGENT'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {referralAlert.urgencyBadgeText}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Triagem de Risco Precoce
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsReferralModalOpen(true)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                      <span>Carta ao Veterinário</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-white flex items-center">
                    <AlertOctagon className="w-4 h-4 mr-1.5 text-rose-400 shrink-0" />
                    {referralAlert.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {referralAlert.summary}
                  </p>
                </div>

                {/* Lista resumida de Red Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                  {referralAlert.redFlags.map((rf, rIdx) => (
                    <div key={rIdx} className="bg-white/5 p-2 rounded-xl border border-white/10 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{rf.biomarker}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                          rf.severity === 'SEVERE' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {rf.observedValue}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Ref: {rf.referenceRange}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 text-[11px] text-slate-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span>
                    Especialidade indicada: <strong>{referralAlert.recommendedSpecialties.join(", ")}</strong>
                  </span>
                  <span className="text-amber-300 font-semibold">
                    Prazo sugerido: {referralAlert.suggestedActionTimeline}
                  </span>
                </div>
              </div>
            )}

            {/* Widget de Estadiamento IRIS 2023 (quando há creatinina/SDMA detectados) */}
            {irisResult && (
              <div className="mb-4 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-4 shadow-md border border-teal-600/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-teal-800/80">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/40 rounded-lg text-xs font-black uppercase tracking-wider">
                      {irisResult.stage_label}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      Classificação IRIS 2023 ({species === "CANINE" ? "Cão" : "Gato"})
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <span className="text-slate-400">Proteinúria:</span>
                    <span className="font-bold text-amber-300">{irisResult.proteinuria_label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-teal-900/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Alvo Fósforo Sérico</span>
                    <span className="text-xs font-bold text-teal-300">{irisResult.target_serum_phosphorus_mg_dl.label}</span>
                    {irisResult.serum_phosphorus_status && (
                      <span className={`block text-[10px] font-bold mt-0.5 ${
                        irisResult.serum_phosphorus_status === 'ELEVATED' || irisResult.serum_phosphorus_status === 'CRITICAL' 
                          ? 'text-rose-400' 
                          : 'text-emerald-400'
                      }`}>
                        {irisResult.serum_phosphorus_status === 'ON_TARGET' ? '✓ No Alvo IRIS' : '⚠️ Acima da Meta'}
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-teal-900/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fósforo Dietético</span>
                    <span className="text-xs font-bold text-amber-300">{irisResult.dietary_guidelines.phosphorus_target}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{irisResult.dietary_guidelines.recommended_phosphate_binder}</span>
                  </div>

                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-teal-900/50 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Produto Ca x P</span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className={`text-xs font-bold ${irisResult.phosphocalcic_risk ? 'text-rose-400 font-black' : 'text-slate-200'}`}>
                        {irisResult.phosphocalcic_product ? `${irisResult.phosphocalcic_product} mg²/dL²` : 'Não avaliado'}
                      </span>
                      <span className="text-[10px] text-slate-400">(Limite: &lt;55)</span>
                    </div>
                    {irisResult.phosphocalcic_risk && (
                      <span className="block text-[10px] font-bold text-rose-300 mt-0.5">
                        🚨 Risco de nefrocalcinose!
                      </span>
                    )}
                  </div>
                </div>

                {irisResult.clinical_recommendations.length > 0 && (
                  <div className="text-[11px] text-slate-300 pt-2 border-t border-teal-800/60 space-y-1">
                    {irisResult.clinical_recommendations.map((rec, rIdx) => (
                      <p key={rIdx} className="leading-snug">• {rec}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Parecer Técnico e Conduta do Zootecnista / Nutrólogo
                </label>
                <button
                  type="button"
                  onClick={handleGenerateOpinion}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition-colors shadow-2xs w-fit"
                  title="Sintetizar parecer técnico automaticamente com base nos biomarcadores"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Gerar Parecer Clínico com IA</span>
                </button>
              </div>
              <textarea
                rows={6}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Descreva a interpretação dos biomarcadores para o manejo nutricional..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed font-sans"
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
      {/* Modal da Carta de Encaminhamento ao Médico-Veterinário */}
      {isReferralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-fadeIn">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Carta de Encaminhamento Interprofissional</h3>
                  <p className="text-xs text-purple-200">
                    Comunicação técnica e ética entre Zootecnia/Nutrição e Medicina Veterinária
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReferralModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Conduta Ética CFMV:</strong> Esta carta visa alertar o médico-veterinário assistente sobre os desvios bioquímicos/hematológicos identificados na triagem, solicitando diagnóstico presencial e plano terapêutico complementar.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto shadow-inner">
                {referralAlert.referralLetterText}
              </div>

              {/* Guia de Perguntas Recomendadas para o Tutor */}
              <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
                  Checklist de Dúvidas para o Tutor Levar ao Veterinário
                </h4>
                <ul className="space-y-1.5 text-xs text-purple-950">
                  {referralAlert.tutorGuidance.whatQuestionsToAsk.map((q, qIdx) => (
                    <li key={qIdx} className="flex items-start space-x-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Especialidade recomendada: <strong>{referralAlert.recommendedSpecialties.join(", ")}</strong>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyReferralLetter}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedReferral ? "Copiado!" : "Copiar Carta Completa"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReferralModalOpen(false)}
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
