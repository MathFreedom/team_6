import { canUseAnthropic } from "@/lib/anthropic/client";
import { anthropicBillExtractionProvider } from "@/lib/ml/providers/anthropic-bill-extraction.provider";
import { stubBillExtractionProvider } from "@/lib/ml/providers/stub-bill-extraction.provider";
import type { BillExtractionProvider, BillExtractionProviderName } from "@/lib/ml/bill-extraction.types";

function getConfiguredProviderName(): BillExtractionProviderName {
  const configured = process.env.BILL_EXTRACTION_PROVIDER;

  if (configured === "stub" || configured === "anthropic" || configured === "auto") {
    return configured;
  }

  return "auto";
}

function resolveProvider(): BillExtractionProvider {
  if (process.env.DEMO_FALLBACK === "true") {
    return stubBillExtractionProvider;
  }

  const configuredProvider = getConfiguredProviderName();

  if (configuredProvider === "stub") {
    return stubBillExtractionProvider;
  }

  if (configuredProvider === "anthropic") {
    return anthropicBillExtractionProvider;
  }

  return canUseAnthropic() ? anthropicBillExtractionProvider : stubBillExtractionProvider;
}

export async function extractBillData(file: File) {
  const provider = resolveProvider();
  return provider.extract(file);
}
