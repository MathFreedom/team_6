import { z } from "zod";

export const decisionResponseSchema = z.object({
  action: z.enum(["switch", "wait"]),
  bestOfferId: z.string().nullable(),
  annualSavingsEur: z.number(),
  confidenceScore: z.number().min(0).max(1),
  recommendationTextFr: z.string(),
  matchedPreferences: z.array(z.string()).default([]),
  decisionReasons: z.array(z.string()).default([]),
});

