/**
 * Mapping fournisseurs d'électricité → logo + couleur de marque.
 * Le logo est servi via Clearbit Logo API (gratuit, CORS-enabled, ~99% uptime).
 * Si Clearbit n'a pas le logo (rare), le composant <ProviderLogo /> affiche
 * les initiales du fournisseur sur fond gris en fallback.
 *
 * Pour télécharger les logos en local plus tard, tu peux faire :
 *   curl https://logo.clearbit.com/edf.fr -o public/logos/edf.png
 * et basculer le mapping vers les fichiers locaux.
 */

export type ProviderInfo = {
  /** Nom exact tel qu'il apparaît dans all_offers.json */
  name: string;
  /** Slug url-safe */
  slug: string;
  /** Domaine officiel pour Clearbit Logo API */
  domain: string;
  /** URL complète du logo (Clearbit par défaut) */
  logoUrl: string;
  /** Couleur de marque dominante (pour fallback / accent) */
  brandColor: string;
};

const make = (
  name: string,
  slug: string,
  domain: string,
  brandColor: string,
): ProviderInfo => ({
  name,
  slug,
  domain,
  logoUrl: `https://logo.clearbit.com/${domain}`,
  brandColor,
});

export const PROVIDERS: ProviderInfo[] = [
  make("Alpiq", "alpiq", "alpiq.fr", "#E2001A"),
  make("Alterna énergie", "alterna-energie", "alterna-energie.fr", "#00A859"),
  make("DYNEFF", "dyneff", "dyneff.fr", "#1E5BAF"),
  make("EDF", "edf", "edf.fr", "#003A70"),
  make("ENGIE", "engie", "engie.fr", "#0E9DB7"),
  make("Ekwateur", "ekwateur", "ekwateur.fr", "#00A1A7"),
  make("Enercoop", "enercoop", "enercoop.fr", "#E63312"),
  make("Energie d'ici", "energie-dici", "energiedici.fr", "#76B82A"),
  make("GAZ DE BORDEAUX", "gaz-de-bordeaux", "gazdebordeaux.fr", "#005CA9"),
  make("GEG Source d'Energies", "geg", "geg.fr", "#E2001A"),
  make("Mint Energie", "mint-energie", "mint-energie.com", "#A8D26F"),
  make("Octopus Energy", "octopus-energy", "octopusenergy.fr", "#170E3B"),
  make("Ohm Energie", "ohm-energie", "ohm-energie.com", "#FFD800"),
  make("Plenitude France", "plenitude", "eniplenitude.com", "#FFCD00"),
  make("Primeo Energie", "primeo-energie", "primeo-energie.fr", "#00A0DF"),
  make("TotalEnergies", "totalenergies", "totalenergies.com", "#ED1C24"),
  make("Urban Solar Energy", "urban-solar", "urbansolarenergy.fr", "#F39200"),
  make("Vattenfall", "vattenfall", "vattenfall.fr", "#FFDA00"),
  make("elmy", "elmy", "elmy.fr", "#1A1A1A"),
  make("ilek", "ilek", "ilek.fr", "#84BD00"),
  make("la bellenergie", "la-bellenergie", "labellenergie.fr", "#E94E1B"),
  make("mylight150", "mylight150", "mylight150.com", "#FFB800"),
  make("papernest energie", "papernest", "papernest.com", "#5B47FB"),
];

const PROVIDER_BY_NAME = new Map(PROVIDERS.map((p) => [p.name, p]));

/**
 * Retourne les infos d'un fournisseur à partir de son nom (insensible à la casse
 * et tolérant aux variantes mineures).
 * Renvoie undefined si pas trouvé.
 */
export function findProvider(name: string): ProviderInfo | undefined {
  if (!name) return undefined;
  // Match exact d'abord
  const exact = PROVIDER_BY_NAME.get(name);
  if (exact) return exact;
  // Sinon match insensible à la casse
  const lower = name.trim().toLowerCase();
  return PROVIDERS.find((p) => p.name.toLowerCase() === lower);
}

/** Initiales (max 2 lettres) pour fallback visuel. */
export function providerInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?"
  );
}
