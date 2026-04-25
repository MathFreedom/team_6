import type { UserPreferences } from "@/types/energy";

export const APP_NAME = "WattSwitch";

export const DEFAULT_PREFERENCES: UserPreferences = {
  energyType: "mixed",
  pricePriority: "best_value",
  minimumTrustpilotRating: 4,
  tariffStability: "prefer_fixed",
  providerOrigin: "prefer_french",
};

export const MINIMUM_SAVINGS_EUR = 80;
export const GREEN_OVERRIDE_MINIMUM_SAVINGS_EUR = 30;

export const ANALYSIS_STEPS = [
  "Lecture de votre contrat",
  "Analyse de votre consommation",
  "Construction de votre profil énergie",
  "Recherche d'offres plus avantageuses",
];

