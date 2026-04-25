"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import offers from "@/data/offers.fr.json";
import type { ElectricityOffer } from "@/types/energy";
import { ProgressStepper } from "@/components/layout/progress-stepper";
import { SavingsHeroCard } from "@/components/results/savings-hero-card";
import { OfferComparisonTable } from "@/components/results/offer-comparison-table";
import { AgentSentinel } from "@/components/results/agent-sentinel";
import { PremiumUpsell } from "@/components/results/premium-upsell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/currency";

export default function ResultsPage() {
  const router = useRouter();
  const hydrated = useJourneyHydrated();
  const billData = useJourneyStore((state) => state.billData);
  const comparison = useJourneyStore((state) => state.comparison);

  useEffect(() => {
    if (hydrated && (!billData || !comparison)) {
      router.replace("/preferences");
    }
  }, [billData, comparison, hydrated, router]);

  if (!hydrated) {
    return <Skeleton className="app-screen h-[560px] w-full" />;
  }

  if (!billData || !comparison) {
    return <Skeleton className="app-screen h-[560px] w-full" />;
  }

  const offerList = offers as ElectricityOffer[];

  return (
    <div className="app-screen space-y-4">
      <ProgressStepper currentPath="/results" />
      <SavingsHeroCard
        annualSavings={comparison.annualSavingsEur}
        monthlySavings={comparison.monthlySavingsEur}
        action={comparison.action}
      />

      <Card>
        <CardHeader>
          <CardTitle>Quick read</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-[24px] border border-border bg-white/70 p-4">
            <div className="font-semibold">{billData.providerName}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {billData.offerName} · {billData.tariffOption} · {billData.meterPowerKva} kVA
            </p>
          </div>
          <div className="rounded-[24px] border border-border bg-white/70 p-4">
            <div className="text-sm text-muted-foreground">Estimated annual cost today</div>
            <div className="mt-1 font-[var(--font-display)] text-3xl font-semibold">
              {formatCurrency(comparison.currentAnnualCostEur)}
            </div>
          </div>
          <div className="rounded-[24px] border border-border bg-white/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">Agent verdict</div>
              <Badge variant="outline">Confidence {(comparison.confidenceScore * 100).toFixed(0)}%</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{comparison.recommendationTextFr}</p>
          </div>
          {comparison.bestOffer ? (
            <div className="rounded-[24px] border border-primary/25 bg-primary/7 p-4">
              <div className="text-sm text-muted-foreground">Best offer detected</div>
              <div className="mt-1 font-semibold">
                {comparison.bestOffer.providerName} · {comparison.bestOffer.offerName}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {comparison.bestOffer.greenEnergyPercent}% green · rating {comparison.bestOffer.trustpilotRating}/5 ·{" "}
                {comparison.bestOffer.tariffType === "fixed"
                  ? "fixed price"
                  : comparison.bestOffer.tariffType === "indexed"
                    ? "indexed price"
                    : "regulated tariff"}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <OfferComparisonTable rankedOffers={comparison.rankedOffers} offers={offerList} />
      <AgentSentinel />
      <PremiumUpsell />

      <div className="sticky bottom-3">
        <Card className="border-primary/15 bg-white/88">
          <CardContent className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">
                {comparison.bestOffer && comparison.action === "switch" ? "Take action" : "No switch right now"}
              </div>
              <p className="text-xs text-muted-foreground">
                {comparison.bestOffer && comparison.action === "switch"
                  ? "The next screen sets up the execution mode."
                  : "Nova can keep watching for a better window."}
              </p>
            </div>
            {comparison.bestOffer && comparison.action === "switch" ? (
              <Link href="/switch">
                <Button size="lg" variant="accent">
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" variant="accent" disabled>
                Wait
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
