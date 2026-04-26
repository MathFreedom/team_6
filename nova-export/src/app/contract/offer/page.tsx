"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractProgress } from "@/components/contract/ContractProgress";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import offersData from "@/data/all_offers.json";

const STORAGE_KEY = "nova-signup";
const VISIBLE_LIMIT = 3;

type TariffType = "base" | "hp_hc" | "tempo";

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
  hp_hc: "Heures Pleines / Heures Creuses",
  tempo: "Tempo",
};

const isTempo = (offer: Offer) =>
  offer.name.toLowerCase().includes("tempo");

function offersFor(providerName: string, tariff: TariffType): Offer[] {
  const all = (offersData.offers as Offer[]).filter(
    (o) => o.provider_name === providerName
  );
  if (tariff === "tempo") return all.filter(isTempo);
  if (tariff === "hp_hc") {
    return all.filter(
      (o) => !isTempo(o) && o.tariff_types_seen.includes(2)
    );
  }
  return all.filter(
    (o) => !isTempo(o) && o.tariff_types_seen.includes(1)
  );
}

/**
 * Trie : (1) l'offre par défaut en premier, (2) puis tri alphabétique par nom.
 * Default = "Tarif Bleu réglementé" pour EDF/Base, sinon la première trouvée.
 */
function sortOffers(
  offers: Offer[],
  provider: string,
  tariff: TariffType
): Offer[] {
  if (offers.length <= 1) return offers;

  let defaultOffer: Offer | undefined;
  if (provider === "EDF" && tariff === "base") {
    defaultOffer = offers.find(
      (o) =>
        o.name.toLowerCase().includes("tarif bleu") &&
        o.name.toLowerCase().includes("réglementé")
    );
  }
  if (!defaultOffer) defaultOffer = offers[0];

  const rest = offers
    .filter((o) => o.id !== defaultOffer!.id)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return [defaultOffer, ...rest];
}

/** Tente d'extraire le 1er prix du kWh trouvé dans la description (ex: "0,2516 €/kWh"). */
function extractKwhPrice(description: string): string | null {
  const match = description.match(
    /(\d+[.,]\d+)\s*(?:€|EUR)?\s*(?:\/|par\s+)\s*kWh/i
  );
  if (!match) return null;
  return `${match[1].replace(".", ",")} €/kWh`;
}

function formatSubscribing(price?: string): string | null {
  if (!price) return null;
  const num = parseFloat(price.replace(",", "."));
  if (Number.isNaN(num)) return price;
  return `${num.toFixed(2).replace(".", ",")} €/an`;
}

export default function OfferPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<string>("EDF");
  const [tariff, setTariff] = useState<TariffType>("base");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Hydratation
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const p = data?.currentContract?.provider;
      const t = data?.currentContract?.tariff;
      const oid = data?.currentContract?.offerId;
      if (typeof p === "string") setProvider(p);
      if (t === "base" || t === "hp_hc" || t === "tempo") setTariff(t);
      if (typeof oid === "number") setSelectedId(oid);
    } catch {
      /* noop */
    }
  }, []);

  const offers = useMemo(
    () => sortOffers(offersFor(provider, tariff), provider, tariff),
    [provider, tariff]
  );

  // Default selection (la 1ère après tri = offre par défaut)
  useEffect(() => {
    if (offers.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId && offers.some((o) => o.id === selectedId)) return;
    setSelectedId(offers[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers]);

  // Si on change de combinaison provider/tariff, on referme la liste étendue.
  useEffect(() => {
    setShowAll(false);
  }, [provider, tariff]);

  // Si l'offre sélectionnée est au-delà des 3 visibles, on déplie automatiquement.
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
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      const next = {
        ...prev,
        currentContract: {
          ...(prev.currentContract ?? {}),
          provider,
          tariff,
          offerId: offer.id,
          offerName: offer.name,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
    router.push("/scan-prm");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <ContractProgress step={3} />

      {/* keyframes pour l'animation rise-in (stagger côté style inline) */}
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

      <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-[430px] flex-col px-6 pb-8">
        <div className="mt-4">
          <MascotBubble message="Voici les offres disponibles selon tes choix. Sélectionne celle qui correspond à ton contrat actuel." />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Ton offre actuelle
        </h1>

        {/* Récap des choix précédents */}
        <p className="mt-2 text-sm text-[#5a6b80]">
          {provider} · {TARIFF_LABELS[tariff]}
        </p>

        {/* Liste des offres */}
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
                Aucune offre trouvée pour cette combinaison.
              </p>
              <Link
                href="/contract/provider"
                className="text-sm font-medium text-[#1e40af] hover:underline"
              >
                Modifier mes choix
              </Link>
            </div>
          ) : (
            visibleOffers.map((offer, idx) => {
              const isSelected = offer.id === selectedId;
              const subscribing = formatSubscribing(offer.prices?.subscribing);
              const kwh = extractKwhPrice(offer.description);
              // Stagger uniquement pour les cards révélées par "Voir toutes".
              const isRevealed = idx >= VISIBLE_LIMIT;
              const animDelay = isRevealed
                ? `${(idx - VISIBLE_LIMIT) * 100}ms`
                : "0ms";

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
                    border: `1px solid ${
                      isSelected ? "#1e40af" : "rgba(10,22,40,0.08)"
                    }`,
                    boxShadow: "0 1px 2px rgba(10,22,40,0.04)",
                    animationDelay: animDelay,
                  }}
                >
                  {isSelected && (
                    <Check
                      className="absolute right-3 top-3 h-5 w-5 text-[#1e40af]"
                      strokeWidth={2.25}
                    />
                  )}
                  <span
                    className="pr-8 text-base font-semibold text-[#0a1628]"
                    style={{ textWrap: "pretty" as const }}
                  >
                    {offer.name}
                  </span>
                  <span className="text-xs text-[#5a6b80]">
                    {subscribing
                      ? `Abonnement ${subscribing}`
                      : "Abonnement selon options"}
                    {kwh ? ` · ${kwh}` : " · kWh selon options"}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Toggle "Voir toutes les N offres" / "Réduire la liste" */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="mt-3 self-center text-sm font-medium text-[#1e40af] hover:underline"
          >
            {showAll
              ? "Réduire la liste"
              : `Voir toutes les ${offers.length} offres`}
          </button>
        )}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedId}
          className="mt-8 h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40"
          style={{ marginTop: "auto" }}
        >
          Confirmer mon contrat
        </Button>
      </div>
    </main>
  );
}
