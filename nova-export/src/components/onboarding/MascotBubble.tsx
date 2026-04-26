"use client";

type MascotBubbleProps = {
  message: string;
  size?: number;
};

/**
 * Gecko petit (~64-70px) + bulle de dialogue large à côté.
 * La bulle attire le regard, pas la mascotte.
 */
export function MascotBubble({ message, size = 64 }: MascotBubbleProps) {
  return (
    <div className="flex w-full items-end gap-3 px-2">
      {/* Gecko placeholder — TODO: <Image src="/gecko/gecko-XX.svg" /> */}
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-gray-100"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <span className="text-[10px] font-semibold tracking-widest text-gray-400">
          GECKO
        </span>
      </div>

      {/* Bulle de dialogue — flex-1 pour absorber l'espace dispo,
          gère naturellement les textes courts (1 ligne) et longs (3-4 lignes). */}
      <div
        className="relative min-w-0 flex-1 rounded-2xl bg-white px-4 py-3 shadow-sm"
        style={{
          border: "1px solid rgba(10, 22, 40, 0.08)",
        }}
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
