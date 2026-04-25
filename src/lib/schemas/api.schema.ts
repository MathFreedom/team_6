import { z } from "zod";
import { userBillDataSchema } from "./bill.schema";
import { preferencesSchema } from "./preferences.schema";

export const compareRequestSchema = z.object({
  billData: userBillDataSchema,
  preferences: preferencesSchema,
});

export const switchRequestSchema = z.object({
  comparison: z.object({
    action: z.enum(["switch", "wait"]),
    bestOffer: z
      .object({
        id: z.string(),
      })
      .nullable(),
    annualSavingsEur: z.number(),
  }),
  autonomyLevel: z.enum(["alert", "assistant", "autopilot"]),
});
