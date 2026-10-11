import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      patient_id,
      appointment_id,
      laboratory_name,
      exam_date,
      file_name,
      file_url,
      file_hash_sha256,
      extraction_status = "REVIEWED_APPROVED",
      extracted_results = [],
      patient_detected,
      tutor_detected,
      professional_review_notes,
      reviewed_by = "Dra. Veronica Correia Pitorri",
    } = body;

    const exam = await prisma.examDocument.upsert({
      where: { id: id || `ex-${Date.now()}` },
      update: {
        extractionStatus: extraction_status,
        professionalNotes: professional_review_notes,
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewed_by,
        extractedResultsJson: JSON.stringify(extracted_results),
      },
      create: {
        id: id || `ex-${Date.now()}`,
        patientId: patient_id,
        appointmentId: appointment_id,
        laboratoryName: laboratory_name || "Laboratório Veterinário",
        examDate: exam_date || new Date().toISOString().split("T")[0],
        fileName: file_name || "laudo.pdf",
        fileUrl: file_url || "/exams/laudo.pdf",
        fileHashSha256: file_hash_sha256,
        extractionStatus: extraction_status,
        professionalNotes: professional_review_notes,
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewed_by,
        extractedResultsJson: JSON.stringify(extracted_results),
        patientDetectedJson: patient_detected ? JSON.stringify(patient_detected) : null,
        tutorDetectedJson: tutor_detected ? JSON.stringify(tutor_detected) : null,
      },
    });

    return NextResponse.json({ success: true, data: exam });
  } catch (error: any) {
    console.error("Erro ao salvar exame:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao salvar exame" },
      { status: 500 }
    );
  }
}
