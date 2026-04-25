import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nova",
    short_name: "Nova",
    description: "Your AI agent that cuts your recurring charges on autopilot. We start with electricity.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f6ef",
    theme_color: "#2d5b3f",
    lang: "en",
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
