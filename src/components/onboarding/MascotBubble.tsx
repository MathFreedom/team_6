"use client";

import Image from "next/image";

type MascotBubbleProps = {
  message: string;
  /** Path vers le SVG du gecko (ex: "/mascot/onboarding-1.svg") */
  gecko?: string;
  /** Taille du gecko en pixels (default 72) */
  size?: number;
};

/**
 * Gecko sur le côté + bulle de dialogue qui prend l'espace.
 * La bulle attire le regard, le gecko reste discret.
 */
export function MascotBubble({
  message,
  gecko = "/mascot/onboarding-1.svg",
  size = 72,
}: MascotBubbleProps) {
  return (
    <div className="flex w-full items-end gap-3">
      {/* Gecko */}
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Image
          src={gecko}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-contain"
          priority
        />
      </div>

      {/* Bulle de dialogue */}
      <div
        className="relative min-w-0 flex-1 rounded-2xl bg-white px-4 py-3 shadow-sm"
        style={{ border: "1px solid rgba(10, 22, 40, 0.08)" }}
      >
        {/* Queue de bulle pointant vers le gecko (à gauche) */}
        <span
          aria-hidden
          className="absolute"
          style={{
            left: -7,
            bottom: 14,
            width: 0,
            height: 0,
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderRight: "8px solid rgba(10, 22, 40, 0.08)",
          }}
        />
        <span
          aria-hidden
          className="absolute"
          style={{
            left: -6,
            bottom: 14,
            width: 0,
            height: 0,
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderRight: "8px solid #ffffff",
          }}
        />
        <p
          className="text-sm leading-snug"
          style={{ color: "#0a1628", textWrap: "pretty" as const }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
