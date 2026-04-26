"use client";

import Image from "next/image";

type ProviderLogoProps = {
  name: string;
  size?: number;
};

const PROVIDER_LOGOS: Record<string, string> = {
  edf: "/logos/edf.png",
  totalenergies: "/logos/totalenergies.png",
  engie: "/logos/engie.png",
  primeoenergie: "/logos/primeo-energie.png",
  labellenergie: "/logos/la-bellenergie.png",
  enercoop: "/logos/enercoop.png",
  mintenergie: "/logos/mint-energie.png",
  octopusenergy: "/logos/octopus-energy.png",
  vattenfall: "/logos/vattenfall.png",
  alpiq: "/logos/alpiq.png",
  ekwateur: "/logos/ekwateur.png",
  ilek: "/logos/ilek.png",
  ohmenergie: "/logos/ohm-energie.png",
  plenitude: "/logos/plenitude-france.png",
  plenitudefrance: "/logos/plenitude-france.png",
  eni: "/logos/plenitude-france.png",
  alternaenergie: "/logos/alterna-energie.png",
  dyneff: "/logos/dyneff.png",
  elmy: "/logos/elmy.png",
  energiedici: "/logos/energie-d-ici.png",
  gazdebordeaux: "/logos/gaz-de-bordeaux.png",
  gegsourcedenergies: "/logos/geg-source-d-energies.png",
  mylight150: "/logos/mylight150.png",
  papernestenergie: "/logos/papernest-energie.png",
  urbansolarenergy: "/logos/urban-solar-energy.png",
};

const PROVIDER_PALETTE: Record<string, { bg: string; fg: string }> = {
  edf: { bg: "#1a3a8a", fg: "#ffffff" },
  totalenergies: { bg: "#ed1c24", fg: "#ffffff" },
  engie: { bg: "#0099cc", fg: "#ffffff" },
  primeoenergie: { bg: "#0a5cad", fg: "#ffffff" },
  labellenergie: { bg: "#10b981", fg: "#ffffff" },
  enercoop: { bg: "#7cb342", fg: "#ffffff" },
  mintenergie: { bg: "#22c55e", fg: "#ffffff" },
  octopusenergy: { bg: "#290845", fg: "#ffffff" },
  vattenfall: { bg: "#ffd900", fg: "#0a1628" },
  alpiq: { bg: "#e30613", fg: "#ffffff" },
  ekwateur: { bg: "#0ea5e9", fg: "#ffffff" },
  ilek: { bg: "#16a34a", fg: "#ffffff" },
  ohmenergie: { bg: "#7c3aed", fg: "#ffffff" },
  plenitude: { bg: "#0f766e", fg: "#ffffff" },
  happe: { bg: "#06b6d4", fg: "#ffffff" },
  sowee: { bg: "#fbbf24", fg: "#0a1628" },
};

const DEFAULT_PALETTE = { bg: "#dbeafe", fg: "#1e40af" };

function normalizeProviderName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/['’-]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function resolveLogoPath(name: string): string | null {
  const normalized = normalizeProviderName(name);
  if (normalized.includes("plenitude") || normalized.startsWith("eni")) {
    return PROVIDER_LOGOS.plenitude;
  }
  return PROVIDER_LOGOS[normalized] ?? null;
}

function getPalette(name: string) {
  const normalized = normalizeProviderName(name);
  if (normalized.includes("plenitude") || normalized.startsWith("eni")) {
    return PROVIDER_PALETTE.plenitude;
  }
  return PROVIDER_PALETTE[normalized] ?? DEFAULT_PALETTE;
}

function getInitials(name: string): string {
  const cleaned = name.replace(/[()]/g, "").trim();
  if (/^[A-Z0-9]+$/.test(cleaned)) return cleaned.slice(0, 3);
  return (
    cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 3) || "?"
  );
}

export function ProviderLogo({ name, size = 40 }: ProviderLogoProps) {
  const logoPath = resolveLogoPath(name);
  const palette = getPalette(name);
  const initials = getInitials(name);

  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-white"
      style={{ width: size, height: size }}
      aria-label={name}
      title={name}
    >
      {logoPath ? (
        <Image
          src={logoPath}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-contain p-1.5"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-semibold tabular-nums"
          style={{
            backgroundColor: palette.bg,
            color: palette.fg,
            fontSize: Math.max(10, size * 0.28),
            letterSpacing: "0.02em",
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export default ProviderLogo;
