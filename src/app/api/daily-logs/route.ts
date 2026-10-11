import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patient_id,
      date,
      transition_day = 1,
      diet_consumed_percentage = 100,
      water_intake_ml = 500,
      stool_score = 2,
      stool_notes,
      appetite = "NORMAL",
      vomiting_episodes = 0,
      supplements_taken = true,
      treats_given = false,
      notes,
    } = body;

    const log = await prisma.tutorDailyLog.create({
      data: {
        patientId: patient_id,
        date: date || new Date().toISOString().split("T")[0],
        transitionDay: Number(transition_day),
        dietConsumedPercentage: Number(diet_consumed_percentage),
        waterIntakeMl: Number(water_intake_ml),
        stoolScore: Number(stool_score),
        stoolNotes: stool_notes,
        appetite,
        vomitingEpisodes: Number(vomiting_episodes),
        supplementsTaken: Boolean(supplements_taken),
        treatsGiven: Boolean(treats_given),
        notes,
      },
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    console.error("Erro ao salvar diário do tutor:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao salvar diário do tutor" },
      { status: 500 }
    );
  }
}
