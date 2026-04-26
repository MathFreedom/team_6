import type { UserBillData } from "@/types/energy";

export const sampleLinkyProfile: UserBillData = {
  source: "enedis_mock",
  providerName: "EDF",
  offerName: "Tarif Bleu résidentiel",
  tariffOption: "HP_HC",
  tariffType: "regulated",
  meterPowerKva: 6,
  prm: "14293847561092",
  pdl: "14293847561092",
  zipcode: "75001",
  currentProviderId: 159,
  currentOfferId: 6887,
  contractReference: "EDF-HEC-2026-0425",
  annualConsumptionKwh: 7400,
  monthlyConsumptionKwh: 617,
  hpConsumptionKwhAnnual: 4588,
  hcConsumptionKwhAnnual: 2812,
  pricing: {
    base: {
      unitPriceEurPerKwh: 0.194,
      monthlySubscriptionEur: 15.65,
    },
    hpHc: {
      hpPriceEurPerKwh: 0.2065,
      hcPriceEurPerKwh: 0.1579,
      monthlySubscriptionEur: 15.65,
    },
  },
  estimatedAnnualCostEur: 1579.46,
  billingPeriodStart: "2025-04-01",
  billingPeriodEnd: "2026-03-31",
  extractionConfidence: 0.98,
};

export async function simulateEnedisConnect() {
  await new Promise((resolve) => setTimeout(resolve, 1400));
  return sampleLinkyProfile;
}
