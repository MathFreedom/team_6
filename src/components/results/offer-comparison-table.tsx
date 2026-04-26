import type { RankedOffer } from "@/types/energy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";

export function OfferComparisonTable({ rankedOffers }: { rankedOffers: RankedOffer[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top offers compared</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rankedOffers.slice(0, 4).map((ranked, index) => (
          <div key={ranked.offerId} className="rounded-[24px] border border-border bg-white/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">#{index + 1}</div>
                <div className="mt-1 font-semibold">
                  {ranked.providerName} · {ranked.offerName}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{ranked.reasons[1] ?? ranked.reasons[0]}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{ranked.isGreen ? "Green" : "Standard"}</span>
                  <span>{ranked.isFixedPrice ? "Fixed price" : "Variable price"}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-semibold">{formatCurrency(ranked.annualCostEur)}</div>
                <div className="text-sm text-primary">-{formatCurrency(ranked.annualSavingsEur)}</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
