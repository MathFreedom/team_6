"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, Check, Share2 } from "lucide-react";

type SelectedOffer = {
  provider: string;
  offerName: string;
  annualSavings: number;
};

const CONFETTI_COLORS = ["#1e40af", "#dbeafe", "#059669", "#fbbf24"];
const CONFETTI_COUNT = 14;

type ConfettiPiece = {
  left: number; // 0–100 (vw %)
  size: number; // px
  color: string;
  delay: number; // s
  duration: number; // s
  rotateStart: number; // deg
  shape: "square" | "circle";
};

export default function SuccessPage() {
  const router = useRouter();
  const [savings, setSavings] = useState<number>(245);
  const [offerInfo, setOfferInfo] = useState({
    provider: "Primeo Energie",
    offerName: "Offre Fixe Confort+",
  });

  // Hydrate depuis localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nova-selected-offer");
      if (!raw) return;
      const offer: SelectedOffer = JSON.parse(raw);
      if (typeof offer.annualSavings === "number") setSavings(offer.annualSavings);
      if (offer.provider || offer.offerName) {
        setOfferInfo({
          provider: offer.provider ?? "Primeo Energie",
          offerName: offer.offerName ?? "Offre Fixe Confort+",
        });
      }
    } catch {
      /* noop */
    }
  }, []);

  // Génère les confettis une seule fois (sinon ils se relancent à chaque render)
  const confetti = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
      left: Math.random() * 100,
      size: 6 + Math.random() * 6, // 6–12px
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 1.2, // s
      duration: 4 + Math.random() * 2, // 4–6s
      rotateStart: Math.random() * 360,
      shape: Math.random() > 0.5 ? "square" : "circle",
    }));
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: "Nova",
      text: "Avec Nova j'ai automatisé le switch de mon électricité — j'économise sans rien faire.",
      url: typeof window !== "undefined" ? window.location.origin : "",
    };
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(
          shareData,
        );
      } else if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        shareData.url
      ) {
        await navigator.clipboard.writeText(shareData.url);
        // eslint-disable-next-line no-console
        console.log("Lien copié");
      }
    } catch {
      /* noop — l'utilisateur a annulé le share */
    }
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-white px-6 text-[#0a1628]">
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -50px, 0) rotate(0deg);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 110vh, 0) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes celebration-bounce {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.04) rotate(-2deg);
          }
          75% {
            transform: scale(1.04) rotate(2deg);
          }
        }
        @keyframes rise-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.08);
          }
        }
        .animate-celebration-bounce {
          animation: celebration-bounce 1.2s ease-in-out infinite;
        }
        .animate-rise-in {
          animation: rise-in 500ms ease-out both;
        }
        .animate-pop-in {
          animation: pop-in 500ms ease-out both;
        }
        .animate-pulse-soft {
          animation: pulse-soft 3s ease-in-out infinite;
        }
      `}</style>

      {/* Confettis */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
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

      {/* Spacer haut */}
      <div className="flex-1 min-h-[24px]" />

      {/* Gecko + halo */}
      <div className="relative mx-auto h-64 w-64">
        <div
          aria-hidden
          className="animate-pulse-soft absolute inset-0 -z-10 rounded-full blur-3xl"
          style={{ backgroundColor: "#dbeafe", opacity: 0.6 }}
        />
        <div className="animate-celebration-bounce relative h-full w-full">
          <Image
            src="/mascot/dancing.png"
            alt="Nova fête le switch"
            fill
            priority
            sizes="256px"
            className="object-contain"
          />
        </div>
      </div>

      {/* Titre */}
      <h1
        className="animate-rise-in mt-8 text-center text-4xl font-bold"
        style={{ animationDelay: "200ms" }}
      >
        C'est fait !
      </h1>

      {/* Sous-titre */}
      <p
        className="animate-rise-in mx-auto mt-2 max-w-xs text-center text-base"
        style={{ color: "#5a6b80", animationDelay: "400ms", textWrap: "pretty" as const }}
      >
        Le switch est lancé. Tu n'as plus rien à faire, je m'occupe de tout.
      </p>

      {/* Carte récap éco */}
      <section
        className="animate-pop-in mt-8 flex flex-col items-center gap-1 rounded-3xl p-5 text-center"
        style={{ backgroundColor: "#dbeafe", animationDelay: "600ms" }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#1e40af" }}
        >
          Tu vas économiser
        </span>
        <span
          className="text-5xl font-bold tabular-nums"
          style={{ color: "#1e40af" }}
        >
          {Math.round(savings)} €
        </span>
        <span className="text-sm">sur les 12 prochains mois</span>
        <div
          className="mt-3 h-px w-12"
          style={{ backgroundColor: "rgba(30,64,175,0.25)" }}
        />
        <span className="mt-3 text-xs" style={{ color: "#5a6b80" }}>
          Avec ta nouvelle offre {offerInfo.provider} · {offerInfo.offerName}
        </span>
      </section>

      {/* Timeline */}
      <section
        className="animate-rise-in mt-8"
        style={{ animationDelay: "800ms" }}
      >
        <h2 className="mb-4 text-center text-base font-semibold">
          Ce qui va se passer
        </h2>
        <ol className="flex flex-col">
          <TimelineItem
            when="Aujourd'hui"
            title="Mandat signé, switch lancé"
            connector
            current
          />
          <TimelineItem
            when="Sous 7 jours"
            title="Confirmation par ton nouveau fournisseur. Tu reçois un SMS dès que c'est officiel."
            connector
          />
          <TimelineItem
            when="Sous 21 jours max"
            title="Bascule effective. Tu paies déjà moins cher, sans coupure ni intervention."
          />
        </ol>
      </section>

      {/* Notification */}
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
          Je t'enverrai une notification à chaque étape. Pas besoin de revenir,
          tu sauras tout.
        </p>
      </div>

      {/* Boutons */}
      <div
        className="animate-rise-in mb-8 mt-8 flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]"
        style={{ animationDelay: "1000ms" }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          className="h-14 w-full rounded-2xl text-base font-medium text-white transition-opacity"
          style={{ backgroundColor: "#1e40af" }}
        >
          Voir mon contrat
        </button>
        <button
          onClick={handleShare}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border bg-white text-sm font-medium transition-colors hover:bg-black/5"
          style={{ borderColor: "rgba(10,22,40,0.12)", color: "#5a6b80" }}
        >
          <Share2 className="h-4 w-4" />
          Partager Nova à un proche
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
      {/* Connector */}
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
      {/* Bullet */}
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
