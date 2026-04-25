import { z } from "zod";

export const tariffPricingSchema = z.object({
  base: z
    .object({
      unitPriceEurPerKwh: z.number(),
      monthlySubscriptionEur: z.number(),
    })
    .optional(),
  hpHc: z
    .object({
      hpPriceEurPerKwh: z.number(),
      hcPriceEurPerKwh: z.number(),
      monthlySubscriptionEur: z.number(),
    })
    .optional(),
});

export const electricityOfferSchema = z.object({
  id: z.string(),
  providerName: z.string(),
  offerName: z.string(),
  providerOrigin: z.enum(["french", "other"]),
  greenEnergyPercent: z.number(),
  trustpilotRating: z.number(),
  tariffType: z.enum(["fixed", "indexed", "regulated"]),
  supportedTariffOptions: z.array(z.enum(["BASE", "HP_HC", "TEMPO", "EJP"])),
  pricing: tariffPricingSchema,
  lastCheckedAt: z.string(),
  sourceLabel: z.string(),
});

