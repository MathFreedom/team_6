import offers from "@/data/offers.fr.json";
import { calculateBillAnnualCost } from "@/lib/calculations/annual-cost";
import { scoreOffers } from "@/lib/calculations/score-offers";
import { electricityOfferSchema } from "@/lib/schemas/offer.schema";
import type { ElectricityOffer, UserBillData, UserPreferences } from "@/types/energy";

const validatedOffers = offers.map((offer) => electricityOfferSchema.parse(offer)) as ElectricityOffer[];

export async function runWatcherAgent(billData: UserBillData, preferences: UserPreferences) {
  const currentAnnualCost = calculateBillAnnualCost(billData);
  const result = scoreOffers(validatedOffers, billData, preferences, currentAnnualCost);
  return {
    offers: validatedOffers,
    currentAnnualCost,
    ...result,
  };
}

