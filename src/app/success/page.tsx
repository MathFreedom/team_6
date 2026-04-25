"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { ProgressStepper } from "@/components/layout/progress-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/dates";

export default function SuccessPage() {
  const router = useRouter();
  const hydrated = useJourneyHydrated();
  const switchState = useJourneyStore((state) => state.switchState);
  const resetJourney = useJourneyStore((state) => state.resetJourney);

  useEffect(() => {
    if (hydrated && !switchState) {
      router.replace("/switch");
    }
  }, [hydrated, router, switchState]);

  if (!hydrated) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (!switchState) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  return (
    <div className="space-y-6">
      <ProgressStepper currentPath="/success" />
      <Card>
        <CardContent className="space-y-5 p-8">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-accent p-4 text-accent-foreground">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <h1 className="font-[var(--font-display)] text-3xl font-semibold">Switch simulé avec succès</h1>
              <p className="mt-1 text-muted-foreground">
                Confirmation enregistrée {switchState.confirmedAt ? formatDateTime(switchState.confirmedAt) : "maintenant"}.
              </p>
            </div>
          </div>
          <div className="rounded-[24px] border border-primary/25 bg-primary/7 p-5">
            <div className="text-sm text-muted-foreground">Économie annuelle estimée</div>
            <div className="mt-1 font-[var(--font-display)] text-4xl font-semibold">
              {formatCurrency(switchState.estimatedAnnualSavingsEur)}
            </div>
          </div>
          <Card className="bg-white/55">
            <CardHeader>
              <CardTitle>Timeline simulée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {switchState.simulatedTimeline.map((item) => (
                <div key={item.step} className="rounded-[22px] border border-border bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-medium">{item.step}</div>
                    <div className="text-sm text-muted-foreground">{item.etaLabel}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button
              variant="accent"
              onClick={() => {
                resetJourney();
                router.push("/");
              }}
            >
              Relancer une mission
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
