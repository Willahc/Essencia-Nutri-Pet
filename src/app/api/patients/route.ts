import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        tutor: true,
        measurements: {
          orderBy: { date: "asc" },
        },
        appointments: {
          orderBy: { occurredAt: "desc" },
        },
        plans: {
          orderBy: { version: "desc" },
        },
        dailyLogs: {
          orderBy: { date: "desc" },
        },
        exams: {
          orderBy: { examDate: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Converte os campos JSON serializados no banco para objetos TypeScript
    const formatted = patients.map((p) => ({
      ...p,
      comorbidities: p.comorbidities ? JSON.parse(p.comorbidities) : [],
      allergies: p.allergies ? JSON.parse(p.allergies) : [],
      appointments: p.appointments.map((a) => ({
        ...a,
        anamnesis: a.anamnesisJson ? JSON.parse(a.anamnesisJson) : {},
      })),
      plans: p.plans.map((pl) => ({
        ...pl,
        items: pl.itemsJson ? JSON.parse(pl.itemsJson) : [],
        supplements: pl.supplementsJson ? JSON.parse(pl.supplementsJson) : [],
      })),
      exams: p.exams.map((ex) => ({
        ...ex,
        extracted_results: ex.extractedResultsJson ? JSON.parse(ex.extractedResultsJson) : [],
        patient_detected: ex.patientDetectedJson ? JSON.parse(ex.patientDetectedJson) : undefined,
        tutor_detected: ex.tutorDetectedJson ? JSON.parse(ex.tutorDetectedJson) : undefined,
      })),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Erro ao buscar pacientes:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      species,
      breed,
      birth_date,
      sex,
      is_neutered,
      ideal_weight_kg,
      current_weight_kg,
      current_bcs = 5,
      avatar_url,
      comorbidities = [],
      allergies = [],
      tutor_name,
      tutor_phone,
      tutor_email,
    } = body;

    // Cria ou vincula tutor
    let tutor = null;
    if (tutor_name) {
      tutor = await prisma.tutor.create({
        data: {
          name: tutor_name,
          phone: tutor_phone || "(11) 99999-9999",
          email: tutor_email || "tutor@exemplo.com",
        },
      });
    } else {
      tutor = await prisma.tutor.findFirst();
    }

    if (!tutor) {
      tutor = await prisma.tutor.create({
        data: {
          name: "Tutor Responsável",
        },
      });
    }

    const patient = await prisma.patient.create({
      data: {
        tutorId: tutor.id,
        name,
        species,
        breed,
        birthDate: birth_date,
        sex,
        isNeutered: Boolean(is_neutered),
        idealWeightKg: Number(ideal_weight_kg),
        currentWeightKg: Number(current_weight_kg),
        currentBcs: Number(current_bcs),
        avatarUrl: avatar_url || (species === "CANINE" ? "🐕" : "🐈"),
        comorbidities: JSON.stringify(comorbidities),
        allergies: JSON.stringify(allergies),
      },
    });

    return NextResponse.json({ success: true, data: patient });
  } catch (error: any) {
    console.error("Erro ao criar paciente:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao criar paciente" },
      { status: 500 }
    );
  }
}
