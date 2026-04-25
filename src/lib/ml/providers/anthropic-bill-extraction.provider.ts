import { getAnthropicClient, getAnthropicModel } from "@/lib/anthropic/client";
import { extractJsonFromText } from "@/lib/anthropic/parsers";
import { OCR_SYSTEM_PROMPT } from "@/lib/anthropic/prompts";
import { normalizeExtractedBillPayload } from "@/lib/ml/bill-extraction.shared";
import type { BillExtractionProvider } from "@/lib/ml/bill-extraction.types";

export const anthropicBillExtractionProvider: BillExtractionProvider = {
  async extract(file) {
    const client = getAnthropicClient();

    if (!client) {
      throw new Error("Le provider Anthropic est indisponible sans ANTHROPIC_API_KEY.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mediaType = file.type || "image/jpeg";
    const model = getAnthropicModel();
    const documentBlock =
      mediaType === "application/pdf"
        ? {
            type: "document" as const,
            source: {
              type: "base64" as const,
              media_type: "application/pdf" as const,
              data: buffer.toString("base64"),
            },
          }
        : {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: mediaType as "image/jpeg" | "image/png" | "image/webp",
              data: buffer.toString("base64"),
            },
          };

    const response = await client.messages.create({
      model,
      max_tokens: 1400,
      system: OCR_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            documentBlock,
            {
              type: "text",
              text: "Extrais la facture d'electricite et renvoie uniquement le JSON demande.",
            },
          ],
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const json = JSON.parse(extractJsonFromText(text)) as Record<string, unknown>;
    return normalizeExtractedBillPayload(json);
  },
};
