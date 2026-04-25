import { NextResponse } from "next/server";
import { orchestrateSwitch } from "@/lib/agents/orchestrator";
import { switchRequestSchema } from "@/lib/schemas/api.schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { comparison, autonomyLevel } = switchRequestSchema.parse(body);

    if (comparison.action !== "switch") {
      return NextResponse.json(
        { error: "Cette comparaison est en attente et ne peut pas être switchée." },
        { status: 409 },
      );
    }

    if (!comparison.bestOffer?.id) {
      return NextResponse.json({ error: "Aucune offre à activer" }, { status: 409 });
    }

    const switchState = await orchestrateSwitch(
      comparison.bestOffer.id,
      autonomyLevel,
      comparison.annualSavingsEur,
    );

    return NextResponse.json({ switchState });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Simulation de switch impossible" },
      { status: 500 },
    );
  }
}
