import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nova",
    short_name: "Nova",
    description: "Votre agent IA qui réduit vos charges récurrentes, en pilote automatique. On commence par l'électricité.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f6ef",
    theme_color: "#2d5b3f",
    lang: "fr",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
