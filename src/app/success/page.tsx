"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, Check, Share2 } from "lucide-react";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";
import { Skeleton } from "@/components/ui/skeleton";

const CONFETTI_COLORS = ["#1e40af", "#dbeafe", "#059669", "#fbbf24"];
const CONFETTI_COUNT = 14;

type ConfettiPiece = {
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotateStart: number;
  shape: "square" | "circle";
};

export default function SuccessPage() {
  const router = useRouter();
  const hydrated = useJourneyHydrated();
  const comparison = useJourneyStore((s) => s.comparison);
  const selectedOfferId = useJourneyStore((s) => s.selectedOfferId);
  const switchState = useJourneyStore((s) => s.switchState);

  const offerInfo = useMemo(() => {
    if (!comparison || !selectedOfferId) {
      return { provider: "your new provider", offerName: "Your plan" };
    }
    const ranked = comparison.rankedOffers.find((r) => r.offerId === selectedOfferId);
    if (!ranked) {
      return { provider: "your new provider", offerName: "Your plan" };
    }
    return { provider: ranked.providerName, offerName: ranked.offerName };
  }, [comparison, selectedOfferId]);

  const savings = useMemo(() => {
    if (switchState) return switchState.estimatedAnnualSavingsEur;
    if (comparison && selectedOfferId) {
      const ranked = comparison.rankedOffers.find((r) => r.offerId === selectedOfferId);
      if (ranked) return ranked.annualSavingsEur;
    }
    return comparison?.annualSavingsEur ?? 0;
  }, [switchState, comparison, selectedOfferId]);

  const confetti = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
      left: Math.random() * 100,
      size: 6 + Math.random() * 6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 1.2,
      duration: 4 + Math.random() * 2,
      rotateStart: Math.random() * 360,
      shape: Math.random() > 0.5 ? "square" : "circle",
    }));
  }, []);

  if (!hydrated) {
    return <Skeleton className="app-screen mt-8 h-[600px] w-full" />;
  }

  const handleShare = async () => {
    const shareData = {
      title: "Nova",
      text: "With Nova I automated my electricity switch and save money without lifting a finger.",
      url: typeof window !== "undefined" ? window.location.origin : "",
    };
    try {
      if (typeof navigator === "undefined") return;
      if ("share" in navigator) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(
          shareData,
        );
      } else if ("clipboard" in navigator && shareData.url) {
        await (navigator as Navigator).clipboard.writeText(shareData.url);
      }
    } catch {
      /* user cancelled sharing */
    }
  };

  return (
    <main className="app-shell page-gutter relative flex flex-col overflow-hidden bg-white text-[#0a1628]">
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translate3d(0, -50px, 0) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate3d(0, 110vh, 0) rotate(720deg); opacity: 0; }
        }
        @keyframes celebration-bounce {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.04) rotate(-2deg); }
          75% { transform: scale(1.04) rotate(2deg); }
        }
        @keyframes rise-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        .animate-celebration-bounce { animation: celebration-bounce 1.2s ease-in-out infinite; }
        .animate-rise-in { animation: rise-in 500ms ease-out both; }
        .animate-pop-in { animation: pop-in 500ms ease-out both; }
        .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
      `}</style>

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {confetti.map((c, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: `${c.left}%`,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              borderRadius: c.shape === "circle" ? "50%" : "2px",
              animation: `confetti-fall ${c.duration}s ${c.delay}s ease-in forwards`,
              transform: `rotate(${c.rotateStart}deg)`,
            }}
          />
        ))}
      </div>

      <div className="flex-1 min-h-[24px]" />

      <div className="relative mx-auto h-64 w-64">
        <div
          aria-hidden
          className="animate-pulse-soft absolute inset-0 -z-10 rounded-full blur-3xl"
          style={{ backgroundColor: "#dbeafe", opacity: 0.6 }}
        />
        <div className="animate-celebration-bounce relative h-full w-full">
          <Image
            src="/mascot/success.svg"
            alt="Nova celebrating your switch"
            fill
            priority
            sizes="256px"
            className="object-contain"
          />
        </div>
      </div>

      <h1
        className="animate-rise-in mt-8 text-center text-4xl font-bold"
        style={{ animationDelay: "200ms" }}
      >
        It's done!
      </h1>

      <p
        className="animate-rise-in mx-auto mt-2 max-w-xs text-center text-base"
        style={{ color: "#5a6b80", animationDelay: "400ms", textWrap: "pretty" as const }}
      >
        Your switch has started. You don't need to do anything else, I'll handle the rest.
      </p>

      <section
        className="animate-pop-in mt-8 flex flex-col items-center gap-1 rounded-3xl p-5 text-center"
        style={{ backgroundColor: "#dbeafe", animationDelay: "600ms" }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#1e40af" }}
        >
          You will save
        </span>
        <span
          className="text-5xl font-bold tabular-nums"
          style={{ color: "#1e40af" }}
        >
          {Math.round(savings)} EUR
        </span>
        <span className="text-sm">over the next 12 months</span>
        <div
          className="mt-3 h-px w-12"
          style={{ backgroundColor: "rgba(30,64,175,0.25)" }}
        />
        <span className="mt-3 text-xs" style={{ color: "#5a6b80" }}>
          With your new plan from {offerInfo.provider} · {offerInfo.offerName}
        </span>
      </section>

      <section className="animate-rise-in mt-8" style={{ animationDelay: "800ms" }}>
        <h2 className="mb-4 text-center text-base font-semibold">
          What happens next
        </h2>
        <ol className="flex flex-col">
          <TimelineItem
            when="Today"
            title="Mandate signed, switch started"
            connector
            current
          />
          <TimelineItem
            when="Within 7 days"
            title="Confirmation from your new provider. You'll receive a text message as soon as it's official."
            connector
          />
          <TimelineItem
            when="Within 21 days max"
            title="Switch completed. You already pay less, with no outage and no action required."
          />
        </ol>
      </section>

      <div
        className="animate-rise-in mt-6 flex items-center gap-3 rounded-2xl p-4"
        style={{ backgroundColor: "#f9fafb", animationDelay: "900ms" }}
      >
        <Bell
          className="h-5 w-5 shrink-0"
          style={{ color: "#1e40af" }}
          strokeWidth={2}
        />
        <p className="text-sm" style={{ textWrap: "pretty" as const }}>
          I'll send you a notification at every step. No need to come back, you'll stay informed.
        </p>
      </div>

      <div
        className="animate-rise-in page-bottom-safe mb-8 mt-8 flex flex-col gap-3"
        style={{ animationDelay: "1000ms" }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          className="h-14 w-full rounded-2xl text-base font-medium text-white transition-opacity"
          style={{ backgroundColor: "#1e40af" }}
        >
          View my contract
        </button>
        <button
          onClick={handleShare}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border bg-white text-sm font-medium transition-colors hover:bg-black/5"
          style={{ borderColor: "rgba(10,22,40,0.12)", color: "#5a6b80" }}
        >
          <Share2 className="h-4 w-4" />
          Share Nova with someone
        </button>
      </div>
    </main>
  );
}

function TimelineItem({
  when,
  title,
  connector,
  current = false,
}: {
  when: string;
  title: string;
  connector?: boolean;
  current?: boolean;
}) {
  return (
    <li className="relative flex items-start gap-3 pb-5 last:pb-0">
      {connector && (
        <span
          aria-hidden
          className="absolute left-4 top-8 bottom-0 w-px"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(30,64,175,0.35) 50%, transparent 0)",
            backgroundSize: "1px 6px",
            backgroundRepeat: "repeat-y",
          }}
        />
      )}
      <span
        className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: "#1e40af",
          boxShadow: current ? "0 0 0 6px rgba(30,64,175,0.12)" : "none",
        }}
      >
        <Check className="h-4 w-4 text-white" strokeWidth={3} />
      </span>
      <div className="flex-1 pt-0.5">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#5a6b80" }}
        >
          {when}
        </p>
        <p className="mt-0.5 text-sm font-medium" style={{ textWrap: "pretty" as const }}>
          {title}
        </p>
      </div>
    </li>
  );
}
