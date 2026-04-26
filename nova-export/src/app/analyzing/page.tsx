"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock } from "lucide-react";

/**
 * Écran de chargement immersif post-PRM.
 * 5 phases narratives sur 15s (3s/phase), gecko qui change de pose à chaque étape.
 * Redirige automatiquement vers /results à la fin.
 *
 * NOTE assets : les fichiers sont attendus dans `public/mascot/*.png`.
 * Quand les SVG seront livrés, remplacer simplement l'extension dans le tableau ci-dessous.
 */

type Phase = { image: string; message: string };

const PHASES: Phase[] = [
  {
    image: "/mascot/searching.png",
    message: "Je récupère ton numéro PRM...",
  },
  {
    image: "/mascot/connecting.png",
    message: "Je me connecte à Enedis et à ton Linky...",
  },
  {
    image: "/mascot/thinking.png",
    message: "J'analyse ton profil de consommation...",
  },
  {
    image: "/mascot/scanning.png",
    message: "Je compare les 78 offres du marché...",
  },
  {
    image: "/mascot/eureka.png",
    message: "Je prépare tes meilleures recommandations !",
  },
];

const PHASE_DURATION_MS = 3000;
const TOTAL_DURATION_MS = PHASE_DURATION_MS * PHASES.length;
const TICK_MS = 100;

export default function AnalyzingPage() {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar smooth (linéaire)
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        const next = p + 100 / (TOTAL_DURATION_MS / TICK_MS);
        return next >= 100 ? 100 : next;
      });
    }, TICK_MS);

    // Phase change toutes les 3s
    const phaseTimer = setInterval(() => {
      setCurrentPhase((p) => Math.min(p + 1, PHASES.length - 1));
    }, PHASE_DURATION_MS);

    // Redirect final
    const redirectTimer = setTimeout(() => {
      router.push("/results");
    }, TOTAL_DURATION_MS);

    return () => {
      clearInterval(progressTimer);
      clearInterval(phaseTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #ffffff 60%, #eff6ff 100%)",
      }}
    >
      {/* Animations locales — encapsulées au composant */}
      <style jsx>{`
        @keyframes mascot-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-mascot-float {
          animation: mascot-float 2.5s ease-in-out infinite;
        }
        @keyframes fade-in-soft {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-soft {
          animation: fade-in-soft 400ms ease-out both;
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: translate(-50%, 0) scale(1);
          }
          50% {
            opacity: 0.55;
            transform: translate(-50%, 0) scale(1.1);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>

      {/* Halo bleu doux derrière le gecko */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="animate-pulse-slow absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: "#dbeafe", opacity: 0.4 }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col items-center px-6">
        {/* Spacer haut */}
        <div className="flex-1" />

        {/* Gecko — toutes les poses superposées, on toggle l'opacity */}
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

        {/* Message narratif — re-mount à chaque phase pour rejouer l'animation */}
        <p
          key={currentPhase}
          className="animate-fade-in-soft mt-8 text-center text-lg font-medium text-[#0a1628]"
          style={{ minHeight: 60, textWrap: "pretty" as const }}
        >
          {PHASES[currentPhase].message}
        </p>

        {/* Spacer bas */}
        <div className="flex-1" />

        {/* Progress bar */}
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
              style={{
                width: `${progress}%`,
                backgroundColor: "#1e40af",
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-[#5a6b80] tabular-nums">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Disclaimer privacy */}
        <div className="mb-8 flex items-center justify-center gap-2 text-xs text-[#5a6b80]">
          <Lock className="h-3 w-3" strokeWidth={2} />
          <span>Tes données restent privées et chiffrées</span>
        </div>
      </div>
    </main>
  );
}
