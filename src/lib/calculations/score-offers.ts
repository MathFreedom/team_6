import type { ElectricityOffer, RankedOffer, UserBillData, UserPreferences } from "@/types/energy";
import { calculateOfferAnnualCost } from "./annual-cost";

export function scoreOffers(
  offers: ElectricityOffer[],
  billData: UserBillData,
  preferences: UserPreferences,
  currentAnnualCost: number,
) {
  const rankedOffers: RankedOffer[] = [];
  const filteredOut: { offerId: string; reason: string }[] = [];

  for (const offer of offers) {
    if (!offer.supportedTariffOptions.includes(billData.tariffOption)) {
      filteredOut.push({ offerId: offer.id, reason: "Option tarifaire incompatible" });
      continue;
    }

    if (offer.trustpilotRating < preferences.minimumTrustpilotRating) {
      filteredOut.push({ offerId: offer.id, reason: "Note de confiance insuffisante" });
      continue;
    }

    if (preferences.energyType === "renewable_only" && offer.greenEnergyPercent < 100) {
      filteredOut.push({ offerId: offer.id, reason: "Offre non 100% verte" });
      continue;
    }

    if (preferences.providerOrigin === "french_only" && offer.providerOrigin !== "french") {
      filteredOut.push({ offerId: offer.id, reason: "Fournisseur non français" });
      continue;
    }

    if (preferences.tariffStability === "fixed_only" && offer.tariffType !== "fixed") {
      filteredOut.push({ offerId: offer.id, reason: "Prix non fixe" });
      continue;
    }

    const annualCost = calculateOfferAnnualCost(offer, billData);
    const annualSavingsEur = Math.round((currentAnnualCost - annualCost) * 100) / 100;
    let matchScore = annualSavingsEur;
    const reasons = [`Économie estimée: ${Math.round(annualSavingsEur)} €/an`];

    if (preferences.pricePriority === "best_value") {
      matchScore += offer.trustpilotRating * 15;
      if (offer.greenEnergyPercent === 100) matchScore += 20;
      reasons.push("Bon équilibre entre prix, confiance et qualité");
    } else {
      reasons.push("Priorité donnée au prix le plus bas");
    }

    if (preferences.providerOrigin === "prefer_french" && offer.providerOrigin === "french") {
      matchScore += 12;
      reasons.push("Fournisseur français");
    }

    if (preferences.tariffStability === "prefer_fixed" && offer.tariffType === "fixed") {
      matchScore += 15;
      reasons.push("Prix fixe aligné avec votre préférence");
    }

    if (preferences.tariffStability === "prefer_indexed" && offer.tariffType === "indexed") {
      matchScore += 15;
      reasons.push("Prix indexé aligné avec votre préférence");
    }

    rankedOffers.push({
      offerId: offer.id,
      providerName: offer.providerName,
      offerName: offer.offerName,
      annualCostEur: annualCost,
      annualSavingsEur,
      matchScore: Math.round(matchScore * 100) / 100,
      reasons,
      isGreen: offer.greenEnergyPercent === 100,
      isFixedPrice: offer.tariffType === "fixed",
    });
  }

  rankedOffers.sort((a, b) => b.matchScore - a.matchScore);

  return { rankedOffers, filteredOut };
}
