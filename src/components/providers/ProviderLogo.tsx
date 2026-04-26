"use client";

import { useState } from "react";
import { findProvider, providerInitials } from "@/data/providers";

type ProviderLogoProps = {
  /** Nom du fournisseur tel qu'il apparaît dans all_offers.json */
  name: string;
  /** Diamètre du cercle en pixels (default 40) */
  size?: number;
  /** Classes additionnelles sur le container */
  className?: string;
};

/**
 * Affiche le logo d'un fournisseur dans un cercle.
 * - Tente de charger via Clearbit Logo API (mapping dans src/data/providers.ts)
 * - Fallback : cercle teinté avec initiales si le logo ne charge pas
 *
 * Usage :
 *   <ProviderLogo name="EDF" size={48} />
 */
export function ProviderLogo({ name, size = 40, className = "" }: ProviderLogoProps) {
  const provider = findProvider(name);
  const [errored, setErrored] = useState(false);

  const showFallback = !provider || errored;
  const bg = provider?.brandColor ?? "#f3f4f6";
  const initials = providerInitials(name);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-white ${className}`}
      style={{
        width: size,
        height: size,
        border: "1px solid rgba(10, 22, 40, 0.06)",
      }}
      aria-label={name}
    >
      {showFallback ? (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ backgroundColor: bg }}
        >
          <span
            className="font-semibold text-white"
            style={{ fontSize: Math.round(size * 0.36) }}
          >
            {initials}
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={provider.logoUrl}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full object-contain p-1"
        />
      )}
    </div>
  );
}
