import { calculateBillAnnualCost } from "@/lib/calculations/annual-cost";
import { userBillDataSchema } from "@/lib/schemas/bill.schema";
import type { UserBillData } from "@/types/energy";

export function buildDemoBillData(): UserBillData {
  return userBillDataSchema.parse({
    source: "ocr",
    providerName: "Engie",
    offerName: "Elec Reference 3 ans",
    tariffOption: "BASE",
    tariffType: "fixed",
    meterPowerKva: 6,
    prm: "25573091842371",
    pdl: "25573091842371",
    contractReference: "ENG-FACT-9382",
    annualConsumptionKwh: 5600,
    monthlyConsumptionKwh: 467,
    pricing: {
      base: {
        unitPriceEurPerKwh: 0.2039,
        monthlySubscriptionEur: 15.33,
      },
    },
    estimatedAnnualCostEur: 1325.64,
    billingPeriodStart: "2025-05-01",
    billingPeriodEnd: "2026-04-01",
    extractionConfidence: 0.84,
    rawExtractText: "Mode demo OCR",
  });
}

export function normalizeExtractedBillPayload(payload: Record<string, unknown>): UserBillData {
  const tariffOption = (payload.tariffOption as UserBillData["tariffOption"] | null) ?? "BASE";
  const normalized: UserBillData = {
    source: "ocr",
    providerName: String(payload.providerName ?? "Fournisseur inconnu"),
    offerName: payload.offerName ? String(payload.offerName) : undefined,
    tariffOption,
    tariffType: (payload.tariffType as UserBillData["tariffType"] | null) ?? "fixed",
    meterPowerKva: Number(payload.meterPowerKva ?? 6),
    prm: payload.prm ? String(payload.prm) : payload.pdl ? String(payload.pdl) : undefined,
    pdl: payload.pdl ? String(payload.pdl) : undefined,
    zipcode: payload.zipcode ? String(payload.zipcode) : undefined,
    currentProviderId: payload.currentProviderId ? Number(payload.currentProviderId) : undefined,
    currentOfferId: payload.currentOfferId ? Number(payload.currentOfferId) : undefined,
    contractReference: payload.contractReference ? String(payload.contractReference) : undefined,
    annualConsumptionKwh: Number(payload.annualConsumptionKwh ?? payload.monthlyConsumptionKwh ?? 5000),
    monthlyConsumptionKwh: payload.monthlyConsumptionKwh
      ? Number(payload.monthlyConsumptionKwh)
      : undefined,
    hpConsumptionKwhAnnual: payload.hpConsumptionKwhAnnual
      ? Number(payload.hpConsumptionKwhAnnual)
      : undefined,
    hcConsumptionKwhAnnual: payload.hcConsumptionKwhAnnual
      ? Number(payload.hcConsumptionKwhAnnual)
      : undefined,
    pricing: {
      base:
        payload.baseUnitPrice || payload.baseSubscriptionMonthly
          ? {
              unitPriceEurPerKwh: Number(payload.baseUnitPrice ?? 0.19),
              monthlySubscriptionEur: Number(payload.baseSubscriptionMonthly ?? 15.65),
            }
          : undefined,
      hpHc:
        payload.hpPrice || payload.hcPrice || payload.hpHcSubscriptionMonthly
          ? {
              hpPriceEurPerKwh: Number(payload.hpPrice ?? 0.21),
              hcPriceEurPerKwh: Number(payload.hcPrice ?? 0.16),
              monthlySubscriptionEur: Number(payload.hpHcSubscriptionMonthly ?? 15.65),
            }
          : undefined,
    },
    estimatedAnnualCostEur: 0,
    billingPeriodStart: payload.billingPeriodStart ? String(payload.billingPeriodStart) : undefined,
    billingPeriodEnd: payload.billingPeriodEnd ? String(payload.billingPeriodEnd) : undefined,
    extractionConfidence: 0.84,
    rawExtractText: payload.rawExtractText ? String(payload.rawExtractText) : undefined,
  };

  const hasCompatiblePricing =
    (tariffOption === "HP_HC" && Boolean(normalized.pricing.hpHc)) ||
    (tariffOption !== "HP_HC" && Boolean(normalized.pricing.base));

  if (!hasCompatiblePricing) {
    throw new Error("Impossible de lire les informations tarifaires de la facture.");
  }

  normalized.estimatedAnnualCostEur = calculateBillAnnualCost(normalized);
  return userBillDataSchema.parse(normalized);
}
