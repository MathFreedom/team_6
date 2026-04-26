"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    features: ["Prix fixe 2 ans", "Sans surprise"],
  },
];

export default function ResultsPage() {
  const router = useRouter();
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);

  const handleContinue = () => {
    if (!selectedOfferId) return;
    const offer = recommendedOffers.find((o) => o.id === selectedOfferId);
    if (offer) {
      localStorage.setItem("nova-selected-offer", JSON.stringify(offer));
    }
    router.push("/mandate");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white text-[#0a1628]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-6 pt-[58px] pb-3">
        <button
          onClick={() => router.push("/dashboard")}
          aria-label="Retour"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-medium">Offres pour toi</h1>
        <span className="w-10" />
      </header>

      <div className="flex-1 px-6 pb-8">
        {/* Mascotte */}
        <div className="mt-4">
          <MascotBubble message="J'ai trouvé 3 offres bien adaptées à toi. Choisis celle qui te plaît, je m'occupe du reste." />
        </div>

        {/* Liste offres */}
        <section className="mt-6 flex flex-col gap-3">
          {recommendedOffers.map((offer) => {
            const selected = offer.id === selectedOfferId;
            return (
              <button
                key={offer.id}
                onClick={() => setSelectedOfferId(offer.id)}
                className="w-full rounded-3xl bg-white p-5 text-left transition-all"
                style={{
                  border: `1px solid ${selected ? "#0a1628" : "rgba(10,22,40,0.08)"}`,
                  boxShadow: selected ? "0 0 0 1px #0a1628 inset" : "none",
                }}
              >
                {/* Top row: logo + nom + radio */}
                <div className="flex items-start gap-3">
                  <ProviderLogo name={offer.provider} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm" style={{ color: "#5a6b80" }}>
                      {offer.provider}
                    </p>
                    <p className="mt-0.5 text-base font-semibold leading-tight">
                      {offer.offerName}
                    </p>
                  </div>
                  <span
                    className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full transition-colors"
                    style={{
                      border: `2px solid ${selected ? "#0a1628" : "rgba(10,22,40,0.2)"}`,
                    }}
                  >
                    {selected && (
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: "#0a1628" }}
                      />
                    )}
                  </span>
                </div>

                {/* Prix + économies */}
                <div
                  className="mt-4 flex items-end justify-between border-t pt-4"
                  style={{ borderColor: "rgba(10,22,40,0.06)" }}
                >
                  <div>
                    <p className="text-xs" style={{ color: "#5a6b80" }}>
                      Prix annuel estimé
                    </p>
                    <p className="mt-0.5 text-xl font-semibold tabular-nums">
                      {offer.newAnnualCost} €
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: "#5a6b80" }}>
                      Tu économises
                    </p>
                    <p
                      className="mt-0.5 text-base font-semibold tabular-nums"
                      style={{ color: "#059669" }}
                    >
                      {offer.annualSavings} €/an
                    </p>
                  </div>
                </div>

                {/* Tags descriptifs */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {offer.features.map((f) => (
                    <span
                      key={f}
                      className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: "#f3f4f6", color: "#5a6b80" }}
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
            className="h-14 w-full rounded-2xl text-base font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: "#1e40af" }}
          >
            {selectedOfferId ? "Continuer avec cette offre" : "Choisis une offre"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="h-12 w-full rounded-2xl bg-white text-sm font-medium transition-colors hover:bg-black/5"
            style={{ color: "#5a6b80" }}
          >
            Plus tard
          </button>
        </div>
      </div>
    </main>
  );
}
