import { buildSwitchState } from "@/lib/mocks/switch.mock";
import type { AutonomyLevel } from "@/types/energy";

export async function runExecutorAgent(input: {
  selectedOfferId: string;
  autonomyLevel: AutonomyLevel;
  annualSavingsEur: number;
}) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return buildSwitchState(input.selectedOfferId, input.autonomyLevel, input.annualSavingsEur);
}

