"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, MoonStar, CalendarDays, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractProgress } from "@/components/contract/ContractProgress";
import { MascotBubble } from "@/components/onboarding/MascotBubble";

const STORAGE_KEY = "nova-signup";

type TariffType = "base" | "hp_hc" | "tempo";

type TariffOption = {
  id: TariffType;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  edfOnly?: boolean;
};

const OPTIONS: TariffOption[] = [
  {
    id: "base",
    title: "Base",
    subtitle: "Un seul prix du kWh, 24h/24.",
    icon: Sun,
  },
  {
    id: "hp_hc",
    title: "Heures Pleines / Heures Creuses",
    subtitle: "Prix réduit la nuit (~8h/jour).",
    icon: MoonStar,
  },
  {
    id: "tempo",
    title: "Tempo",
    subtitle:
      "300 jours bleus pas chers, 22 jours rouges très chers (EDF uniquement).",
    icon: CalendarDays,
    edfOnly: true,
  },
];

export default function TariffPage() {
  const router = useRouter();
  const [tariff, setTariff] = useState<TariffType>("base");
  const [provider, setProvider] = useState<string>("EDF");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const storedProvider = data?.currentContract?.provider;
      const storedTariff = data?.currentContract?.tariff;
      if (typeof storedProvider === "string") setProvider(storedProvider);
      if (
        storedTariff === "base" ||
        storedTariff === "hp_hc" ||
        storedTariff === "tempo"
      ) {
        setTariff(storedTariff);
      }
    } catch {
      /* noop */
    }
  }, []);

  const isTempoBlocked = provider !== "EDF";

  // Si l'utilisateur arrive avec tariff=tempo mais a changé pour un non-EDF entre-temps,
  // on rabat sur "base".
  useEffect(() => {
    if (tariff === "tempo" && isTempoBlocked) setTariff("base");
  }, [tariff, isTempoBlocked]);

  const handleSubmit = () => {
    if (tariff === "tempo" && isTempoBlocked) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      const next = {
        ...prev,
        currentContract: {
          ...(prev.currentContract ?? {}),
          tariff,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
    router.push("/contract/offer");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <ContractProgress step={2} />

      <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-[430px] flex-col px-6 pb-8">
        <div className="mt-4">
          <MascotBubble gecko="/mascot/Contract-flow.svg" message="Quel type de tarif as-tu ? Si tu ne sais pas, c'est probablement « Base » (le plus courant)." />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Ton type de tarif
        </h1>

        <div className="mt-6 flex flex-col gap-3">
          {OPTIONS.map((opt) => {
            const isSelected = tariff === opt.id;
            const isDisabled = opt.edfOnly && isTempoBlocked;
            return (
              <TariffCard
                key={opt.id}
                option={opt}
                selected={isSelected}
                disabled={!!isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  setTariff(opt.id);
                }}
              />
            );
          })}
        </div>

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

function TariffCard({
  option,
  selected,
  disabled,
  onClick,
}: {
  option: TariffOption;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className="relative flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300 ease-out"
      style={{
        minHeight: 96,
        background: selected ? "#dbeafe" : "#ffffff",
        border: `1px solid ${
          selected ? "#1e40af" : "rgba(10,22,40,0.08)"
        }`,
        boxShadow: "0 1px 2px rgba(10,22,40,0.04)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {disabled && (
        <span
          className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide"
          style={{
            background: "#dbeafe",
            color: "#1e40af",
          }}
        >
          EDF uniquement
        </span>
      )}

      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{ background: "#dbeafe" }}
      >
        <Icon className="h-6 w-6 text-[#1e40af]" strokeWidth={2} />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <span className="text-base font-semibold text-[#0a1628]">
          {option.title}
        </span>
        <span
          className="text-xs text-[#5a6b80]"
          style={{ textWrap: "pretty" as const }}
        >
          {option.subtitle}
        </span>
      </div>

      {!disabled &&
        (selected ? (
          <Check
            className="h-5 w-5 shrink-0 text-[#1e40af]"
            strokeWidth={2.25}
          />
        ) : (
          <ChevronRight
            className="h-5 w-5 shrink-0 text-[#5a6b80]"
            strokeWidth={2}
          />
        ))}
    </button>
  );
}
