"use client";

import React, { useState } from "react";
import { DetectedPatientInfo, DetectedTutorInfo, Species, Sex } from "@/types";
import { Sparkles, Check, X, User, HeartPulse, Scale, Calendar, AlertCircle } from "lucide-react";

interface DetectedPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedPatient: DetectedPatientInfo;
  detectedTutor?: DetectedTutorInfo;
  laboratoryName: string;
  examDate: string;
  onConfirm: (patientData: {
    name: string;
    species: Species;
    breed: string;
    sex: Sex;
    is_neutered: boolean;
    current_weight_kg: number;
    ideal_weight_kg: number;
    tutorName: string;
  }) => void;
}

export function DetectedPatientModal({
  isOpen,
  onClose,
  detectedPatient,
  detectedTutor,
  laboratoryName,
  examDate,
  onConfirm,
}: DetectedPatientModalProps) {
  const [name, setName] = useState(detectedPatient.name || "Novo Paciente");
  const [species, setSpecies] = useState<Species>(detectedPatient.species || "CANINE");
  const [breed, setBreed] = useState(detectedPatient.breed || "SRD");
  const [sex, setSex] = useState<Sex>(detectedPatient.sex || "MALE");
  const [isNeutered, setIsNeutered] = useState<boolean>(detectedPatient.is_neutered ?? true);
  const [weight, setWeight] = useState<number>(detectedPatient.weight_kg || (species === "CANINE" ? 15.0 : 4.5));
  const [idealWeight, setIdealWeight] = useState<number>(detectedPatient.weight_kg || (species === "CANINE" ? 14.0 : 4.2));
  const [tutorName, setTutorName] = useState(detectedTutor?.name || "Tutor Responsável");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      name,
      species,
      breed,
      sex,
      is_neutered: isNeutered,
      current_weight_kg: Number(weight),
      ideal_weight_kg: Number(idealWeight),
      tutorName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Cabeçalho do Modal */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              🐾
            </div>
            <div>
              <div className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-white/20 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>IA Detectou Informações Cadastrais</span>
              </div>
              <h3 className="font-extrabold text-lg text-white">Criar Pré-Cadastro do Animal</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 leading-relaxed flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              O laudo do laboratório <strong>{laboratoryName}</strong> continha informações cadastrais de um paciente real. Confirme os dados abaixo para gerar a ficha clínica e vincular o exame automaticamente!
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nome do Animal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome do Animal
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Espécie */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Espécie
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CANINE">Canina (Cão)</option>
                <option value="FELINE">Felina (Gato)</option>
              </select>
            </div>

            {/* Raça */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Raça
              </label>
              <input
                type="text"
                required
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Sexo & Castrado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sexo & Castração
              </label>
              <div className="flex space-x-2">
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                  className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                >
                  <option value="MALE">Macho</option>
                  <option value="FEMALE">Fêmea</option>
                </select>
                <label className="flex items-center text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNeutered}
                    onChange={(e) => setIsNeutered(e.target.checked)}
                    className="mr-1.5 accent-emerald-600 rounded"
                  />
                  Castrado
                </label>
              </div>
            </div>

            {/* Tutor */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome do Tutor / Responsável
              </label>
              <input
                type="text"
                required
                value={tutorName}
                onChange={(e) => setTutorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Peso Atual e Meta */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Peso Atual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Meta de Peso Ideal (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={idealWeight}
                onChange={(e) => setIdealWeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-emerald-800 text-sm font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Ignorar Pré-Cadastro
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Criar Ficha & Abrir Paciente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
