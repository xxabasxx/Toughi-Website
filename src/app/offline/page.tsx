"use client";

import Link from "next/link";
import { WifiOff, House, Map, RotateCw, BadgeCheck } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="relative -mt-20 flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-forest-950 px-5 pt-20 text-center text-ivory-100">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-pigeon.jpg" alt="" className="size-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 to-forest-950" />
      </div>
      <div className="grain absolute inset-0" />

      <div className="relative max-w-lg">
        <span className="mx-auto mb-7 grid size-20 place-items-center rounded-3xl bg-gold-500/15 text-gold-400">
          <WifiOff className="size-9" />
        </span>

        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          اینترنتت قطع شده، <span className="text-gradient-gold">ولی طوقی هنوز اینجاست</span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-8 text-ivory-100/60">
          صفحاتی که قبلاً بازدید کردی در حافظه ذخیره شده‌اند و بدون اینترنت هم باز می‌شوند. به محض
          اینکه دوباره آنلاین شوی، همه‌چیز به‌روز خواهد شد.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-gold flex items-center gap-2 rounded-full px-7 py-3.5 text-sm"
          >
            <RotateCw className="size-4" />
            تلاش دوباره
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-gold-500/40 px-7 py-3.5 text-sm font-bold text-gold-300 transition-all hover:bg-gold-500 hover:text-forest-950"
          >
            <House className="size-4" />
            صفحه اصلی (کش)
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-full border border-gold-500/40 px-7 py-3.5 text-sm font-bold text-gold-300 transition-all hover:bg-gold-500 hover:text-forest-950"
          >
            <Map className="size-4" />
            آگهی‌های بازدیدشده
          </Link>
        </div>

        <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-ivory-100/40">
          <BadgeCheck className="size-4 text-gold-500" />
          طوقی — بازار لاکچری پرندگان و حیوانات خانگی • حالت آفلاین
        </p>
      </div>
    </div>
  );
}
