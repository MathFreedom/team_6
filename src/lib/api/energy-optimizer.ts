import type {
  ComparisonResult,
  RankedOffer,
  RecommendationAction,
  TariffOption,
  UserBillData,
} from "@/types/energy";
import {
  GREEN_OVERRIDE_MINIMUM_SAVINGS_EUR,
  MINIMUM_SAVINGS_EUR,
} from "../constants";

const RECOMMEND_URL = "/api/recommend";

export interface RecommendInput {
  prm: string;
  zipcode: string;
  kva?: number;
  currentProviderId?: number;
  currentOfferId?: number;
  currentTariffType?: 1 | 2 | 3;
}

interface RecommendRankedOffer {
  provider: string;
  name: string;
  annual_cost_eur: number;
  savings_eur: number | null;
  is_green: boolean;
  is_fixed_price: boolean;
  url?: string | null;
  score_total: number;
  reasons: string[];
}

interface RecommendProfileSummary {
  annual_kwh?: number;
  daily_avg_kwh?: number;
  hp_share_pct?: number;
  best_hc_window?: string;
  weekend_share_pct?: number;
  peak_power_w?: number;
}

interface RecommendResponse {
  current: { provider: string; annual_cost_eur: number } | null;
  ranked: RecommendRankedOffer[];
  profile_summary?: RecommendProfileSummary;
  narrative?: string;
}

export class EnergyOptimizerError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "EnergyOptimizerError";
  }
}

const TARIFF_TYPE_TO_BILL: Record<1 | 2 | 3, TariffOption> = {
  1: "BASE",
  2: "HP_HC",
  3: "TEMPO",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function messageForStatus(status: number): string {
  switch (status) {
    case 401:
      return "Le service Enedis a expiré côté backend. Préviens l'équipe technique.";
    case 404:
      return "Active la collecte horaire sur ton compte Enedis (mon-compte-particulier.enedis.fr/donnees) puis réessaie.";
    case 422:
      return "Ton numéro PRM ou code postal est invalide.";
    case 502:
      return "Le comparateur officiel est momentanément indisponible. Réessaie dans quelques instants.";
    default:
      return "Le service de comparaison est indisponible.";
  }
}

export async function recommendOffers(
  input: RecommendInput,
): Promise<RecommendResponse> {
  const body: Record<string, unknown> = {
    prm: input.prm,
    zipcode: input.zipcode,
  };
  if (input.kva != null) body.kva = input.kva;
  if (input.currentProviderId != null) body.current_provider_id = input.currentProviderId;
  if (input.currentOfferId != null) body.current_offer_id = input.currentOfferId;
  if (input.currentTariffType != null) body.current_tariff_type = input.currentTariffType;

  let response: Response;
  try {
    response = await fetch(RECOMMEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    throw new EnergyOptimizerError(
      0,
      networkError instanceof Error
        ? `Connexion impossible au service: ${networkError.message}`
        : "Connexion impossible au service",
    );
  }

  if (!response.ok) {
    let backendMessage: string | null = null;
    try {
      const payload = await response.json();
      backendMessage = typeof payload?.detail === "string"
        ? payload.detail
        : typeof payload?.message === "string"
        ? payload.message
        : null;
    } catch {
      /* ignore non-JSON */
    }
    throw new EnergyOptimizerError(
      response.status,
      backendMessage ?? messageForStatus(response.status),
    );
  }

  return (await response.json()) as RecommendResponse;
}

function pickAction(savingsEur: number, isGreen: boolean): RecommendationAction {
  if (savingsEur >= MINIMUM_SAVINGS_EUR) return "switch";
  if (isGreen && savingsEur >= GREEN_OVERRIDE_MINIMUM_SAVINGS_EUR) return "switch";
  return "wait";
}

export interface JourneyStateFromRecommend {
  billData: UserBillData;
  comparison: ComparisonResult;
}

export function toJourneyState(
  response: RecommendResponse,
  input: RecommendInput,
): JourneyStateFromRecommend {
  const ranked: RankedOffer[] = response.ranked.map((r) => ({
    offerId: `${slugify(r.provider)}-${slugify(r.name)}`,
    providerName: r.provider,
    offerName: r.name,
    annualCostEur: r.annual_cost_eur,
    annualSavingsEur: r.savings_eur ?? 0,
    matchScore: r.score_total,
    reasons: r.reasons,
    url: r.url ?? undefined,
    isGreen: r.is_green,
    isFixedPrice: r.is_fixed_price,
  }));

  const top = ranked[0];
  const action = top
    ? pickAction(top.annualSavingsEur, !!top.isGreen)
    : "wait";

  const tariffOption: TariffOption = input.currentTariffType
    ? TARIFF_TYPE_TO_BILL[input.currentTariffType]
    : "BASE";

  const currentAnnualCost = response.current?.annual_cost_eur ?? 0;
  const currentProvider = response.current?.provider ?? "Inconnu";
  const annualSavings = top?.annualSavingsEur ?? 0;

  const billData: UserBillData = {
    source: "enedis_mock",
    providerName: currentProvider,
    tariffOption,
    tariffType: "regulated",
    meterPowerKva: input.kva ?? 6,
    prm: input.prm,
    zipcode: input.zipcode,
    currentProviderId: input.currentProviderId,
    currentOfferId: input.currentOfferId,
    annualConsumptionKwh: response.profile_summary?.annual_kwh ?? 0,
    pricing: {},
    estimatedAnnualCostEur: currentAnnualCost,
    extractionConfidence: 1,
  };

  const comparison: ComparisonResult = {
    currentAnnualCostEur: currentAnnualCost,
    bestOffer: top
      ? {
          id: top.offerId,
          providerName: top.providerName,
          offerName: top.offerName,
          annualCostEur: top.annualCostEur,
          annualSavingsEur: top.annualSavingsEur,
          matchScore: top.matchScore,
          reasons: top.reasons,
          url: top.url,
          isGreen: top.isGreen,
          isFixedPrice: top.isFixedPrice,
        }
      : null,
    bestOfferAnnualCostEur: top ? top.annualCostEur : null,
    annualSavingsEur: annualSavings,
    monthlySavingsEur: annualSavings / 12,
    action,
    recommendationTextFr:
      response.narrative ??
      (top
        ? `Je te recommande ${top.providerName} ${top.offerName} : économise environ ${Math.round(top.annualSavingsEur)} € par an.`
        : "Aucune offre plus avantageuse pour l'instant — on reste vigilant."),
    confidenceScore: 0.9,
    rankedOffers: ranked,
    filteredOut: [],
    narrative: response.narrative,
    currentProviderName: currentProvider,
    profileSummary: response.profile_summary
      ? {
          annualKwh: response.profile_summary.annual_kwh,
          dailyAvgKwh: response.profile_summary.daily_avg_kwh,
          hpSharePct: response.profile_summary.hp_share_pct,
          bestHcWindow: response.profile_summary.best_hc_window,
          weekendSharePct: response.profile_summary.weekend_share_pct,
          peakPowerW: response.profile_summary.peak_power_w,
        }
      : null,
  };

  return { billData, comparison };
}
