import type { UserBillData } from "@/types/energy";

export type BillExtractionProviderName = "auto" | "stub" | "anthropic";

export interface BillExtractionProvider {
  extract(file: File): Promise<UserBillData>;
}
