import type { ElectricityOffer, UserBillData } from "@/types/energy";

function roundCost(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateBillAnnualCost(billData: UserBillData) {
  if (billData.tariffOption === "HP_HC" && billData.pricing.hpHc) {
    const hp = billData.hpConsumptionKwhAnnual ?? billData.annualConsumptionKwh * 0.62;
    const hc = billData.hcConsumptionKwhAnnual ?? billData.annualConsumptionKwh * 0.38;
    return roundCost(
      hp * billData.pricing.hpHc.hpPriceEurPerKwh +
        hc * billData.pricing.hpHc.hcPriceEurPerKwh +
        billData.pricing.hpHc.monthlySubscriptionEur * 12,
    );
  }

  if (billData.tariffOption === "HP_HC" && !billData.pricing.hpHc) {
    throw new Error("Tarification HP/HC incomplète sur la facture extraite.");
  }

  if (!billData.pricing.base) {
    throw new Error("Tarification de base introuvable sur la facture extraite.");
  }

  const pricing = billData.pricing.base;

  return roundCost(
    billData.annualConsumptionKwh * pricing.unitPriceEurPerKwh +
      pricing.monthlySubscriptionEur * 12,
  );
}

export function calculateOfferAnnualCost(offer: ElectricityOffer, billData: UserBillData) {
  if (billData.tariffOption === "HP_HC" && offer.pricing.hpHc) {
    const hp = billData.hpConsumptionKwhAnnual ?? billData.annualConsumptionKwh * 0.62;
    const hc = billData.hcConsumptionKwhAnnual ?? billData.annualConsumptionKwh * 0.38;

    return roundCost(
      hp * offer.pricing.hpHc.hpPriceEurPerKwh +
        hc * offer.pricing.hpHc.hcPriceEurPerKwh +
        offer.pricing.hpHc.monthlySubscriptionEur * 12,
    );
  }

  if (!offer.pricing.base) {
    return Number.POSITIVE_INFINITY;
  }

  return roundCost(
    billData.annualConsumptionKwh * offer.pricing.base.unitPriceEurPerKwh +
      offer.pricing.base.monthlySubscriptionEur * 12,
  );
}
