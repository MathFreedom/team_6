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
          throw new Error(payload.error || "Comparison failed");
        }

        setComparison(payload.comparison);
        toast.success("Comparison complete.");
        router.push("/results");
      } catch (caughtError) {
        toast.error(caughtError instanceof Error ? caughtError.message : "Comparison failed");
      }
    });
  };

  return (
    <div className="app-screen space-y-4">
      <ProgressStepper currentPath="/preferences" />
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">Frame the decision</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set the few criteria that matter. The rest of the comparison work is automated.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <PreferenceCardGroup
            title="Energy type"
            value={preferences.energyType}
            onChange={(energyType) => setLocalPreferences((prev) => ({ ...prev, energyType }))}
            options={[
              { value: "renewable_only", label: "100% renewable", hint: "Strict filter on green offers." },
              { value: "mixed", label: "Balanced mix", hint: "A good compromise if the value is better." },
              { value: "no_preference", label: "No preference", hint: "The agent decides freely on overall score." },
            ]}
          />
          <PreferenceCardGroup
            title="Decision priority"
            value={preferences.pricePriority}
            onChange={(pricePriority) => setLocalPreferences((prev) => ({ ...prev, pricePriority }))}
            options={[
              { value: "cheapest", label: "Cheapest", hint: "Minimize cost." },
              { value: "best_value", label: "Best value", hint: "Price, trust and provider quality." },
            ]}
          />
          <PreferenceCardGroup
            title="Tariff stability"
            value={preferences.tariffStability}
            onChange={(tariffStability) => setLocalPreferences((prev) => ({ ...prev, tariffStability }))}
            options={[
              { value: "fixed_only", label: "Fixed only", hint: "Lock the price." },
              { value: "prefer_fixed", label: "Prefer fixed", hint: "Favor stability without forcing it." },
              { value: "prefer_indexed", label: "Prefer indexed", hint: "Aim for best market performance." },
              { value: "no_preference", label: "No preference", hint: "The final score decides." },
            ]}
          />
          <PreferenceCardGroup
            title="Provider origin"
            value={preferences.providerOrigin}
            onChange={(providerOrigin) => setLocalPreferences((prev) => ({ ...prev, providerOrigin }))}
            options={[
              { value: "french_only", label: "French only", hint: "Strict filter." },
              { value: "prefer_french", label: "Prefer French", hint: "Bonus for French players." },
              { value: "no_preference", label: "No preference", hint: "I look at the whole market." },
            ]}
          />

          <div className="space-y-3">
            <h3 className="font-[var(--font-display)] text-lg font-semibold">Minimum reputation</h3>
            <div className="rounded-[24px] border border-border bg-white/70 p-4">
              <div className="mb-4 flex items-center justify-between gap-3 text-sm">
                <span>Minimum Trustpilot</span>
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
              <div className="text-sm font-semibold">Compare the market now</div>
              <p className="text-xs text-muted-foreground">Nova applies your rules to the extracted profile.</p>
            </div>
            <Button size="lg" variant="accent" onClick={submit} disabled={isPending} className="shrink-0">
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Compare
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
