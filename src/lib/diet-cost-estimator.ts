import { NutritionPlan, Species } from "@/types";
import { getIngredientCookingFactor } from "@/lib/diet-formulation";

export interface IngredientCostItem {
  name: string;
  dailyCookedGrams: number;
  dailyRawGrams: number;
  monthlyRawKg: number;
  unitPricePerKgBrl: number;
  monthlyCostBrl: number;
}

export interface DietCostComparison {
  dailyNaturalCostBrl: number;
  monthlyNaturalCostBrl: number;
  supplementsMonthlyCostBrl: number;
  totalMonthlyNaturalDietBrl: number;
  naturalIngredientsBreakdown: IngredientCostItem[];

  // Comparativo com Ração Comercial Seca
  kibbleDailyGrams: number;
  kibbleMonthlyKg: number;
  therapeuticKibbleMonthlyCostBrl: number;
  maintenanceKibbleMonthlyCostBrl: number;

  // Análise Financeira
  differenceTherapeuticBrl: number;
  percentageVsTherapeutic: number;
  isNaturalCheaperThanTherapeutic: boolean;

  // Benefícios Zootécnicos e ROI em Saúde
  moistureAdvantageLitersPerMonth: number;
  preventiveHealthRoiSummary: string;
}

// Preços médios de referência de mercado (R$ / kg ou R$ / unidade)
export const DEFAULT_MARKET_PRICES: Record<string, number> = {
  frango: 22.0,
  patinho: 38.0,
  carne: 36.0,
  suíno: 26.0,
  suino: 26.0,
  lombo: 28.0,
  tilápia: 42.0,
  tilapia: 42.0,
  peixe: 40.0,
  coelho: 68.0,
  cordeiro: 60.0,
  ovo: 16.0,
  clara: 18.0,
  arroz: 6.5,
  batata: 7.0,
  mandioca: 7.5,
  inhame: 9.0,
  mandioquinha: 12.0,
  aveia: 10.0,
  abóbora: 6.0,
  abobora: 6.0,
  chuchu: 5.5,
  abobrinha: 7.0,
  cenoura: 6.5,
  brócolis: 14.0,
  brocolis: 14.0,
  azeite: 45.0,
};

function getPriceForIngredient(name: string): number {
  const lower = name.toLowerCase();
  for (const [key, price] of Object.entries(DEFAULT_MARKET_PRICES)) {
    if (lower.includes(key)) return price;
  }
  return 15.0; // fallback padrão
}

/**
 * Calcula o custo estimado da alimentação natural prescrita e compara com rações comerciais
 */
export function calculateDietCostComparison(
  plan: NutritionPlan,
  species: Species = "CANINE",
  customSupplementDailyCostBrl: number = 3.0
): DietCostComparison {
  const items = plan.items || [];
  let dailyIngredientsCost = 0;

  const breakdown: IngredientCostItem[] = items.map((item) => {
    const { factor } = getIngredientCookingFactor(item.ingredient_name, item.category);
    const dailyCookedGrams = item.quantity_grams;
    const dailyRawGrams = Math.round(dailyCookedGrams * factor);
    const monthlyRawKg = Number(((dailyRawGrams * 30) / 1000).toFixed(2));
    const unitPrice = getPriceForIngredient(item.ingredient_name);
    const monthlyCost = Number((monthlyRawKg * unitPrice).toFixed(2));

    dailyIngredientsCost += monthlyCost / 30;

    return {
      name: item.ingredient_name,
      dailyCookedGrams,
      dailyRawGrams,
      monthlyRawKg,
      unitPricePerKgBrl: unitPrice,
      monthlyCostBrl: monthlyCost,
    };
  });

  const dailyNaturalCostBrl = Number(dailyIngredientsCost.toFixed(2));
  const monthlyNaturalCostBrl = Number((dailyNaturalCostBrl * 30).toFixed(2));
  const supplementsMonthlyCostBrl = Number((customSupplementDailyCostBrl * 30).toFixed(2));
  const totalMonthlyNaturalDietBrl = Number((monthlyNaturalCostBrl + supplementsMonthlyCostBrl).toFixed(2));

  // Equivalente em Ração Comercial
  // Densidade energética média de ração seca: 3.75 kcal por grama (3750 kcal/kg)
  const targetKcal = plan.daily_energy_kcal || 600;
  const kibbleDailyGrams = Math.round(targetKcal / 3.75);
  const kibbleMonthlyKg = Number(((kibbleDailyGrams * 30) / 1000).toFixed(2));

  // Preço de Ração Coadjuvante Terapêutica (Renal, Hipoalergênica, Gastro) ~ R$ 52/kg
  const therapeuticPricePerKg = species === "FELINE" ? 68.0 : 54.0;
  // Preço de Ração Super Premium Manutenção ~ R$ 28/kg
  const maintenancePricePerKg = species === "FELINE" ? 38.0 : 28.0;

  const therapeuticKibbleMonthlyCostBrl = Number((kibbleMonthlyKg * therapeuticPricePerKg).toFixed(2));
  const maintenanceKibbleMonthlyCostBrl = Number((kibbleMonthlyKg * maintenancePricePerKg).toFixed(2));

  const differenceTherapeuticBrl = Number((therapeuticKibbleMonthlyCostBrl - totalMonthlyNaturalDietBrl).toFixed(2));
  const percentageVsTherapeutic = Number(
    (((totalMonthlyNaturalDietBrl - therapeuticKibbleMonthlyCostBrl) / (therapeuticKibbleMonthlyCostBrl || 1)) * 100).toFixed(1)
  );
  const isNaturalCheaperThanTherapeutic = totalMonthlyNaturalDietBrl <= therapeuticKibbleMonthlyCostBrl;

  // Vantagem de Hidratação
  // Dieta natural tem ~75% de umidade, ração seca tem 10%
  // Volume diário de alimentos consumido:
  const dailyTotalFoodGrams = items.reduce((acc, i) => acc + i.quantity_grams, 0);
  const dailyWaterFromFoodMl = dailyTotalFoodGrams * 0.75;
  const moistureAdvantageLitersPerMonth = Number(((dailyWaterFromFoodMl * 30) / 1000).toFixed(1));

  const preventiveHealthRoiSummary = isNaturalCheaperThanTherapeutic
    ? `A Alimentação Natural custa R$ ${Math.abs(differenceTherapeuticBrl).toFixed(2)} A MENOS por mês do que uma ração terapêutica coadjuvante comercial, entregando +${moistureAdvantageLitersPerMonth} litros de hidratação biológica mensal ao paciente.`
    : `A Alimentação Natural apresenta custo comparável ao de rações comerciais terapêuticas importadas, com a vantagem decisiva de fornecer +${moistureAdvantageLitersPerMonth} litros de água orgânica por mês, diminuindo significativamente internações por crises urêmicas e cálculos urinários.`;

  return {
    dailyNaturalCostBrl,
    monthlyNaturalCostBrl,
    supplementsMonthlyCostBrl,
    totalMonthlyNaturalDietBrl,
    naturalIngredientsBreakdown: breakdown,
    kibbleDailyGrams,
    kibbleMonthlyKg,
    therapeuticKibbleMonthlyCostBrl,
    maintenanceKibbleMonthlyCostBrl,
    differenceTherapeuticBrl,
    percentageVsTherapeutic,
    isNaturalCheaperThanTherapeutic,
    moistureAdvantageLitersPerMonth,
    preventiveHealthRoiSummary,
  };
}
