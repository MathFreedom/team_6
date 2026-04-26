"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractProgress } from "@/components/contract/ContractProgress";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import offersData from "@/data/all_offers.json";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";
import type { TariffOption as BillTariffOption } from "@/types/energy";

const VISIBLE_LIMIT = 3;

type TariffType = "base" | "hp_hc" | "tempo";

const BILL_TO_TARIFF: Record<BillTariffOption, TariffType> = {
  BASE: "base",
  HP_HC: "hp_hc",
  TEMPO: "tempo",
  EJP: "base",
};

type Offer = {
  id: number;
  provider_id: number;
  provider_name: string;
  name: string;
  description: string;
  tariff_types_seen: number[];
  prices: { subscribing?: string; [key: string]: unknown };
};

const TARIFF_LABELS: Record<TariffType, string> = {
  base: "Base",
  hp_hc: "Peak / Off-peak",
  tempo: "Tempo",
};

const isTempo = (offer: Offer) => offer.name.toLowerCase().includes("tempo");

function offersFor(providerName: string, tariff: TariffType): Offer[] {
  const all = (offersData.offers as Offer[]).filter((o) => o.provider_name === providerName);
  if (tariff === "tempo") return all.filter(isTempo);
  if (tariff === "hp_hc") {
    return all.filter((o) => !isTempo(o) && o.tariff_types_seen.includes(2));
  }
  return all.filter((o) => !isTempo(o) && o.tariff_types_seen.includes(1));
}

function sortOffers(offers: Offer[], provider: string, tariff: TariffType): Offer[] {
  if (offers.length <= 1) return offers;

  let defaultOffer: Offer | undefined;
  if (provider === "EDF" && tariff === "base") {
    defaultOffer = offers.find(
      (o) =>
        o.name.toLowerCase().includes("tarif bleu") &&
        o.name.toLowerCase().includes("reglemente"),
    );
  }
  if (!defaultOffer) defaultOffer = offers[0];

  const rest = offers
    .filter((o) => o.id !== defaultOffer!.id)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return [defaultOffer, ...rest];
}

function extractKwhPrice(description: string): string | null {
  const normalized = description.replace(/€/g, "EUR");
  const match = normalized.match(/(\d+[.,]\d+)\s*(?:EUR)?\s*(?:\/|par\s+)\s*kWh/i);
  if (!match) return null;
  return `${match[1].replace(".", ",")} EUR/kWh`;
}

function formatSubscribing(price?: string): string | null {
  if (!price) return null;
  const num = parseFloat(price.replace(",", "."));
  if (Number.isNaN(num)) return price;
  return `${num.toFixed(2).replace(".", ",")} EUR/year`;
}

export default function OfferPage() {
  const router = useRouter();
  const hydrated = useJourneyHydrated();
  const billData = useJourneyStore((s) => s.billData);
  const setBillData = useJourneyStore((s) => s.setBillData);

  const provider = billData?.providerName ?? "EDF";
  const tariff: TariffType = billData?.tariffOption ? BILL_TO_TARIFF[billData.tariffOption] : "base";

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (billData?.currentOfferId != null) setSelectedId(billData.currentOfferId);
  }, [hydrated, billData?.currentOfferId]);

  const offers = useMemo(
    () => sortOffers(offersFor(provider, tariff), provider, tariff),
    [provider, tariff],
  );

  useEffect(() => {
    if (offers.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId && offers.some((o) => o.id === selectedId)) return;
    setSelectedId(offers[0].id);
  }, [offers, selectedId]);

  useEffect(() => {
    setShowAll(false);
  }, [provider, tariff]);

  useEffect(() => {
    if (!selectedId) return;
    const idx = offers.findIndex((o) => o.id === selectedId);
    if (idx >= VISIBLE_LIMIT) setShowAll(true);
  }, [selectedId, offers]);

  const visibleOffers = showAll ? offers : offers.slice(0, VISIBLE_LIMIT);
  const hasMore = offers.length > VISIBLE_LIMIT;

  const handleSubmit = () => {
    const offer = offers.find((o) => o.id === selectedId);
    if (!offer) return;
    if (billData) {
      setBillData({
        ...billData,
        providerName: provider,
        offerName: offer.name,
        currentOfferId: offer.id,
      });
    }
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <ContractProgress step={3} />

      <style jsx>{`
        @keyframes riseIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .rise-in {
          animation: riseIn 320ms ease-out both;
        }
      `}</style>

      <div className="app-screen app-fill page-gutter page-bottom-safe flex flex-col pb-8">
        <div className="mt-4">
          <MascotBubble gecko="/mascot/Contract-flow.svg" message="Here are the offers available for your choices. Select the one that matches your current contract." />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Your current plan
        </h1>

        <p className="mt-2 text-sm text-[#5a6b80]">
          {provider} · {TARIFF_LABELS[tariff]}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {offers.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 rounded-2xl p-6 text-center"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(10,22,40,0.08)",
              }}
            >
              <p className="text-sm text-[#0a1628]">
                No offer found for this combination.
              </p>
              <Link href="/contract/provider" className="text-sm font-medium text-[#1e40af] hover:underline">
                Change my selections
              </Link>
            </div>
          ) : (
            visibleOffers.map((offer, idx) => {
              const isSelected = offer.id === selectedId;
              const subscribing = formatSubscribing(offer.prices?.subscribing);
              const kwh = extractKwhPrice(offer.description);
              const isRevealed = idx >= VISIBLE_LIMIT;
              const animDelay = isRevealed ? `${(idx - VISIBLE_LIMIT) * 100}ms` : "0ms";

              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setSelectedId(offer.id)}
                  aria-pressed={isSelected}
                  className={`relative flex w-full flex-col gap-1 rounded-2xl p-4 text-left transition-all duration-300 ease-out ${
                    isRevealed ? "rise-in" : ""
                  }`}
                  style={{
                    background: isSelected ? "#dbeafe" : "#ffffff",
                    border: `1px solid ${isSelected ? "#1e40af" : "rgba(10,22,40,0.08)"}`,
                    boxShadow: "0 1px 2px rgba(10,22,40,0.04)",
                    animationDelay: animDelay,
                  }}
                >
                  {isSelected && (
                    <Check className="absolute right-3 top-3 h-5 w-5 text-[#1e40af]" strokeWidth={2.25} />
                  )}
                  <span className="pr-8 text-base font-semibold text-[#0a1628]" style={{ textWrap: "pretty" as const }}>
                    {offer.name}
                  </span>
                  <span className="text-xs text-[#5a6b80]">
                    {subscribing ? `Subscription ${subscribing}` : "Subscription depends on options"}
                    {kwh ? ` · ${kwh}` : " · kWh depends on options"}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="mt-3 self-center text-sm font-medium text-[#1e40af] hover:underline"
          >
            {showAll ? "Show fewer" : `See all ${offers.length} offers`}
          </button>
        )}

        <Button type="button" onClick={handleSubmit} disabled={!selectedId} className="mt-8 h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40" style={{ marginTop: "auto" }}>
          Confirm my contract
        </Button>
      </div>
    </main>
  );
}
