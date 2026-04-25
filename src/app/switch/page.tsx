"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { ProgressStepper } from "@/components/layout/progress-stepper";
import { AutonomySelector } from "@/components/switch/autonomy-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/currency";
import type { AutonomyLevel } from "@/types/energy";

export default function SwitchPage() {
  const router = useRouter();
  const hydrated = useJourneyHydrated();
  const comparison = useJourneyStore((state) => state.comparison);
  const setSwitchState = useJourneyStore((state) => state.setSwitchState);
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>("assistant");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (hydrated && (!comparison?.bestOffer || comparison.action !== "switch")) {
      router.replace("/results");
    }
  }, [comparison, hydrated, router]);

  if (!hydrated) {
    return <Skeleton className="app-screen h-[520px] w-full" />;
  }

  if (!comparison?.bestOffer || comparison.action !== "switch") {
    return <Skeleton className="app-screen h-[520px] w-full" />;
  }

  const confirmSwitch = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comparison, autonomyLevel }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Simulation impossible");
        }
        setSwitchState(payload.switchState);
        toast.success("Switch simulé avec succès.");
        router.push("/success");
      } catch (caughtError) {
        toast.error(caughtError instanceof Error ? caughtError.message : "Simulation impossible");
      }
    });
  };

  return (
    <div className="app-screen space-y-4">
      <ProgressStepper currentPath="/switch" />
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">Choisissez le mode d'exécution</CardTitle>
          <p className="text-sm text-muted-foreground">
            Une fois le mode choisi, Nova simule la suite du workflow de souscription.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-[24px] border border-primary/25 bg-primary/7 p-5">
            <div className="font-semibold">
              {comparison.bestOffer.providerName} · {comparison.bestOffer.offerName}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Coût estimé: {formatCurrency(comparison.bestOfferAnnualCostEur ?? 0)} · gain annuel:{" "}
              {formatCurrency(comparison.annualSavingsEur)}
            </p>
          </div>

          <AutonomySelector value={autonomyLevel} onChange={setAutonomyLevel} />
        </CardContent>
      </Card>

      <div className="sticky bottom-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" variant="accent" className="w-full">
              Confirmer le switch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dernière validation</DialogTitle>
              <DialogDescription>
                Nova va simuler l'activation du nouveau contrat en mode {autonomyLevel}.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex justify-end">
              <Button onClick={confirmSwitch} disabled={isPending}>
                {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Lancer la simulation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
