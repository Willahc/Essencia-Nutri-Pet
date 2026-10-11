import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patient_id,
      title,
      feeding_type,
      daily_energy_kcal,
      meals_per_day,
      hydration_target_ml_day,
      transition_plan_days = 7,
      professional_id = "pro-1",
      notes,
      items = [],
      supplements = [],
    } = body;

    // Desativa versões anteriores do plano para o paciente
    await prisma.nutritionPlan.updateMany({
      where: { patientId: patient_id },
      data: { isActive: false },
    });

    // Descobre a última versão
    const lastPlan = await prisma.nutritionPlan.findFirst({
      where: { patientId: patient_id },
      orderBy: { version: "desc" },
    });

    const nextVersion = (lastPlan?.version || 0) + 1;

    const newPlan = await prisma.nutritionPlan.create({
      data: {
        patientId: patient_id,
        version: nextVersion,
        title,
        feedingType: feeding_type,
        dailyEnergyKcal: Number(daily_energy_kcal),
        mealsPerDay: Number(meals_per_day),
        hydrationTargetMlDay: Number(hydration_target_ml_day),
        transitionPlanDays: Number(transition_plan_days),
        professionalId: professional_id,
        isActive: true,
        approvedAt: new Date().toISOString(),
        notes,
        itemsJson: JSON.stringify(items),
        supplementsJson: JSON.stringify(supplements),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newPlan,
        items,
        supplements,
      },
    });
  } catch (error: any) {
    console.error("Erro ao salvar plano nutricional:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao salvar plano nutricional" },
      { status: 500 }
    );
  }
}
