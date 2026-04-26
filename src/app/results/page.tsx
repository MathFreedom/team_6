"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import { ProviderLogo } from "@/components/providers/ProviderLogo";

type Offer = {
  id: number;
  provider: string;
  offerName: string;
  currentAnnualCost: number;
  newAnnualCost: number;
  annualSavings: number;
  monthlySavings: number;
  badge: string;
  features: string[];
};

const recommendedOffers: Offer[] = [
  {
    id: 16816,
    provider: "Primeo Energie",
    offerName: "Offre Fixe Confort+",
    currentAnnualCost: 1247,
    newAnnualCost: 1002,
    annualSavings: 245,
    monthlySavings: 20.4,
    badge: "Meilleure offre",
    features: ["Prix fixe 1 an", "100% en ligne"],
  },
  {
    id: 16573,
    provider: "la bellenergie",
    offerName: "Prudence — électricité verte",
    currentAnnualCost: 1247,
    newAnnualCost: 1056,
    annualSavings: 191,
    monthlySavings: 15.9,
    badge: "100% verte",
    features: ["Prix fixe 1 an", "Énergie verte"],
  },
  {
    id: 16588,
    provider: "TotalEnergies",
    offerName: "Offre Fixe 2 ans Electricité",
    currentAnnualCost: 1247,
    newAnnualCost: 1098,
    annualSavings: 149,
    monthlySavings: 12.4,
    badge: "Stabilité",
    features: ["Prix fixe 2 ans", "Sans surprise"],
  },
];

const badgeColor = (badge: string) => {
  switch (badge) {
    case "Meilleure offre":
      return "#1e40af";
    case "100% verte":
      return "#059669";
    case "Stabilité":
      return "#6366f1";
    default:
      return "#1e40af";
  }
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export default function ResultsPage() {
  const router = useRouter();
  const [selectedOfferId, setSelectedOfferId] = useState<number>(
    recommendedOffers[0].id,
  );

  const maxSavings = Math.max(...recommendedOffers.map((o) => o.annualSavings));
  const maxMonthly = Math.max(...recommendedOffers.map((o) => o.monthlySavings));

  const handleContinue = () => {
    const offer = recommendedOffers.find((o) => o.id === selectedOfferId);
    if (offer) {
      localStorage.setItem("nova-selected-offer", JSON.stringify(offer));
    }
    router.push("/mandate");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white text-[#0a1628]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-6 py-4 pt-safe">
        <button
          onClick={() => router.push("/dashboard")}
          aria-label="Retour"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-medium">Tes meilleures offres</h1>
        <span className="w-10" />
      </header>

      <div className="flex-1 px-6 pb-8">
        {/* Hero économie */}
        <section
          className="mt-2 flex flex-col items-center gap-2 rounded-3xl p-6 text-center animate-rise-in"
          style={{ backgroundColor: "#dbeafe" }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#1e40af" }}
          >
            Économie maximale annuelle
          </span>
          <span
            className="text-5xl font-bold tabular-nums"
            style={{ color: "#1e40af" }}
          >
            {Math.round(maxSavings)} €
          </span>
          <span className="text-sm" style={{ color: "#5a6b80" }}>
            Soit ~{Math.round(maxMonthly)} € par mois sur ta facture actuelle
          </span>
        </section>

        {/* Mascotte */}
        <div className="mt-6">
          <MascotBubble gecko="/mascot/result.svg" message="J'ai analysé ton profil et ta consommation. Voici les 3 offres qui te font économiser le plus tout en restant adaptées à tes habitudes." />
        </div>

        {/* Liste offres */}
        <section className="mt-6 flex flex-col gap-3">
          {recommendedOffers.map((offer) => {
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
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: badgeColor(offer.badge) }}
                  >
                    {offer.badge}
                  </span>
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

                {/* Provider */}
                <p
                  className="mt-3 text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#5a6b80" }}
                >
                  {offer.provider}
                </p>

                {/* Offer name */}
                <p className="mt-1 text-base font-semibold">{offer.offerName}</p>

                {/* Économie */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: "#059669" }}
                  >
                    −{offer.annualSavings} €/an
                  </span>
                  <span className="text-xs" style={{ color: "#5a6b80" }}>
                    soit {Math.round(offer.monthlySavings)} €/mois
                  </span>
                </div>

                {/* Features */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {offer.features.map((f) => (
                    <span
                      key={f}
                      className="rounded-full px-2 py-1 text-xs"
                      style={{ backgroundColor: "#f8fafc", color: "#5a6b80" }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </section>

        {/* Boutons bas */}
        <div className="mt-8 flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={handleContinue}
            disabled={!selectedOfferId}
            className="h-14 w-full rounded-2xl text-base font-medium text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#1e40af" }}
          >
            Continuer avec cette offre
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="h-12 w-full rounded-2xl border bg-white text-sm font-medium transition-colors hover:bg-black/5"
            style={{ borderColor: "rgba(10,22,40,0.12)", color: "#5a6b80" }}
          >
            Plus tard, retour à l'accueil
          </button>
        </div>
      </div>
    </main>
  );
}
