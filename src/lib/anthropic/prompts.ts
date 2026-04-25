export const OCR_SYSTEM_PROMPT = `Tu extrais une facture d'électricité française.
Réponds uniquement en JSON valide.
Si un champ est absent, mets null.
Normalise les clés et les unités.
Le JSON attendu:
{
  "providerName": "string|null",
  "offerName": "string|null",
  "tariffOption": "BASE|HP_HC|TEMPO|EJP|null",
  "tariffType": "fixed|indexed|regulated|null",
  "meterPowerKva": "number|null",
  "pdl": "string|null",
  "contractReference": "string|null",
  "annualConsumptionKwh": "number|null",
  "monthlyConsumptionKwh": "number|null",
  "hpConsumptionKwhAnnual": "number|null",
  "hcConsumptionKwhAnnual": "number|null",
  "baseUnitPrice": "number|null",
  "baseSubscriptionMonthly": "number|null",
  "hpPrice": "number|null",
  "hcPrice": "number|null",
  "hpHcSubscriptionMonthly": "number|null",
  "billingPeriodStart": "YYYY-MM-DD|null",
  "billingPeriodEnd": "YYYY-MM-DD|null",
  "rawExtractText": "string"
}`;

export function buildDecisionPrompt(payload: string) {
  return `Tu es l'agent de décision de Nova.
Tu recommandes un changement de fournisseur d'électricité en France uniquement si cela respecte strictement les préférences utilisateur.
Réponds uniquement en JSON valide.

Règles:
- Ne recommande jamais une offre avec une note inférieure au seuil utilisateur.
- Si l'économie annuelle est inférieure à 80 €, retourne "wait", sauf si l'utilisateur veut absolument du 100% vert: alors le seuil minimal devient 30 €.
- Si la préférence est "french_only", exclure les fournisseurs non français.
- Si la préférence est "fixed_only", exclure les offres indexées.
- Texte final en français, maximum 2 phrases, ton clair et concret.

Données:
${payload}

Format attendu:
{
  "action": "switch" | "wait",
  "bestOfferId": "string | null",
  "annualSavingsEur": number,
  "confidenceScore": number,
  "recommendationTextFr": "string",
  "matchedPreferences": ["string"],
  "decisionReasons": ["string"]
}`;
}

