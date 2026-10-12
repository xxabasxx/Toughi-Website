import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Vazirmatn, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { getSetting } from "@/lib/cms";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNavbar } from "@/components/mobile-navbar";
import { PwaRegister } from "@/components/pwa-register";
import { getSessionUser } from "@/lib/auth";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
});

const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-naskh",
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [title, description] = await Promise.all([
    getSetting("site.title", "طوقی | بازار لاکچری پرندگان و حیوانات خانگی"),
    getSetting(
      "site.description",
      "طوقی؛ مرجع گزیده خرید و فروش پرندگان زینتی، طوطی‌های دست‌رام و حیوانات خانگی با احراز هویت فروشندگان، چت داخلی و تجربه‌ای لوکس.",
    ),
  ]);
  return {
    title: {
      default: title,
      template: "%s | طوقی",
    },
    description,
    keywords: ["خرید پرنده", "طوطی", "قناری", "فنچ", "حیوانات خانگی", "آگهی حیوانات", "طوقی"],
    applicationName: "طوقی",
    appleWebApp: {
      capable: true,
      title: "طوقی",
      statusBarStyle: "black-translucent",
    },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a2418",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${naskh.variable}`}>
      <body className="min-h-dvh bg-ivory-100 font-sans text-ink-900 antialiased">
        <PwaRegister />
        <SiteHeader />
        <main className="min-h-[70dvh] pb-20 lg:pb-0">{children}</main>
        <SiteFooter />
        <MobileNavbar authed={Boolean(user)} />
      </body>
    </html>
  );
}
