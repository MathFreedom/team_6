import { NextResponse } from "next/server";
import { orchestrateEnedisConnect } from "@/lib/agents/orchestrator";

export const runtime = "nodejs";

export async function POST() {
  try {
    const billData = await orchestrateEnedisConnect();
    return NextResponse.json({ billData });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Connexion Enedis simulée impossible" },
      { status: 500 },
    );
  }
}

