"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, MoonStar, CalendarDays, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractProgress } from "@/components/contract/ContractProgress";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";
import type { TariffOption as BillTariffOption } from "@/types/energy";

type TariffType = "base" | "hp_hc" | "tempo";

const TARIFF_TO_BILL: Record<TariffType, BillTariffOption> = {
  base: "BASE",
  hp_hc: "HP_HC",
  tempo: "TEMPO",
};

const BILL_TO_TARIFF: Record<BillTariffOption, TariffType> = {
  BASE: "base",
  HP_HC: "hp_hc",
  TEMPO: "tempo",
  EJP: "base",
};

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
    subtitle: "One single kWh price, 24/7.",
    icon: Sun,
  },
  {
    id: "hp_hc",
    title: "Peak / Off-peak",
    subtitle: "Lower price at night, around 8 hours per day.",
    icon: MoonStar,
  },
  {
    id: "tempo",
    title: "Tempo",
    subtitle: "300 low-cost blue days, 22 very expensive red days. EDF only.",
    icon: CalendarDays,
    edfOnly: true,
  },
];

export default function TariffPage() {
  const router = useRouter();
  const hydrated = useJourneyHydrated();
  const billData = useJourneyStore((s) => s.billData);
  const setBillData = useJourneyStore((s) => s.setBillData);

  const [tariff, setTariff] = useState<TariffType>("base");

  useEffect(() => {
    if (!hydrated) return;
    if (billData?.tariffOption) {
      setTariff(BILL_TO_TARIFF[billData.tariffOption]);
    }
  }, [hydrated, billData?.tariffOption]);

  const provider = billData?.providerName ?? "EDF";
  const isTempoBlocked = provider !== "EDF";

  useEffect(() => {
    if (tariff === "tempo" && isTempoBlocked) setTariff("base");
  }, [tariff, isTempoBlocked]);

  const handleSubmit = () => {
    if (tariff === "tempo" && isTempoBlocked) return;
    if (billData) {
      setBillData({ ...billData, tariffOption: TARIFF_TO_BILL[tariff] });
    }
    router.push("/contract/offer");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <ContractProgress step={2} />

      <div className="app-screen app-fill page-gutter page-bottom-safe flex flex-col pb-8">
        <div className="mt-4">
          <MascotBubble gecko="/mascot/Contract-flow.svg" message="What tariff type do you have? If you're not sure, it's probably Base, the most common one." />
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#0a1628]">
          Your tariff type
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

        <Button type="button" onClick={handleSubmit} className="mt-8 h-14 w-full rounded-2xl bg-[#1e40af] text-base font-medium text-white shadow-none hover:bg-[#1e3a8a] disabled:opacity-40" style={{ marginTop: "auto" }}>
          Continue
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
        border: `1px solid ${selected ? "#1e40af" : "rgba(10,22,40,0.08)"}`,
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
          EDF only
        </span>
      )}

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: "#dbeafe" }}>
        <Icon className="h-6 w-6 text-[#1e40af]" strokeWidth={2} />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <span className="text-base font-semibold text-[#0a1628]">
          {option.title}
        </span>
        <span className="text-xs text-[#5a6b80]" style={{ textWrap: "pretty" as const }}>
          {option.subtitle}
        </span>
      </div>

      {!disabled &&
        (selected ? (
          <Check className="h-5 w-5 shrink-0 text-[#1e40af]" strokeWidth={2.25} />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0 text-[#5a6b80]" strokeWidth={2} />
        ))}
    </button>
  );
}
