import { NextResponse } from "next/server";
import { orchestrateComparison } from "@/lib/agents/orchestrator";
import { compareRequestSchema } from "@/lib/schemas/api.schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { billData, preferences } = compareRequestSchema.parse(body);
    const comparison = await orchestrateComparison(billData, preferences);

    if (!comparison.rankedOffers.length) {
      return NextResponse.json(
        { error: "Aucune offre compatible avec vos préférences" },
        { status: 422 },
      );
    }

    return NextResponse.json({ comparison });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comparaison impossible" },
      { status: 500 },
    );
  }
}

