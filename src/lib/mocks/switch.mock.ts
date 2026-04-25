import type { AutonomyLevel, SwitchSimulationState } from "@/types/energy";

export function buildSwitchTimeline(autonomyLevel: AutonomyLevel) {
  return [
    {
      step: autonomyLevel === "assistant" ? "Confirmation utilisateur reçue" : "Règles d'autonomie validées",
      etaLabel: "Maintenant",
      done: true,
    },
    {
      step: "Transmission simulée au nouveau fournisseur",
      etaLabel: "Sous 2 min",
      done: true,
    },
    {
      step: "Résiliation automatique de l'ancien contrat",
      etaLabel: "Sous 24 h",
      done: true,
    },
    {
      step: "Activation du nouveau contrat",
      etaLabel: "Sous 5 jours",
      done: true,
    },
  ];
}

export function buildSwitchState(
  offerId: string,
  autonomyLevel: AutonomyLevel,
  annualSavings: number,
): SwitchSimulationState {
  return {
    status: "completed",
    autonomyLevel,
    selectedOfferId: offerId,
    confirmedAt: new Date().toISOString(),
    estimatedAnnualSavingsEur: annualSavings,
    simulatedTimeline: buildSwitchTimeline(autonomyLevel),
  };
}

