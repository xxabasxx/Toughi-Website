import Link from "next/link";
import { House, Map } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative -mt-20 flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-forest-950 px-5 pt-20 text-center text-ivory-100">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-pigeon.jpg" alt="" className="size-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 to-forest-950" />
      </div>
      <div className="grain absolute inset-0" />

      <div className="relative">
        <p
          className="font-display text-[9rem] font-bold leading-none text-transparent sm:text-[13rem]"
          style={{ WebkitTextStroke: "1.5px rgba(223,191,116,0.5)" }}
        >
          ۴۰۴
        </p>
        <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl">
          این پرنده از قفس <span className="text-gradient-gold">پرواز کرده!</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-ivory-100/60">
          صفحه‌ای که دنبالش بودی پیدا نشد؛ شاید آگهی حذف شده یا نشانی را اشتباه زده‌ای.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-gold flex items-center gap-2 rounded-full px-7 py-3.5 text-sm">
            <House className="size-4" />
            بازگشت به خانه
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-full border border-gold-500/40 px-7 py-3.5 text-sm font-bold text-gold-300 transition-all hover:bg-gold-500 hover:text-forest-950"
          >
            <Map className="size-4" />
            کاوش آگهی‌ها
          </Link>
        </div>
      </div>
    </div>
  );
}
