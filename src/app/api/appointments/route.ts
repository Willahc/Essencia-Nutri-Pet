import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patient_id,
      professional_id = "pro-1",
      professional_name = "Dra. Veronica Correia Pitorri (CRMV 41403)",
      type = "RETORNO",
      status = "FINALIZADO",
      occurred_at = new Date().toISOString(),
      notes,
      anamnesis,
      diet_recommendation,
      weight_kg,
      bcs,
      abdominal_circumference_cm,
      thoracic_circumference_cm,
    } = body;

    // Salva o atendimento append-only
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient_id,
        professionalId: professional_id,
        professionalName: professional_name,
        type,
        status,
        occurredAt: occurred_at,
        notes: notes || "Atendimento clínico registrado.",
        anamnesisJson: JSON.stringify(anamnesis || {}),
        dietRecommendation: diet_recommendation,
      },
    });

    // Salva a pesagem/medição se fornecida
    let measurement = null;
    if (weight_kg) {
      measurement = await prisma.measurement.create({
        data: {
          patientId: patient_id,
          date: occurred_at.split("T")[0],
          weightKg: Number(weight_kg),
          bcs: Number(bcs) || 5,
          abdominalCircumferenceCm: abdominal_circumference_cm ? Number(abdominal_circumference_cm) : null,
          thoracicCircumferenceCm: thoracic_circumference_cm ? Number(thoracic_circumference_cm) : null,
          measuredBy: professional_name,
          notes: notes?.split(".")[0] || "Pesagem em consulta",
        },
      });

      // Atualiza peso atual no paciente
      await prisma.patient.update({
        where: { id: patient_id },
        data: {
          currentWeightKg: Number(weight_kg),
          currentBcs: Number(bcs) || 5,
        },
      });
    }

    return NextResponse.json({ success: true, data: { appointment, measurement } });
  } catch (error: any) {
    console.error("Erro ao salvar atendimento:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao salvar atendimento" },
      { status: 500 }
    );
  }
}
