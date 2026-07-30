import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LITHOS CRM",
    short_name: "LITHOS",
    description: "Wholesale slab CRM — leads, clients, and inventory",
    start_url: "/leads",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#020617",
    theme_color: "#020617",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
