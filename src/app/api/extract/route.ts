import { NextResponse } from "next/server";
import { orchestrateOcrExtract } from "@/lib/agents/orchestrator";
import { isAllowedBillType } from "@/lib/utils/file";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    if (!isAllowedBillType(file.type)) {
      return NextResponse.json({ error: "Format de facture non supporté" }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux" }, { status: 413 });
    }

    const billData = await orchestrateOcrExtract(file);
    return NextResponse.json({ billData });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("informations tarifaires") || error.message.includes("Tarification"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Extraction OCR impossible" },
      { status: 500 },
    );
  }
}
