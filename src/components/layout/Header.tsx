"use client";
import React from "react";
import { Activity, ShieldCheck, HeartPulse, User } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-2xs pt-safe">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs shadow-emerald-500/20 shrink-0">
            <HeartPulse className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-extrabold text-base sm:text-xl text-slate-800 tracking-tight">
                Essência Nutri Pet
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                IA
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
              Acompanhamento Nutricional Longitudinal de Cães e Gatos
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden md:flex items-center space-x-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Human-in-the-Loop Ativo</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800">Dr. Roberto Almeida</p>
              <p className="text-[11px] text-slate-500">Zootecnista / Nutrólogo (CRZ 4821)</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 font-semibold text-xs sm:text-sm shadow-2xs">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

