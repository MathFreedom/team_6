import { z } from "zod";
import { tariffPricingSchema } from "./offer.schema";

export const userBillDataSchema = z.object({
  source: z.enum(["enedis_mock", "ocr"]),
  providerName: z.string(),
  offerName: z.string().optional(),
  tariffOption: z.enum(["BASE", "HP_HC", "TEMPO", "EJP"]),
  tariffType: z.enum(["fixed", "indexed", "regulated"]),
  meterPowerKva: z.number(),
  pdl: z.string().optional(),
  contractReference: z.string().optional(),
  annualConsumptionKwh: z.number(),
  monthlyConsumptionKwh: z.number().optional(),
  hpConsumptionKwhAnnual: z.number().optional(),
  hcConsumptionKwhAnnual: z.number().optional(),
  pricing: tariffPricingSchema,
  estimatedAnnualCostEur: z.number(),
  billingPeriodStart: z.string().optional(),
  billingPeriodEnd: z.string().optional(),
  extractionConfidence: z.number(),
  rawExtractText: z.string().optional(),
});

