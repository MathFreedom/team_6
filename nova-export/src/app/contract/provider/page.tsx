"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContractProgress } from "@/components/contract/ContractProgress";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import offersData from "@/data/all_offers.json";

const STORAGE_KEY = "nova-signup";

/** Initiales pour le placeholder de logo (max 3 caractères). */
function initials(name: string): string {
  const cleaned = name.replace(/[()]/g, "").trim();
  // Si c'est un acronyme (tout en majuscules / chiffres), on garde tel quel tronqué.
  if (/^[A-Z0-9]+$/.test(cleaned)) return cleaned.slice(0, 3);
  // Sinon, premières lettres de chaque mot.
  return cleaned
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
}

export default function ProviderPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("EDF");
  const [search, setSearch] = useState("");

  // Liste unique des fournisseurs triés alphabétiquement.
  const allProviders = useMemo(() => {
    const set = new Set<string>(
      (offersData.offers as Array<{ provider_name: string }>).map(
        (o) => o.provider_name
      )
    );
    return [...set].sort((a, b) => a.localeCompare(b, "fr"));
  }, []);

  // Hydratation depuis localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const stored = data?.currentContract?.provider;
      if (typeof stored === "string" && stored.length > 0) {
        setSelected(stored);
      }
    } catch {
      /* noop */
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allProviders;
    return allProviders.filter((p) => p.toLowerCase().includes(q));
  }, [allProviders, search]);

  const handleSubmit = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      const next = {
        ...prev,
        currentContract: {
          ...(prev.currentContract ?? {}),
          provider: selected,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
    router.push("/contract/tariff");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <ContractProgress step={1} />

      <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-[430px] flex-col px-6 pb-8">
        <div className="mt-4">
          <MascotBubble message="Qui est ton fournisseur d'électricité actuel ? Si tu n'as jamais changé, c'est sûrement EDF." />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Ton fournisseur
        </h1>

        {/* Barre de recherche */}
        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a6b80]"
            strokeWidth={2}
          />
          <Input
            type="text"
            inputMode="search"
            placeholder="Rechercher un fournisseur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white pl-11 text-base"
          />
        </div>

        {/* Liste des fournisseurs */}
        <ul className="mt-4 flex flex-col gap-2">
          {filtered.length === 0 && (
            <li className="py-6 text-center text-sm text-[#5a6b80]">
              Aucun fournisseur trouvé.
            </li>
          )}

          {filtered.map((provider) => {
            const isSelected = provider === selected;
            return (
              <li key={provider}>
                <button
                  type="button"
                  onClick={() => setSelected(provider)}
                  className="flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all duration-300 ease-out hover:shadow-md"
                  style={{
                    minHeight: 64,
                    background: isSelected ? "#dbeafe" : "#ffffff",
                    border: `1px solid ${
                      isSelected ? "#1e40af" : "rgba(10,22,40,0.08)"
                    }`,
                    boxShadow: "0 1px 2px rgba(10,22,40,0.04)",
                  }}
                >
                  {/* Cercle initiales — placeholder pour futur logo */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: isSelected ? "#ffffff" : "#f3f4f6",
                      color: isSelected ? "#1e40af" : "#0a1628",
                    }}
                  >
                    <span className="text-xs font-semibold tracking-wide">
                      {initials(provider)}
                    </span>
                  </div>

                  <span className="flex-1 text-base font-medium text-[#0a1628]">
                    {provider}
                  </span>

                  {isSelected ? (
                    <Check
                      className="h-5 w-5 shrink-0 text-[#1e40af]"
                      strokeWidth={2.25}
                    />
                  ) : (
                    <ChevronRight
                      className="h-5 w-5 shrink-0 text-[#5a6b80]"
                      strokeWidth={2}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <Button
          type="button"
          onClick={handleSubmit}
          className="mt-8 h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40"
          style={{ marginTop: "auto" }}
        >
          Continuer
        </Button>
      </div>
    </main>
  );
}
