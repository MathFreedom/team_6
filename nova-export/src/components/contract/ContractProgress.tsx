"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type ContractProgressProps = {
  step: 1 | 2 | 3;
};

/**
 * Barre de progression du flow de saisie du contrat actuel.
 * 3 étapes : provider → tariff → offer.
 * Visuellement identique à SignupProgress mais sur 3 segments propres au flow contrat.
 */
export function ContractProgress({ step }: ContractProgressProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-20 w-full bg-white">
      <div className="mx-auto flex w-full max-w-[430px] items-center gap-3 px-6 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Retour"
          className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#0a1628] transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
        </button>

        <div className="flex flex-1 items-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors duration-300 ease-out"
              style={{ backgroundColor: i <= step ? "#1e40af" : "#e5e7eb" }}
            />
          ))}
        </div>

        <span className="shrink-0 text-xs font-medium text-[#5a6b80]">
          étape {step} sur 3
        </span>
      </div>
    </div>
  );
}
