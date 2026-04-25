export type DataSource = "enedis_mock" | "ocr";
export type TariffOption = "BASE" | "HP_HC" | "TEMPO" | "EJP";
export type OfferTariffType = "fixed" | "indexed" | "regulated";
export type EnergyTypePreference = "renewable_only" | "mixed" | "no_preference";
export type PricePriority = "cheapest" | "best_value";
export type StabilityPreference =
  | "fixed_only"
  | "prefer_fixed"
  | "prefer_indexed"
  | "no_preference";
export type ProviderOriginPreference = "french_only" | "prefer_french" | "no_preference";
export type AutonomyLevel = "alert" | "assistant" | "autopilot";
export type RecommendationAction = "switch" | "wait";
export type SwitchStatus = "pending" | "confirmed" | "completed";

export interface TariffPricing {
  base?: {
    unitPriceEurPerKwh: number;
    monthlySubscriptionEur: number;
  };
  hpHc?: {
    hpPriceEurPerKwh: number;
    hcPriceEurPerKwh: number;
    monthlySubscriptionEur: number;
  };
}

export interface UserBillData {
  source: DataSource;
  providerName: string;
  offerName?: string;
  tariffOption: TariffOption;
  tariffType: OfferTariffType;
  meterPowerKva: number;
  pdl?: string;
  contractReference?: string;
  annualConsumptionKwh: number;
  monthlyConsumptionKwh?: number;
  hpConsumptionKwhAnnual?: number;
  hcConsumptionKwhAnnual?: number;
  pricing: TariffPricing;
  estimatedAnnualCostEur: number;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  extractionConfidence: number;
  rawExtractText?: string;
}

export interface ElectricityOffer {
  id: string;
  providerName: string;
  offerName: string;
  providerOrigin: "french" | "other";
  greenEnergyPercent: number;
  trustpilotRating: number;
  tariffType: OfferTariffType;
  supportedTariffOptions: TariffOption[];
  pricing: TariffPricing;
  lastCheckedAt: string;
  sourceLabel: string;
}

export interface UserPreferences {
  energyType: EnergyTypePreference;
  pricePriority: PricePriority;
  minimumTrustpilotRating: number;
  tariffStability: StabilityPreference;
  providerOrigin: ProviderOriginPreference;
}

export interface RankedOffer {
  offerId: string;
  annualCostEur: number;
  annualSavingsEur: number;
  matchScore: number;
  reasons: string[];
}

export interface ComparisonResult {
  currentAnnualCostEur: number;
  bestOffer: ElectricityOffer | null;
  bestOfferAnnualCostEur: number | null;
  annualSavingsEur: number;
  monthlySavingsEur: number;
  action: RecommendationAction;
  recommendationTextFr: string;
  confidenceScore: number;
  rankedOffers: RankedOffer[];
  filteredOut: { offerId: string; reason: string }[];
}

export interface TimelineStep {
  step: string;
  etaLabel: string;
  done: boolean;
}

export interface SwitchSimulationState {
  status: SwitchStatus;
  autonomyLevel: AutonomyLevel;
  selectedOfferId: string;
  confirmedAt?: string;
  estimatedAnnualSavingsEur: number;
  simulatedTimeline: TimelineStep[];
}

