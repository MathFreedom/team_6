import type { ComparisonResult, UserBillData, UserPreferences } from "@/types/energy";
import { monthlySavingsFromAnnual } from "../calculations/savings";
import { runDecisionAgent } from "./decision.agent";
import { runExecutorAgent } from "./executor.agent";
import { runEnedisOnboarding, runOcrOnboarding } from "./onboarding.agent";
import { runWatcherAgent } from "./watcher.agent";

export async function orchestrateEnedisConnect() {
  return runEnedisOnboarding();
}

export async function orchestrateOcrExtract(file: File) {
  return runOcrOnboarding(file);
}

export async function orchestrateComparison(
  billData: UserBillData,
  preferences: UserPreferences,
): Promise<ComparisonResult> {
  const watcher = await runWatcherAgent(billData, preferences);
  const decision = await runDecisionAgent({
    billData,
    preferences,
    rankedOffers: watcher.rankedOffers,
    offers: watcher.offers,
  });

  const bestOffer = watcher.offers.find((offer) => offer.id === decision.bestOfferId) ?? null;
  const bestRanked = watcher.rankedOffers.find((offer) => offer.offerId === decision.bestOfferId) ?? null;
  const annualSavingsEur = Math.max(decision.annualSavingsEur ?? bestRanked?.annualSavingsEur ?? 0, 0);

  return {
    currentAnnualCostEur: watcher.currentAnnualCost,
    bestOffer,
    bestOfferAnnualCostEur: bestRanked?.annualCostEur ?? null,
    annualSavingsEur,
    monthlySavingsEur: monthlySavingsFromAnnual(annualSavingsEur),
    action: decision.action,
    recommendationTextFr: decision.recommendationTextFr,
    confidenceScore: decision.confidenceScore,
    rankedOffers: watcher.rankedOffers,
    filteredOut: watcher.filteredOut,
  };
}

export async function orchestrateSwitch(
  selectedOfferId: string,
  autonomyLevel: "alert" | "assistant" | "autopilot",
  annualSavingsEur: number,
) {
  return runExecutorAgent({ selectedOfferId, autonomyLevel, annualSavingsEur });
}

