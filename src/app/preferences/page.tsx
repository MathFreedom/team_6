"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { ProgressStepper } from "@/components/layout/progress-stepper";
import { PreferenceCardGroup } from "@/components/preferences/preference-card-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";
import { DEFAULT_PREFERENCES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

export default function PreferencesPage() {
  const router = useRouter();
  const hydrated = useJourneyHydrated();
  const billData = useJourneyStore((state) => state.billData);
  const storedPreferences = useJourneyStore((state) => state.preferences);
  const setPreferences = useJourneyStore((state) => state.setPreferences);
  const setComparison = useJourneyStore((state) => state.setComparison);
  const [isPending, startTransition] = useTransition();
  const [preferences, setLocalPreferences] = useState(storedPreferences ?? DEFAULT_PREFERENCES);

  useEffect(() => {
    if (hydrated && !billData) {
      router.replace("/connect");
    }
  }, [billData, hydrated, router]);

  useEffect(() => {
    if (hydrated) {
      setLocalPreferences(storedPreferences);
    }
  }, [hydrated, storedPreferences]);

  if (!hydrated) {
    return <Skeleton className="app-screen h-[480px] w-full" />;
  }

  if (!billData) {
    return <Skeleton className="app-screen h-[480px] w-full" />;
  }

  const submit = () => {
    startTransition(async () => {
      try {
        setPreferences(preferences);
        const response = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ billData, preferences }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Comparaison impossible");
        }

        setComparison(payload.comparison);
        toast.success("Comparaison terminée.");
        router.push("/results");
      } catch (caughtError) {
        toast.error(caughtError instanceof Error ? caughtError.message : "Comparaison impossible");
      }
    });
  };

  return (
    <div className="app-screen space-y-4">
      <ProgressStepper currentPath="/preferences" />
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">Cadrez la décision</CardTitle>
          <p className="text-sm text-muted-foreground">
            Réglez les quelques critères qui comptent. Le reste du travail de comparaison est automatisé.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <PreferenceCardGroup
            title="Type d'énergie"
            value={preferences.energyType}
            onChange={(energyType) => setLocalPreferences((prev) => ({ ...prev, energyType }))}
            options={[
              { value: "renewable_only", label: "100% renouvelable", hint: "Filtre strict sur les offres vertes." },
              { value: "mixed", label: "Mix équilibré", hint: "Un bon compromis si le rapport qualité-prix est meilleur." },
              { value: "no_preference", label: "Sans préférence", hint: "L'agent arbitre librement selon le score global." },
            ]}
          />
          <PreferenceCardGroup
            title="Priorité de décision"
            value={preferences.pricePriority}
            onChange={(pricePriority) => setLocalPreferences((prev) => ({ ...prev, pricePriority }))}
            options={[
              { value: "cheapest", label: "Le moins cher", hint: "Objectif coût minimal." },
              { value: "best_value", label: "Meilleur rapport qualité-prix", hint: "Prix, confiance et qualité du fournisseur." },
            ]}
          />
          <PreferenceCardGroup
            title="Stabilité tarifaire"
            value={preferences.tariffStability}
            onChange={(tariffStability) => setLocalPreferences((prev) => ({ ...prev, tariffStability }))}
            options={[
              { value: "fixed_only", label: "Fixe uniquement", hint: "Je verrouille le prix." },
              { value: "prefer_fixed", label: "Fixe de préférence", hint: "Je privilégie la stabilité sans l'imposer." },
              { value: "prefer_indexed", label: "Indexé de préférence", hint: "Je vise la meilleure performance marché." },
              { value: "no_preference", label: "Aucune préférence", hint: "Le score final décide." },
            ]}
          />
          <PreferenceCardGroup
            title="Origine du fournisseur"
            value={preferences.providerOrigin}
            onChange={(providerOrigin) => setLocalPreferences((prev) => ({ ...prev, providerOrigin }))}
            options={[
              { value: "french_only", label: "Français uniquement", hint: "Filtre strict." },
              { value: "prefer_french", label: "Français de préférence", hint: "Bonus pour les acteurs français." },
              { value: "no_preference", label: "Aucune préférence", hint: "Je regarde tout le marché." },
            ]}
          />

          <div className="space-y-3">
            <h3 className="font-[var(--font-display)] text-lg font-semibold">Niveau de réputation minimum</h3>
            <div className="rounded-[24px] border border-border bg-white/70 p-4">
              <div className="mb-4 flex items-center justify-between gap-3 text-sm">
                <span>Trustpilot minimum</span>
                <span className="font-semibold">{preferences.minimumTrustpilotRating.toFixed(1)} / 5</span>
              </div>
              <Slider
                min={3}
                max={5}
                step={0.1}
                value={[preferences.minimumTrustpilotRating]}
                onValueChange={([minimumTrustpilotRating]) =>
                  setLocalPreferences((prev) => ({ ...prev, minimumTrustpilotRating }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-3">
        <Card className="border-primary/15 bg-white/88">
          <CardContent className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Comparer le marché maintenant</div>
              <p className="text-xs text-muted-foreground">Nova applique vos règles au profil extrait.</p>
            </div>
            <Button size="lg" variant="accent" onClick={submit} disabled={isPending} className="shrink-0">
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Comparer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
