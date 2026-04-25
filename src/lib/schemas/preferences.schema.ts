import { z } from "zod";

export const preferencesSchema = z.object({
  energyType: z.enum(["renewable_only", "mixed", "no_preference"]),
  pricePriority: z.enum(["cheapest", "best_value"]),
  minimumTrustpilotRating: z.number().min(0).max(5),
  tariffStability: z.enum(["fixed_only", "prefer_fixed", "prefer_indexed", "no_preference"]),
  providerOrigin: z.enum(["french_only", "prefer_french", "no_preference"]),
});

