"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { MascotBubble } from "@/components/onboarding/MascotBubble";
import { ProviderLogo } from "@/components/providers/ProviderLogo";
import { useJourneyStore } from "@/lib/store/journey-store";
import { useJourneyHydrated } from "@/lib/store/use-journey-hydrated";

export default function MandatePage() {
  const router = useRouter();
  const hydrated = useJourneyHydrated();
  const billData = useJourneyStore((s) => s.billData);
  const comparison = useJourneyStore((s) => s.comparison);
  const selectedOfferId = useJourneyStore((s) => s.selectedOfferId);
  const setSwitchState = useJourneyStore((s) => s.setSwitchState);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const offer = useMemo(() => {
    if (!comparison || !selectedOfferId) return null;
    const ranked = comparison.rankedOffers.find((r) => r.offerId === selectedOfferId);
    if (!ranked) return null;
    return {
      id: ranked.offerId,
      provider: ranked.providerName,
      offerName: ranked.offerName,
      annualSavings: ranked.annualSavingsEur,
      monthlySavings: ranked.annualSavingsEur / 12,
    };
  }, [comparison, selectedOfferId]);

  const currentProvider = billData?.providerName ?? "your current provider";

  useEffect(() => {
    if (!hydrated) return;
    if (!comparison || !selectedOfferId) {
      router.replace("/results");
    }
  }, [hydrated, comparison, selectedOfferId, router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#1e40af";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const me = e as React.MouseEvent;
    return { x: me.clientX - rect.left, y: me.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getPos(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawingRef.current = true;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSigned) setHasSigned(true);
  };

  const stopDraw = () => {
    drawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const canConfirm = isAccepted && hasSigned;

  return (
    <main className="app-shell flex flex-col bg-white text-[#0a1628]">
      <header className="page-gutter sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white py-4 pt-safe">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-medium">Confirmation</h1>
        <span className="w-10" />
      </header>

      <div className="page-gutter page-bottom-safe flex-1 pb-8">
        <div className="mt-2">
          <MascotBubble gecko="/mascot/switching.svg" message="To switch on your behalf, I need your approval. It's quick, free, and commitment-free." />
        </div>

        <section className="mt-6 rounded-3xl p-5" style={{ backgroundColor: "#dbeafe" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#1e40af" }}>
            You are switching to
          </p>
          <div className="mt-3 flex items-center gap-3">
            {offer?.provider ? <ProviderLogo name={offer.provider} size={48} /> : null}
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#5a6b80" }}>
                {offer?.provider ?? "-"}
              </p>
              <p className="text-lg font-semibold leading-tight">
                {offer?.offerName ?? "Your selected plan"}
              </p>
            </div>
          </div>

          <div className="my-4 border-t" style={{ borderColor: "rgba(30,64,175,0.2)" }} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs" style={{ color: "#5a6b80" }}>
                Savings / year
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums" style={{ color: "#059669" }}>
                {offer?.annualSavings ?? 0} EUR
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "#5a6b80" }}>
                Savings / month
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums" style={{ color: "#059669" }}>
                {Math.round(offer?.monthlySavings ?? 0)} EUR
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold">What you agree to</h2>
          <ul className="flex flex-col gap-3">
            <AcceptItem>
              Nova subscribes to this offer for you with{" "}
              <strong className="font-semibold">{offer?.provider ?? "your new provider"}</strong>.
            </AcceptItem>
            <AcceptItem>
              Nova terminates your current contract with{" "}
              <strong className="font-semibold">{currentProvider}</strong>{" "}
              (free of charge, with no outage).
            </AcceptItem>
            <AcceptItem>
              You can cancel at any time in the app, with no fees.
            </AcceptItem>
          </ul>
        </section>

        <section className="mt-6">
          <label
            className="flex cursor-pointer items-start gap-3 rounded-2xl p-4 transition-colors"
            style={{
              backgroundColor: isAccepted ? "#eef4ff" : "#f9fafb",
              border: isAccepted ? "1px solid #1e40af" : "1px solid rgba(10,22,40,0.06)",
            }}
          >
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#1e40af]"
            />
            <span className="flex-1">
              <span className="block text-sm">
                I authorize Nova to sign the power of attorney in my name to complete this electricity provider change.
              </span>
            </span>
          </label>
        </section>

        <section className="mt-6">
          <h2 className="text-base font-semibold">Your signature</h2>
          <p className="mb-3 mt-1 text-xs" style={{ color: "#5a6b80" }}>
            Draw your signature with your finger inside the box
          </p>
          <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-white" style={{ border: "2px dashed #1e40af" }}>
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            {!hasSigned && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium" style={{ color: "#9ca3af" }}>
                Sign here
              </span>
            )}
          </div>
          <div className="mt-2 flex justify-end">
            <button type="button" onClick={clearCanvas} className="text-xs font-medium underline" style={{ color: "#1e40af" }}>
              Clear
            </button>
          </div>
        </section>

        <button
          onClick={async () => {
            if (!canConfirm || !comparison || !offer || isSubmitting) return;
            setIsSubmitting(true);
            try {
              const response = await fetch("/api/switch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  comparison: {
                    action: "switch",
                    bestOffer: { id: offer.id },
                    annualSavingsEur: offer.annualSavings,
                  },
                  autonomyLevel: "autopilot",
                }),
              });
              const payload = await response.json();
              if (!response.ok) {
                throw new Error(payload.error || "Switch unavailable");
              }
              setSwitchState(payload.switchState);
              router.push("/success");
            } catch (err) {
              const message = err instanceof Error ? err.message : "An error occurred";
              toast.error(message);
              setIsSubmitting(false);
            }
          }}
          disabled={!canConfirm || isSubmitting}
          className="mt-8 h-14 w-full rounded-2xl text-base font-medium text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#1e40af" }}
        >
          {isSubmitting ? "Confirming..." : "Confirm switch"}
        </button>

        <div className="mb-8 mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: "#5a6b80" }}>
          <ShieldCheck className="h-3 w-3" />
          <span>Secure mandate · GDPR compliant · You can cancel anytime</span>
        </div>
      </div>
    </main>
  );
}

function AcceptItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#059669" }} />
      <span className="text-sm">{children}</span>
    </li>
  );
}
