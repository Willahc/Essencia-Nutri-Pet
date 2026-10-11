import fs from "fs";
import path from "path";
import os from "os";
import { spawnSync } from "child_process";

export interface PdfTextExtraction {
  success: boolean;
  full_text?: string;
  num_pages?: number;
  error?: string;
}

export function extractPdfText(buffer: Buffer): PdfTextExtraction {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `exam_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`);

  try {
    fs.writeFileSync(tempFilePath, buffer);

    const scriptPath = path.resolve(process.cwd(), "scripts", "extract_pdf.py");
    const pythonBin = process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");
    const result = spawnSync(pythonBin, [scriptPath, tempFilePath], {
      encoding: "utf-8",
      timeout: 15000,
    });

    if (result.error) {
      console.warn("Aviso ao executar Python para PDF:", result.error.message);
      return { success: false, error: result.error.message };
    }

    if (result.status !== 0) {
      console.warn("Erro no script Python de extração:", result.stderr);
      return { success: false, error: result.stderr };
    }

    const output = JSON.parse(result.stdout);
    return output as PdfTextExtraction;
  } catch (err: any) {
    console.warn("Erro ao extrair texto do PDF:", err.message);
    return { success: false, error: err.message };
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch {
      // Ignora erro de cleanup
    }
  }
}
