import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WattSwitch",
    short_name: "WattSwitch",
    description: "Optimisez votre contrat d'électricité en moins de 60 secondes.",
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
