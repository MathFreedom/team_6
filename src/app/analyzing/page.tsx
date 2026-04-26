"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";
import { useAuthProfileStore } from "@/lib/store/auth-profile-store";
import { useAuthProfileHydrated } from "@/lib/store/use-auth-profile-hydrated";
import {
  EnergyOptimizerError,
  recommendOffers,
  toJourneyState,
} from "@/lib/api/energy-optimizer";

type Phase = { image: string; message: string };

const PHASES: Phase[] = [
  { image: "/mascot/scanning.svg", message: "Retrieving your PRM number..." },
  { image: "/mascot/Analysing.svg", message: "Connecting to Enedis and your Linky meter..." },
  { image: "/mascot/analyzing-2.svg", message: "Analyzing your consumption profile..." },
  { image: "/mascot/Analyzing-3.svg", message: "Comparing the 78 market offers..." },
  { image: "/mascot/result.svg", message: "I found your best recommendations!" },
];

const PHASE_DURATION_MS = 3000;
const TOTAL_DURATION_MS = PHASE_DURATION_MS * PHASES.length;
const TICK_MS = 100;
const ZIPCODE_FALLBACK = "75001";

export default function AnalyzingPage() {
  const router = useRouter();
  const journeyHydrated = useJourneyHydrated();
  const authHydrated = useAuthProfileHydrated();
  const pendingPrm = useJourneyStore((s) => s.pendingPrm);
  const setBillData = useJourneyStore((s) => s.setBillData);
  const setComparison = useJourneyStore((s) => s.setComparison);
  const setPendingSource = useJourneyStore((s) => s.setPendingSource);
  const setPendingFile = useJourneyStore((s) => s.setPendingFile);
  const setPendingPrm = useJourneyStore((s) => s.setPendingPrm);
  const zipCode = useAuthProfileStore((s) => s.address.zipCode);

  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);
  const ready = journeyHydrated && authHydrated;

  useEffect(() => {
    if (error) return;
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(100, p + 100 / (TOTAL_DURATION_MS / TICK_MS)));
    }, TICK_MS);
    const phaseTimer = setInterval(() => {
      setCurrentPhase((p) => Math.min(p + 1, PHASES.length - 1));
    }, PHASE_DURATION_MS);
    return () => {
      clearInterval(progressTimer);
      clearInterval(phaseTimer);
    };
  }, [error]);

  useEffect(() => {
    if (!ready || hasStarted.current) return;

    if (!pendingPrm) {
      toast.error("Enter your PRM number before starting the analysis.");
      router.replace("/scan-prm");
      return;
    }

    const animationDeadline = new Promise<void>((resolve) =>
      setTimeout(resolve, TOTAL_DURATION_MS),
    );

    async function run() {
      hasStarted.current = true;
      const input = {
        prm: pendingPrm as string,
        zipcode: /^\d{5}$/.test(zipCode) ? zipCode : ZIPCODE_FALLBACK,
        currentProviderId: 159,
        currentOfferId: 6887,
        currentTariffType: 2 as const,
      };
      try {
        const response = await recommendOffers(input);
        const { billData, comparison } = toJourneyState(response, input);
        setBillData(billData);
        setComparison(comparison);
        setPendingSource(null);
        setPendingFile(null);
        setPendingPrm(null);
        await animationDeadline;
        router.replace("/results");
      } catch (caught) {
        const message =
          caught instanceof EnergyOptimizerError
            ? caught.message
            : caught instanceof Error
            ? caught.message
            : "Analysis interrupted";
        setError(message);
        toast.error(message);
      }
    }

    void run();
  }, [
    ready,
    pendingPrm,
    zipCode,
    router,
    setBillData,
    setComparison,
    setPendingSource,
    setPendingFile,
    setPendingPrm,
  ]);

  const handleRetry = () => {
    setError(null);
    setCurrentPhase(0);
    setProgress(0);
    hasStarted.current = false;
  };

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #ffffff 60%, #eff6ff 100%)",
      }}
    >
      <style jsx>{`
        @keyframes mascot-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-mascot-float { animation: mascot-float 2.5s ease-in-out infinite; }
        @keyframes fade-in-soft {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-soft { animation: fade-in-soft 400ms ease-out both; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: translate(-50%, 0) scale(1); }
          50% { opacity: 0.55; transform: translate(-50%, 0) scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="animate-pulse-slow absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: "#dbeafe", opacity: 0.4 }}
        />
      </div>

      <div className="app-screen page-gutter flex flex-1 flex-col items-center">
        <div className="flex-1" />

        <div className="animate-mascot-float relative h-60 w-60">
          {PHASES.map((phase, idx) => (
            <Image
              key={phase.image}
              src={phase.image}
              alt=""
              fill
              priority={idx === 0}
              sizes="240px"
              className="object-contain transition-opacity duration-700 ease-in-out"
              style={{ opacity: idx === currentPhase ? 1 : 0 }}
            />
          ))}
        </div>

        {error ? (
          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <p className="text-lg font-medium text-[#dc2626]">Analysis interrupted</p>
            <p className="text-sm text-[#5a6b80]" style={{ textWrap: "pretty" as const }}>
              {error}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 h-12 rounded-2xl bg-[#1e40af] px-6 text-sm font-medium text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <p
            key={currentPhase}
            className="animate-fade-in-soft mt-8 text-center text-lg font-medium text-[#0a1628]"
            style={{ minHeight: 60, textWrap: "pretty" as const }}
          >
            {PHASES[currentPhase].message}
          </p>
        )}

        <div className="flex-1" />

        {!error && (
          <div className="mb-4 w-full px-2">
            <div
              className="h-1 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "#e5e7eb" }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, backgroundColor: "#1e40af" }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-[#5a6b80] tabular-nums">
              {Math.round(progress)}%
            </p>
          </div>
        )}

        <div className="mb-8 flex items-center justify-center gap-2 text-xs text-[#5a6b80]">
          <Lock className="h-3 w-3" strokeWidth={2} />
          <span>Your data stays private and encrypted</span>
        </div>
      </div>
    </main>
  );
}
