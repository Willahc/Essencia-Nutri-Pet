"use client";

import React, { useState } from "react";
import { AppointmentType, AppointmentRecord, MeasurementRecord, BodyConditionScore, Patient } from "@/types";
import { X, Calendar, Scale, Activity, PlusCircle, Check } from "lucide-react";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (appointment: AppointmentRecord, measurement: MeasurementRecord) => void;
}

export function NewAppointmentModal({ isOpen, onClose, patient, onSave }: NewAppointmentModalProps) {
  const [type, setType] = useState<AppointmentType>("RETORNO");
  const [weight, setWeight] = useState<number>(patient.current_weight_kg);
  const [bcs, setBcs] = useState<BodyConditionScore>(patient.current_bcs);
  const [abdominalCirc, setAbdominalCirc] = useState<number>(78);
  const [thoracicCirc, setThoracicCirc] = useState<number>(87);
  const [notes, setNotes] = useState<string>("");
  const [dietRecommendation, setDietRecommendation] = useState<string>("");
  const [appetite, setAppetite] = useState<"NORMAL" | "INCREASED" | "DECREASED">("NORMAL");
  const [stool, setStool] = useState<"NORMAL" | "SOFT" | "DIARRHEA" | "HARD">("NORMAL");
  const [vomiting, setVomiting] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAppointmentId = `apt-${Date.now()}`;
    const newMeasurementId = `m-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newAppointment: AppointmentRecord = {
      id: newAppointmentId,
      patient_id: patient.id,
      professional_id: "pro-1",
      professional_name: "Dr. Roberto Almeida (CRZ 4821)",
      type: type,
      status: "FINALIZADO",
      occurred_at: nowIso,
      version: 1,
      notes: notes || "Retorno clínico realizado com sucesso. Parâmetros clínicos e adesão registrados.",
      anamnesis: {
        reported_appetite: appetite,
        water_intake: "NORMAL",
        stool_consistency: stool,
        vomiting_episodes_per_week: vomiting,
        treats_habits: "Conforme protocolo nutricional estabelecido.",
      },
      diet_recommendation: dietRecommendation || "Manter porções da fase vigente com ajuste fino conforme curva ponderal.",
      created_at: nowIso,
    };

    const newMeasurement: MeasurementRecord = {
      id: newMeasurementId,
      patient_id: patient.id,
      appointment_id: newAppointmentId,
      date: nowIso.split("T")[0],
      weight_kg: Number(weight),
      bcs: bcs,
      abdominal_circumference_cm: abdominalCirc,
      thoracic_circumference_cm: thoracicCirc,
      measured_by: "Dr. Roberto Almeida (CRZ 4821)",
      notes: `Atendimento de ${type}. Peso aferido: ${weight}kg, ECC: ${bcs}/9.`
    };

    onSave(newAppointment, newMeasurement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92dvh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        <div className="bg-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Registrar Novo Atendimento</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">Paciente: {patient.name} • Histórico Append-Only</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto touch-scroll flex-1">
          {/* Tipo de Atendimento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "RETORNO", label: "Retorno" },
              { id: "REAVALIACAO_NUTRICIONAL", label: "Reavaliação" },
              { id: "CONSULTORIA_NUTRICIONAL", label: "Consultoria" },
              { id: "CONSULTA", label: "Consulta" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id as AppointmentType)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  type === item.id 
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" 
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Biometria e Pesagem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Peso Aferido Hoje (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Escore Corporal (ECC: {bcs}/9)
              </label>
              <input
                type="range"
                min="1"
                max="9"
                value={bcs}
                onChange={(e) => setBcs(Number(e.target.value) as BodyConditionScore)}
                className="w-full mt-2 accent-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Circunferência Abdominal (cm)
              </label>
              <input
                type="number"
                value={abdominalCirc}
                onChange={(e) => setAbdominalCirc(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Circunferência Torácica (cm)
              </label>
              <input
                type="number"
                value={thoracicCirc}
                onChange={(e) => setThoracicCirc(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Anamnese Rápida */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Apetite Relatado</label>
              <select
                value={appetite}
                onChange={(e) => setAppetite(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option value="NORMAL">Normal / Voraz</option>
                <option value="INCREASED">Aumentado</option>
                <option value="DECREASED">Diminuído / Seletivo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fezes</label>
              <select
                value={stool}
                onChange={(e) => setStool(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option value="NORMAL">Normal (Escore 2-3)</option>
                <option value="SOFT">Amolecida</option>
                <option value="DIARRHEA">Diarreia</option>
                <option value="HARD">Ressecada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emeses / Semana</label>
              <input
                type="number"
                min="0"
                value={vomiting}
                onChange={(e) => setVomiting(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Observações Clínicas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notas do Atendimento & Evolução
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva o estado do paciente, relato do tutor e exame físico..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Conduta Nutricional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Conduta Nutricional Prescrita
            </label>
            <textarea
              rows={2}
              value={dietRecommendation}
              onChange={(e) => setDietRecommendation(e.target.value)}
              placeholder="Ajuste nas gramaturas, inclusão de fibras solúveis ou manutenção do plano vigente..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:space-x-3 pt-3 sm:pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Atendimento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
