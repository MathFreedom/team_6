"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import { ProviderLogo } from "@/components/providers/ProviderLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";

type DisplayOffer = {
  id: string;
  provider: string;
  offerName: string;
  annualSavings: number;
  monthlySavings: number;
  badge: string | null;
};

const badgeColor = (badge: string) => {
  switch (badge) {
    case "Best offer":
      return "#1e40af";
    default:
      return "#1e40af";
  }
};

function pickBadge(isTop: boolean): string | null {
  return isTop ? "Best offer" : null;
}

export default function ResultsPage() {
  const router = useRouter();
  const hydrated = useJourneyHydrated();
  const billData = useJourneyStore((s) => s.billData);
  const comparison = useJourneyStore((s) => s.comparison);
  const selectedOfferId = useJourneyStore((s) => s.selectedOfferId);
  const setSelectedOfferId = useJourneyStore((s) => s.setSelectedOfferId);

  const top3: DisplayOffer[] = useMemo(() => {
    if (!comparison) return [];
    return comparison.rankedOffers.slice(0, 3).map((r, idx) => ({
      id: r.offerId,
      provider: r.providerName,
      offerName: r.offerName,
      annualSavings: r.annualSavingsEur,
      monthlySavings: r.annualSavingsEur / 12,
      badge: pickBadge(idx === 0),
    }));
  }, [comparison]);

  useEffect(() => {
    if (!hydrated) return;
    if (!billData || !comparison) {
      router.replace("/scan-prm");
      return;
    }
    if (top3.length > 0 && (!selectedOfferId || !top3.some((o) => o.id === selectedOfferId))) {
      setSelectedOfferId(top3[0].id);
    }
  }, [hydrated, billData, comparison, top3, selectedOfferId, setSelectedOfferId, router]);

  if (!hydrated || !comparison || top3.length === 0) {
    return <Skeleton className="app-screen mt-8 h-[560px] w-full" />;
  }

  const maxSavings = Math.max(...top3.map((o) => o.annualSavings));
  const maxMonthly = Math.max(...top3.map((o) => o.monthlySavings));

  const handleContinue = () => {
    if (selectedOfferId) router.push("/mandate");
  };

  return (
    <main className="app-shell flex flex-col bg-white text-[#0a1628]">
      <header className="page-gutter sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white py-4 pt-safe">
        <button
          onClick={() => router.push("/dashboard")}
          aria-label="Back"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-medium">Your best offers</h1>
        <span className="w-10" />
      </header>

      <div className="page-gutter page-bottom-safe flex-1 pb-8">
        <section
          className="animate-rise-in mt-2 flex flex-col items-center gap-2 rounded-3xl p-6 text-center"
          style={{ backgroundColor: "#dbeafe" }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#1e40af" }}
          >
            Maximum annual savings
          </span>
          <span
            className="text-5xl font-bold tabular-nums"
            style={{ color: "#1e40af" }}
          >
            {Math.round(maxSavings)} EUR
          </span>
          <span className="text-sm" style={{ color: "#5a6b80" }}>
            About ~{Math.round(maxMonthly)} EUR per month on your current bill
          </span>
        </section>

        <div className="mt-6">
          <MascotBubble
            gecko="/mascot/result.svg"
            message={
              comparison.recommendationTextFr ||
              "I analyzed your profile and your consumption. Here are the 3 offers that save you the most while matching your habits."
            }
          />
        </div>

        <section className="mt-6 flex flex-col gap-3">
          {top3.map((offer) => {
            const selected = offer.id === selectedOfferId;
            return (
              <button
                key={offer.id}
                onClick={() => setSelectedOfferId(offer.id)}
                className="group relative w-full rounded-2xl border p-4 text-left transition-all"
                style={{
                  backgroundColor: selected ? "#eef4ff" : "#ffffff",
                  borderColor: selected ? "#1e40af" : "rgba(10,22,40,0.08)",
                  boxShadow: selected
                    ? "0 6px 16px -8px rgba(30,64,175,0.35)"
                    : "0 1px 2px rgba(10,22,40,0.04)",
                  transform: selected ? "scale(1.005)" : "scale(1)",
                }}
              >
                <div className="flex items-start justify-between">
                  {offer.badge ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: badgeColor(offer.badge) }}
                    >
                      {offer.badge}
                    </span>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-2">
                    {selected && (
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ backgroundColor: "#1e40af" }}
                        aria-hidden
                      >
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </span>
                    )}
                    <ProviderLogo name={offer.provider} size={40} />
                  </div>
                </div>

                <p
                  className="mt-3 text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#5a6b80" }}
                >
                  {offer.provider}
                </p>

                <p className="mt-1 text-base font-semibold">{offer.offerName}</p>

                <div className="mt-3 flex items-baseline gap-2">
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: "#059669" }}
                  >
                    -{Math.round(offer.annualSavings)} EUR/year
                  </span>
                  <span className="text-xs" style={{ color: "#5a6b80" }}>
                    or {Math.round(offer.monthlySavings)} EUR/month
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleContinue}
            disabled={!selectedOfferId}
            className="h-14 w-full rounded-2xl text-base font-medium text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#1e40af" }}
          >
            Continue with this offer
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="h-12 w-full rounded-2xl border bg-white text-sm font-medium transition-colors hover:bg-black/5"
            style={{ borderColor: "rgba(10,22,40,0.12)", color: "#5a6b80" }}
          >
            Maybe later, back to home
          </button>
        </div>
      </div>
    </main>
  );
}
