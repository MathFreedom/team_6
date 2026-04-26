"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { MascotBubble } from "@/components/onboarding/MascotBubble";

type SelectedOffer = {
  id: number;
  provider: string;
  offerName: string;
  annualSavings: number;
  monthlySavings: number;
};

type SignupData = {
  currentContract?: { provider?: string };
};

export default function MandatePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const [offer, setOffer] = useState<SelectedOffer | null>(null);
  const [currentProvider, setCurrentProvider] = useState<string>("ton fournisseur actuel");
  const [hasSigned, setHasSigned] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Hydrate offre + provider actuel
  useEffect(() => {
    try {
      const offerRaw = localStorage.getItem("nova-selected-offer");
      if (offerRaw) setOffer(JSON.parse(offerRaw));

      const signup: SignupData = JSON.parse(
        localStorage.getItem("nova-signup") || "{}",
      );
      if (signup.currentContract?.provider) {
        setCurrentProvider(signup.currentContract.provider);
      }
    } catch {
      /* noop */
    }
  }, []);

  // Setup canvas en haute résolution
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
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white text-[#0a1628]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-6 py-4">
        <button
          onClick={() => router.back()}
          aria-label="Retour"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-medium">Confirmation</h1>
        <span className="w-10" />
      </header>

      <div className="flex-1 px-6 pb-8">
        {/* Mascotte */}
        <div className="mt-2">
          <MascotBubble message="Pour que je switche à ta place, j'ai besoin de ton accord. C'est rapide et 100 % gratuit, sans engagement." />
        </div>

        {/* Récap offre */}
        <section
          className="mt-6 rounded-3xl p-5"
          style={{ backgroundColor: "#dbeafe" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#1e40af" }}
          >
            Tu vas switcher vers
          </p>
          <p
            className="mt-2 text-xs font-medium uppercase tracking-wider"
            style={{ color: "#5a6b80" }}
          >
            {offer?.provider ?? "—"}
          </p>
          <p className="mt-1 text-lg font-semibold">
            {offer?.offerName ?? "Ton offre sélectionnée"}
          </p>

          <div
            className="my-4 border-t"
            style={{ borderColor: "rgba(30,64,175,0.2)" }}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs" style={{ color: "#5a6b80" }}>
                Économie/an
              </p>
              <p
                className="mt-1 text-xl font-bold tabular-nums"
                style={{ color: "#059669" }}
              >
                {offer?.annualSavings ?? 0} €
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "#5a6b80" }}>
                Économie/mois
              </p>
              <p
                className="mt-1 text-xl font-bold tabular-nums"
                style={{ color: "#059669" }}
              >
                {Math.round(offer?.monthlySavings ?? 0)} €
              </p>
            </div>
          </div>
        </section>

        {/* Ce que tu acceptes */}
        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold">Ce que tu acceptes</h2>
          <ul className="flex flex-col gap-3">
            <AcceptItem>
              Nova souscrit pour toi à cette offre chez{" "}
              <strong className="font-semibold">{offer?.provider ?? "ton nouveau fournisseur"}</strong>.
            </AcceptItem>
            <AcceptItem>
              Nova résilie ton contrat actuel chez{" "}
              <strong className="font-semibold">{currentProvider}</strong>{" "}
              (gratuit, sans coupure).
            </AcceptItem>
            <AcceptItem>
              Tu peux annuler à tout moment dans l'app, sans frais.
            </AcceptItem>
          </ul>
        </section>

        {/* Case à cocher mandat */}
        <section className="mt-6">
          <label
            className="flex cursor-pointer items-start gap-3 rounded-2xl p-4 transition-colors"
            style={{
              backgroundColor: isAccepted ? "#eef4ff" : "#f9fafb",
              border: isAccepted
                ? "1px solid #1e40af"
                : "1px solid rgba(10,22,40,0.06)",
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
                J'autorise Nova à signer le mandat SEPA + procuration en mon
                nom pour effectuer ce changement de fournisseur d'électricité.
              </span>
              <span
                className="mt-1 block text-xs"
                style={{ color: "#5a6b80" }}
              >
                Tu peux consulter le mandat complet{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: ouvrir drawer/modale avec le texte du mandat
                    // eslint-disable-next-line no-console
                    console.log("Open mandate drawer");
                  }}
                  className="cursor-pointer underline"
                  style={{ color: "#1e40af" }}
                >
                  ici
                </button>
                .
              </span>
            </span>
          </label>
        </section>

        {/* Signature */}
        <section className="mt-6">
          <h2 className="text-base font-semibold">Ta signature</h2>
          <p className="mb-3 mt-1 text-xs" style={{ color: "#5a6b80" }}>
            Trace ta signature avec ton doigt dans le cadre
          </p>
          <div
            className="relative h-40 w-full overflow-hidden rounded-2xl bg-white"
            style={{
              border: "2px dashed #1e40af",
            }}
          >
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
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium"
                style={{ color: "#9ca3af" }}
              >
                Signe ici
              </span>
            )}
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs font-medium underline"
              style={{ color: "#1e40af" }}
            >
              Effacer
            </button>
          </div>
        </section>

        {/* Bouton */}
        <button
          onClick={() => router.push("/success")}
          disabled={!canConfirm}
          className="mt-8 h-14 w-full rounded-2xl text-base font-medium text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#1e40af" }}
        >
          Confirmer le switch
        </button>

        {/* Disclaimer */}
        <div
          className="mb-8 mt-4 flex items-center justify-center gap-2 text-xs"
          style={{ color: "#5a6b80" }}
        >
          <ShieldCheck className="h-3 w-3" />
          <span>Mandat sécurisé · Conforme RGPD · Tu peux annuler à tout moment</span>
        </div>
      </div>
    </main>
  );
}

function AcceptItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2
        className="mt-0.5 h-5 w-5 shrink-0"
        style={{ color: "#059669" }}
      />
      <span className="text-sm">{children}</span>
    </li>
  );
}
