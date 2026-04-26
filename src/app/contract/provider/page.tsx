"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContractProgress } from "@/components/contract/ContractProgress";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import { ProviderLogo } from "@/components/providers/ProviderLogo";
import offersData from "@/data/all_offers.json";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";

export default function ProviderPage() {
  const router = useRouter();
  const hydrated = useJourneyHydrated();
  const billData = useJourneyStore((s) => s.billData);
  const setBillData = useJourneyStore((s) => s.setBillData);

  const [selected, setSelected] = useState<string>("EDF");
  const [search, setSearch] = useState("");

  const allProviders = useMemo(() => {
    const set = new Set<string>(
      (offersData.offers as Array<{ provider_name: string }>).map(
        (o) => o.provider_name,
      ),
    );
    return [...set].sort((a, b) => a.localeCompare(b, "fr"));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (billData?.providerName) setSelected(billData.providerName);
  }, [hydrated, billData?.providerName]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allProviders;
    return allProviders.filter((p) => p.toLowerCase().includes(q));
  }, [allProviders, search]);

  const handleSubmit = () => {
    if (billData) {
      setBillData({ ...billData, providerName: selected });
    }
    router.push("/contract/tariff");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <ContractProgress step={1} />

      <div className="app-screen app-fill page-gutter page-bottom-safe flex flex-col pb-8">
        <div className="mt-4">
          <MascotBubble gecko="/mascot/Contract-flow.svg" message="Who is your current electricity provider? If you've never switched, it's probably EDF." />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Your provider
        </h1>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a6b80]" strokeWidth={2} />
          <Input type="text" inputMode="search" placeholder="Search for a provider..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 rounded-2xl border-[rgba(10,22,40,0.08)] bg-white pl-11 text-base" />
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {filtered.length === 0 && (
            <li className="py-6 text-center text-sm text-[#5a6b80]">
              No provider found.
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
                    border: `1px solid ${isSelected ? "#1e40af" : "rgba(10,22,40,0.08)"}`,
                    boxShadow: "0 1px 2px rgba(10,22,40,0.04)",
                  }}
                >
                  <ProviderLogo name={provider} size={40} />
                  <span className="flex-1 text-base font-medium text-[#0a1628]">
                    {provider}
                  </span>
                  {isSelected ? (
                    <Check className="h-5 w-5 shrink-0 text-[#1e40af]" strokeWidth={2.25} />
                  ) : (
                    <ChevronRight className="h-5 w-5 shrink-0 text-[#5a6b80]" strokeWidth={2} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <Button type="button" onClick={handleSubmit} className="mt-8 h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40" style={{ marginTop: "auto" }}>
          Continue
        </Button>
      </div>
    </main>
  );
}
