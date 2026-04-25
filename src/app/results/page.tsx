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
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (!billData || !comparison) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  const offerList = offers as ElectricityOffer[];

  return (
    <div className="space-y-6">
      <ProgressStepper currentPath="/results" />
      <SavingsHeroCard
        annualSavings={comparison.annualSavingsEur}
        monthlySavings={comparison.monthlySavingsEur}
        action={comparison.action}
      />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Votre situation actuelle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-border bg-white/65 p-4">
              <div className="font-semibold">{billData.providerName}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {billData.offerName} · {billData.tariffOption} · {billData.meterPowerKva} kVA
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-white/65 p-4">
              <div className="text-sm text-muted-foreground">Coût annuel estimé</div>
              <div className="mt-1 font-[var(--font-display)] text-3xl font-semibold">
                {formatCurrency(comparison.currentAnnualCostEur)}
              </div>
            </div>
            <div className="rounded-[24px] border border-border bg-white/65 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">Recommandation de l'agent</div>
                  <p className="mt-2 text-sm text-muted-foreground">{comparison.recommendationTextFr}</p>
                </div>
                <Badge variant="outline">
                  Confiance {(comparison.confidenceScore * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
            {comparison.bestOffer ? (
              <div className="rounded-[24px] border border-primary/25 bg-primary/7 p-4">
                <div className="text-sm text-muted-foreground">Meilleure offre détectée</div>
                <div className="mt-1 font-semibold">
                  {comparison.bestOffer.providerName} · {comparison.bestOffer.offerName}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {comparison.bestOffer.greenEnergyPercent}% vert · note {comparison.bestOffer.trustpilotRating}/5 ·{" "}
                  {comparison.bestOffer.tariffType === "fixed" ? "prix fixe" : comparison.bestOffer.tariffType === "indexed" ? "prix indexé" : "tarif réglementé"}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <OfferComparisonTable rankedOffers={comparison.rankedOffers} offers={offerList} />
      </div>
      <div className="flex justify-end">
        {comparison.bestOffer && comparison.action === "switch" ? (
          <Link href="/switch">
            <Button size="lg" variant="accent">
              Switcher
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        ) : (
          <Button size="lg" variant="accent" disabled>
            Attendre une meilleure fenêtre
          </Button>
        )}
      </div>
    </div>
  );
}
