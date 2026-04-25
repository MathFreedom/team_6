import type { ElectricityOffer, RankedOffer } from "@/types/energy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";

export function OfferComparisonTable({
  rankedOffers,
  offers,
}: {
  rankedOffers: RankedOffer[];
  offers: ElectricityOffer[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top offers compared</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rankedOffers.slice(0, 4).map((ranked, index) => {
          const offer = offers.find((entry) => entry.id === ranked.offerId);
          if (!offer) return null;

          return (
            <div key={ranked.offerId} className="rounded-[24px] border border-border bg-white/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">#{index + 1}</div>
                  <div className="mt-1 font-semibold">
                    {offer.providerName} · {offer.offerName}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ranked.reasons[1] ?? ranked.reasons[0]}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-semibold">{formatCurrency(ranked.annualCostEur)}</div>
                  <div className="text-sm text-primary">-{formatCurrency(ranked.annualSavingsEur)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
