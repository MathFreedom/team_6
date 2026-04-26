/**
 * Mapping fournisseurs d'électricité → logo local + couleur de marque.
 * Les logos sont dans `public/logos/*.png` (téléchargés depuis le comparateur
 * officiel energie-info.fr).
 *
 * Si le logo manque (ou nom non reconnu), <ProviderLogo /> tombe sur un
 * fallback : cercle teinté avec les initiales sur la brand color.
 */

export type ProviderInfo = {
  /** Nom exact tel qu'il apparaît dans all_offers.json */
  name: string;
  /** Slug url-safe (= nom du fichier sans .png) */
  slug: string;
  /** Chemin du logo (servi depuis public/) */
  logoUrl: string;
  /** Couleur de marque dominante (utilisée pour fallback initials) */
  brandColor: string;
};

const make = (name: string, slug: string, brandColor: string): ProviderInfo => ({
  name,
  slug,
  logoUrl: `/logos/${slug}.png`,
  brandColor,
});

export const PROVIDERS: ProviderInfo[] = [
  make("Alpiq", "alpiq", "#E2001A"),
  make("Alterna énergie", "alterna-energie", "#00A859"),
  make("DYNEFF", "dyneff", "#1E5BAF"),
  make("EDF", "edf", "#003A70"),
  make("ENGIE", "engie", "#0E9DB7"),
  make("Ekwateur", "ekwateur", "#00A1A7"),
  make("Enercoop", "enercoop", "#E63312"),
  make("Energie d'ici", "energie-d-ici", "#76B82A"),
  make("GAZ DE BORDEAUX", "gaz-de-bordeaux", "#005CA9"),
  make("GEG Source d'Energies", "geg-source-d-energies", "#E2001A"),
  make("Mint Energie", "mint-energie", "#A8D26F"),
  make("Octopus Energy", "octopus-energy", "#170E3B"),
  make("Ohm Energie", "ohm-energie", "#FFD800"),
  make("Plenitude France", "plenitude-france", "#FFCD00"),
  make("Primeo Energie", "primeo-energie", "#00A0DF"),
  make("TotalEnergies", "totalenergies", "#ED1C24"),
  make("Urban Solar Energy", "urban-solar-energy", "#F39200"),
  make("Vattenfall", "vattenfall", "#FFDA00"),
  make("elmy", "elmy", "#1A1A1A"),
  make("ilek", "ilek", "#84BD00"),
  make("la bellenergie", "la-bellenergie", "#E94E1B"),
  make("mylight150", "mylight150", "#FFB800"),
  make("papernest energie", "papernest-energie", "#5B47FB"),
];

const PROVIDER_BY_NAME = new Map(PROVIDERS.map((p) => [p.name, p]));

/**
 * Retourne les infos d'un fournisseur à partir de son nom (insensible à la casse).
 * Renvoie undefined si pas trouvé.
 */
export function findProvider(name: string): ProviderInfo | undefined {
  if (!name) return undefined;
  const exact = PROVIDER_BY_NAME.get(name);
  if (exact) return exact;
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
