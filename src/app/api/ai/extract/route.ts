import { NextRequest, NextResponse } from "next/server";
import { processExamDocument } from "@/lib/ai-extractor";
import { Species } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const species = (formData.get("species") as Species) || "CANINE";

    const fileName = file ? file.name : "exame_laboratorial.pdf";
    const fileMimeType = file ? file.type : "application/pdf";

    // Buffer do arquivo para processamento multimodal
    let fileBuffer: Buffer | undefined;
    if (file) {
      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
    }

    const extraction = await processExamDocument({
      fileBuffer,
      fileName,
      fileMimeType,
      species,
      apiKey: process.env.GEMINI_API_KEY,
    });

    return NextResponse.json({
      success: true,
      data: extraction,
    });
  } catch (error: any) {
    console.error("Erro na rota de extração de exame:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Falha interna no processamento do laudo." },
      { status: 500 }
    );
  }
}
