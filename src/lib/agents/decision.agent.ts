import { GREEN_OVERRIDE_MINIMUM_SAVINGS_EUR, MINIMUM_SAVINGS_EUR } from "@/lib/constants";
import { getAnthropicClient, getAnthropicModel } from "@/lib/anthropic/client";
import { extractJsonFromText } from "@/lib/anthropic/parsers";
import { buildDecisionPrompt } from "@/lib/anthropic/prompts";
import { decisionResponseSchema } from "@/lib/schemas/decision.schema";
import type { ElectricityOffer, RankedOffer, UserBillData, UserPreferences } from "@/types/energy";

function buildDeterministicDecision(
  billData: UserBillData,
  rankedOffers: RankedOffer[],
  offers: ElectricityOffer[],
  preferences: UserPreferences,
) {
  const bestRanked = rankedOffers[0];
  const bestOffer = offers.find((offer) => offer.id === bestRanked?.offerId) ?? null;
  const minimumSavings =
    preferences.energyType === "renewable_only"
      ? GREEN_OVERRIDE_MINIMUM_SAVINGS_EUR
      : MINIMUM_SAVINGS_EUR;

  if (!bestRanked || !bestOffer || bestRanked.annualSavingsEur < minimumSavings) {
    return decisionResponseSchema.parse({
      action: "wait",
      bestOfferId: bestOffer?.id ?? null,
      annualSavingsEur: Math.max(bestRanked?.annualSavingsEur ?? 0, 0),
      confidenceScore: 0.72,
      recommendationTextFr:
        "Aucune offre ne crée un gain assez net pour justifier un changement aujourd'hui. Nova continue de surveiller le marché pour vous.",
      matchedPreferences: [],
      decisionReasons: ["Économie insuffisante pour un switch immédiat"],
    });
  }

  const greenText = bestOffer.greenEnergyPercent === 100 ? "100% verte" : "compétitive";
  return decisionResponseSchema.parse({
    action: "switch",
    bestOfferId: bestOffer.id,
    annualSavingsEur: bestRanked.annualSavingsEur,
    confidenceScore: 0.89,
    recommendationTextFr: `Je vous recommande ${bestOffer.providerName} ${bestOffer.offerName}: cette offre ${greenText} respecte vos critères et réduit votre facture d'environ ${Math.round(bestRanked.annualSavingsEur)} € par an.`,
    matchedPreferences: rankedOffers[0].reasons,
    decisionReasons: ["Meilleur score global après filtrage des préférences"],
  });
}

export async function runDecisionAgent(params: {
  billData: UserBillData;
  preferences: UserPreferences;
  rankedOffers: RankedOffer[];
  offers: ElectricityOffer[];
}) {
  const fallback = buildDeterministicDecision(
    params.billData,
    params.rankedOffers,
    params.offers,
    params.preferences,
  );

  const client = getAnthropicClient();
  const demoFallback = process.env.DEMO_FALLBACK === "true";
  if (!client || demoFallback) {
    return fallback;
  }

  const payload = JSON.stringify(
    {
      currentBill: params.billData,
      preferences: params.preferences,
      rankedOffers: params.rankedOffers.slice(0, 5),
      guardrails: {
        minimumSavingsDefault: MINIMUM_SAVINGS_EUR,
        greenOverrideMinimumSavings: GREEN_OVERRIDE_MINIMUM_SAVINGS_EUR,
        cooldownDays: 90,
      },
    },
    null,
    2,
  );

  try {
    const response = await client.messages.create({
      model: getAnthropicModel(),
      max_tokens: 900,
      messages: [
        {
          role: "user",
          content: buildDecisionPrompt(payload),
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return decisionResponseSchema.parse(JSON.parse(extractJsonFromText(text)));
  } catch {
    return fallback;
  }
}

