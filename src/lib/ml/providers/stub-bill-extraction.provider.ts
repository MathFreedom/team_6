import type { BillExtractionProvider } from "@/lib/ml/bill-extraction.types";
import { buildDemoBillData } from "@/lib/ml/bill-extraction.shared";

export const stubBillExtractionProvider: BillExtractionProvider = {
  async extract() {
    return buildDemoBillData();
  },
};
