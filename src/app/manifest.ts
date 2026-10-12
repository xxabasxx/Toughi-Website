import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "طوقی | بازار لاکچری پرندگان و حیوانات خانگی",
    short_name: "طوقی",
    description:
      "طوقی؛ مرجع گزیده خرید و فروش پرندگان زینتی، طوطی‌های دست‌رام و حیوانات خانگی با احراز هویت فروشندگان و چت داخلی — هم‌اکنون بدون اینترنت هم در دسترس.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    dir: "rtl",
    lang: "fa",
    id: "/",
    background_color: "#0a2418",
    theme_color: "#0a2418",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
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
    shortcuts: [
      {
        name: "ثبت آگهی",
        short_name: "ثبت آگهی",
        url: "/new",
        icons: [{ src: "/icon.svg", sizes: "any" }],
      },
      {
        name: "آگهی‌های نشان‌دار",
        url: "/explore?sort=featured",
      },
    ],
  };
}
