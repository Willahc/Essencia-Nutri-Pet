import { StoolScore, AppetiteLevel, TutorDailyLog } from "@/types";

export interface StoolScoreInfo {
  score: StoolScore;
  title: string;
  shortLabel: string;
  description: string;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'WARNING' | 'ALERT' | 'CRITICAL';
  badgeClass: string;
  emoji: string;
}

export const STOOL_SCORE_DEFINITIONS: Record<StoolScore, StoolScoreInfo> = {
  1: {
    score: 1,
    title: "Grau 1 - Cíbalos Ressecados e Duros",
    shortLabel: "Ressecada / Bolinhas",
    description: "Fezes duras, em pequenos segmentos ou bolinhas. Indica constipação ou necessidade de maior ingestão hídrica/fibras solúveis.",
    status: "WARNING",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    emoji: "🪨",
  },
  2: {
    score: 2,
    title: "Grau 2 - Firme e Bem Formada (Padrão Ouro)",
    shortLabel: "Ideal / Firme",
    description: "Formato cilíndrico perfeito, umidade equilibrada, fácil de recolher sem deixar resíduos no solo. Digestibilidade e microbiota excelentes.",
    status: "OPTIMAL",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
    emoji: "✨",
  },
  3: {
    score: 3,
    title: "Grau 3 - Úmida com Forma Preservada",
    shortLabel: "Úmida / Macia",
    description: "Mantém o formato, porém com textura macia e brilhante, deixando leve marca no piso ou grama ao recolher.",
    status: "ACCEPTABLE",
    badgeClass: "bg-yellow-100 text-yellow-900 border-yellow-300",
    emoji: "💧",
  },
  4: {
    score: 4,
    title: "Grau 4 - Pastosa e Amorfa (Diarreia Leve)",
    shortLabel: "Pastosa / Sem forma",
    description: "Perda da consistência e forma definida. Não é possível recolher sem espalhar. Alerta para adaptação do microbioma ou intolerância.",
    status: "ALERT",
    badgeClass: "bg-orange-100 text-orange-900 border-orange-300",
    emoji: "⚠️",
  },
  5: {
    score: 5,
    title: "Grau 5 - Líquida / Aquosa (Diarreia Severa)",
    shortLabel: "Líquida / Aquosa",
    description: "Diarreia líquida sem resíduo sólido. Risco de perda eletrolítica e desidratação. Requer atenção veterinária imediata.",
    status: "CRITICAL",
    badgeClass: "bg-rose-100 text-rose-900 border-rose-300",
    emoji: "🚨",
  },
};

export interface TransitionStepInfo {
  dayNumber: number;
  totalDays: number;
  percentNewDiet: number;
  percentOldDiet: number;
  phaseLabel: string;
  guidance: string;
}

export function getTransitionStepInfo(dayNumber: number, totalDays: number = 7): TransitionStepInfo {
  const clampedDay = Math.max(1, dayNumber);
  
  if (totalDays <= 7) {
    if (clampedDay <= 2) {
      return {
        dayNumber: clampedDay,
        totalDays,
        percentNewDiet: 25,
        percentOldDiet: 75,
        phaseLabel: "Fase 1: Introdução Suave",
        guidance: "Oferecer 25% da nova dieta misturada a 75% da alimentação anterior. Permite que as enzimas digestivas se acostumem.",
      };
    } else if (clampedDay <= 4) {
      return {
        dayNumber: clampedDay,
        totalDays,
        percentNewDiet: 50,
        percentOldDiet: 50,
        phaseLabel: "Fase 2: Equilíbrio Intermediário",
        guidance: "Metade (50%) da porção com a nova dieta e metade (50%) com a dieta antiga.",
      };
    } else if (clampedDay <= 6) {
      return {
        dayNumber: clampedDay,
        totalDays,
        percentNewDiet: 75,
        percentOldDiet: 25,
        phaseLabel: "Fase 3: Consolidação",
        guidance: "Maior parte (75%) na nova dieta e apenas 25% na antiga. Observe se as fezes permanecem firmes (Grau 2).",
      };
    } else {
      return {
        dayNumber: clampedDay,
        totalDays,
        percentNewDiet: 100,
        percentOldDiet: 0,
        phaseLabel: "Fase 4: Nova Dieta Exclusiva",
        guidance: "Transição concluída com sucesso! 100% da nova formulação aprovada pelo especialista.",
      };
    }
  } else {
    // Cronograma estendido (10 a 14 dias - para animais sensíveis ou renais)
    if (clampedDay <= 3) {
      return {
        dayNumber: clampedDay,
        totalDays,
        percentNewDiet: 25,
        percentOldDiet: 75,
        phaseLabel: "Fase 1: Adaptação Inicial Prolongada",
        guidance: "25% nova dieta e 75% dieta anterior. Preserva o apetite e a estabilidade entérica.",
      };
    } else if (clampedDay <= 6) {
      return {
        dayNumber: clampedDay,
        totalDays,
        percentNewDiet: 50,
        percentOldDiet: 50,
        phaseLabel: "Fase 2: Transição Intermediária",
        guidance: "50% nova dieta e 50% dieta anterior divididos igualmente nas refeições.",
      };
    } else if (clampedDay <= 9) {
      return {
        dayNumber: clampedDay,
        totalDays,
        percentNewDiet: 75,
        percentOldDiet: 25,
        phaseLabel: "Fase 3: Quase Completa",
        guidance: "75% nova dieta e 25% anterior. Excelente momento para checar o escore corporal.",
      };
    } else {
      return {
        dayNumber: clampedDay,
        totalDays,
        percentNewDiet: 100,
        percentOldDiet: 0,
        phaseLabel: "Fase 4: Adaptação Plena",
        guidance: "100% nova dieta prescrita.",
      };
    }
  }
}

export interface AdherenceMetrics {
  totalLogs: number;
  averageWaterMl: number;
  optimalStoolPercentage: number;
  hasRecentAlert: boolean;
  alertReason?: string;
  averageAppetiteScore: string;
}

export function calculateAdherenceMetrics(logs: TutorDailyLog[]): AdherenceMetrics {
  if (!logs || logs.length === 0) {
    return {
      totalLogs: 0,
      averageWaterMl: 0,
      optimalStoolPercentage: 100,
      hasRecentAlert: false,
      averageAppetiteScore: "NORMAL",
    };
  }

  const totalLogs = logs.length;
  const totalWater = logs.reduce((acc, l) => acc + (l.water_intake_ml || 0), 0);
  const optimalStoolCount = logs.filter((l) => l.stool_score === 2).length;
  const optimalStoolPercentage = Math.round((optimalStoolCount / totalLogs) * 100);

  // Verifica registros dos últimos 2 dias para alertas críticos
  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentLogs = sorted.slice(0, 2);

  let hasRecentAlert = false;
  let alertReason: string | undefined;

  for (const log of recentLogs) {
    if (log.stool_score >= 4) {
      hasRecentAlert = true;
      alertReason = `Fezes pastosas/líquidas (Grau ${log.stool_score}) registradas em ${log.date}. Recomenda-se desacelerar a transição ou entrar em contato.`;
      break;
    }
    if (log.vomiting_episodes >= 1) {
      hasRecentAlert = true;
      alertReason = `${log.vomiting_episodes} episódio(s) de vômito registrado(s) em ${log.date}.`;
      break;
    }
    if (log.appetite === 'REFUSED') {
      hasRecentAlert = true;
      alertReason = `Recusa alimentar reportada em ${log.date}.`;
      break;
    }
  }

  return {
    totalLogs,
    averageWaterMl: Math.round(totalWater / totalLogs),
    optimalStoolPercentage,
    hasRecentAlert,
    alertReason,
    averageAppetiteScore: "Normal",
  };
}
