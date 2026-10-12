import Link from "next/link";
import { getCategories, getCities, getStats } from "@/lib/queries";
import { getSetting, getBlocks } from "@/lib/cms";
import { Logo } from "./logo";
import { toFa } from "@/lib/utils";
import { InstallAppLink } from "./install-app-link";
import {
  ShieldCheck,
  Lock,
  MapPin,
  Phone,
  Mail,
  AtSign,
  Send,
  Globe,
  Feather,
  PawPrint,
  PackageOpen,
  Zap,
  Compass,
  Headset,
  Flame,
  Bird,
} from "lucide-react";

const QUICK_LINKS = [
  { href: "/explore", label: "همهٔ آگهی‌ها" },
  { href: "/explore?sort=featured", label: "آگهی‌های نشان‌دار" },
  { href: "/explore?negotiable=1", label: "قابل مذاکره" },
  { href: "/explore?sort=cheap", label: "ارزان‌ترین‌ها" },
  { href: "/explore?sort=popular", label: "پربازدیدترین‌ها" },
  { href: "/new", label: "ثبت آگهی رایگان" },
  { href: "/favorites", label: "نشان‌شده‌های من" },
  { href: "/chats", label: "گفتگوهای من" },
  { href: "/my-ads", label: "آگهی‌های من" },
  { href: "/auth", label: "ورود | ثبت‌نام" },
];

const ABOUT_LINKS = [
  { href: "/guide", label: "راهنمای امن معامله" },
  { href: "/guide", label: "قوانین انتشار آگهی" },
  { href: "/guide", label: "حریم خصوصی و امنیت" },
  { href: "/guide", label: "نصب و راه‌اندازی آکواریوم" },
  { href: "/guide", label: "چک‌لیست سلامت پرنده" },
  { href: "/guide", label: "تماس با پشتیبانی" },
  { href: "/guide", label: "دربارهٔ طوقی" },
];

const HOT_SEARCHES = [
  { q: "طوطی ماکاو دستی" },
  { q: "کاسکو سخنگو" },
  { q: "قناری تولیدی" },
  { q: "عروس هلندی لوتینو" },
  { q: "فنچ" },
  { q: "مرغ عشق" },
  { q: "کاکادو" },
  { q: "مینا" },
  { q: "طاووس" },
  { q: "گربه پرشین" },
  { q: "پامرانین" },
  { q: "آکواریوم" },
  { q: "قفس" },
  { q: "طوطی" },
];

export async function SiteFooter() {
  const [cats, citiesRes, stats, aboutText, phoneText, emailText, hotBlocks] = await Promise.all([
    getCategories(),
    getCities(),
    getStats(),
    getSetting(
      "footer.about",
      "طوقی، مرجع گزیدهٔ خرید و فروش پرندگان زینتی، طوطی‌های دست‌رام و حیوانات خانگی در ایران؛ جایی که هر آگهی با دقت بررسی می‌شود تا با خیالی آسوده همراه تازه‌ات را پیدا کنی.",
    ),
    getSetting("footer.phone", "۰۲۱-۹۱۰۰۸۸۰۰"),
    getSetting("footer.email", "hello@toughi.ir"),
    getBlocks("footer_hot"),
  ]);
  const birdCats = cats.filter((c) => c.kind === "birds");
  const petCats = cats.filter((c) => c.kind === "pets");
  const gearCats = cats.filter((c) => c.kind === "gear");
  const hotItems = hotBlocks.length
    ? hotBlocks.map((b) => ({ q: b.title, href: b.link || `/explore?q=${encodeURIComponent(b.title)}` }))
    : HOT_SEARCHES.map((s) => ({ q: s.q, href: `/explore?q=${encodeURIComponent(s.q)}` }));

  const colCls = "space-y-2.5 text-[13px] text-ivory-100/60";
  const linkCls = "block transition-colors hover:text-gold-300";
  const headCls = "font-display mb-4 flex items-center gap-2 text-base font-bold text-gold-300";

  return (
    <footer className="relative mt-24 overflow-hidden bg-forest-950 text-ivory-100">
      <div className="grain absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold-500/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 lg:pb-8">
        {/* brand row */}
        <div className="grid gap-10 border-b border-ivory-100/10 pb-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm text-sm leading-7 text-ivory-100/65">{aboutText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="flex items-center gap-2 rounded-full border border-gold-500/30 bg-forest-900/80 px-4 py-2 text-xs text-gold-300">
                <ShieldCheck className="size-4" /> احراز هویت {toFa(stats.sellers.toLocaleString("en-US"))}+ فروشنده
              </span>
              <span className="flex items-center gap-2 rounded-full border border-gold-500/30 bg-forest-900/80 px-4 py-2 text-xs text-gold-300">
                <Lock className="size-4" /> معاملهٔ امن
              </span>
              <span className="flex items-center gap-2 rounded-full border border-gold-500/30 bg-forest-900/80 px-4 py-2 text-xs text-gold-300">
                <Headset className="size-4" /> پشتیبانی ۷ روز هفته
              </span>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ivory-100/60">
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5 text-gold-400" /> {phoneText}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5 text-gold-400" /> {emailText}
              </span>
            </div>
            <div className="mt-5 flex gap-2">
              {[AtSign, Send, Globe].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="شبکه اجتماعی"
                  className="grid size-10 place-items-center rounded-full border border-ivory-100/15 text-ivory-100/70 transition-all hover:border-gold-500 hover:text-gold-300"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* mega links: like divar */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <h4 className={headCls}>
                <Feather className="size-4" />
                پرندگان
              </h4>
              <ul className={colCls}>
                {birdCats.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/explore?category=${c.slug}`} className={linkCls}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={headCls}>
                <PawPrint className="size-4" />
                حیوانات خانگی
              </h4>
              <ul className={colCls}>
                {petCats.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/explore?category=${c.slug}`} className={linkCls}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={headCls}>
                <PackageOpen className="size-4" />
                تجهیزات و خدمات
              </h4>
              <ul className={colCls}>
                {gearCats.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/explore?category=${c.slug}`} className={linkCls}>
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/explore?kind=gear" className={`${linkCls} text-gold-400/80`}>
                    همهٔ تجهیزات ←
                  </Link>
                </li>
              </ul>

              <h4 className={`${headCls} mt-9`}>
                <Bird className="size-4" />
                سرویس‌های طوقی
              </h4>
              <ul className={colCls}>
                {ABOUT_LINKS.map((l, i) => (
                  <li key={l.label + i}>
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <InstallAppLink />
                </li>
              </ul>
            </div>

            <div>
              <h4 className={headCls}>
                <Zap className="size-4" />
                دسترسی سریع
              </h4>
              <ul className={colCls}>
                {QUICK_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* hot searches */}
        <div className="border-b border-ivory-100/10 py-9">
          <h4 className="mb-5 flex items-center gap-2 text-sm font-bold text-ivory-100/80">
            <Flame className="size-4 text-gold-500" />
            جستجوهای داغ
          </h4>
          <div className="flex flex-wrap gap-2">
            {hotItems.map((s) => (
              <Link
                key={s.q}
                href={s.href}
                className="rounded-full border border-ivory-100/12 bg-forest-900/60 px-4 py-1.5 text-xs text-ivory-100/65 transition-all hover:border-gold-500/60 hover:bg-gold-500 hover:text-forest-950"
              >
                {s.q}
              </Link>
            ))}
          </div>
        </div>

        {/* cities */}
        <div className="border-b border-ivory-100/10 py-9">
          <h4 className="mb-5 flex items-center gap-2 text-sm font-bold text-ivory-100/80">
            <MapPin className="size-4 text-gold-500" />
            خرید و فروش در شهر شما
          </h4>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2.5 text-[13px] text-ivory-100/60 sm:grid-cols-6 lg:grid-cols-8">
            {citiesRes.map((c) => (
              <Link key={c.slug} href={`/explore?city=${c.slug}`} className={linkCls}>
                خرید پرنده در {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* watermark */}
        <div className="pointer-events-none relative mt-8 select-none overflow-hidden">
          <p
            className="font-display whitespace-nowrap text-center text-[24vw] font-bold leading-[0.85] text-transparent lg:text-[15rem]"
            style={{ WebkitTextStroke: "1px rgba(223,191,116,0.14)" }}
          >
            طوقی
          </p>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-forest-950 to-transparent" />
        </div>

        {/* legal bottom bar */}
        <div className="relative flex flex-col items-center justify-between gap-4 pt-2 text-xs text-ivory-100/45 sm:flex-row">
          <p className="flex items-center gap-1.5">
            <Compass className="size-3.5 text-gold-500" />© {toFa(1405)} طوقی — تمامی حقوق مادی و معنوی محفوظ است.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/guide" className="transition-colors hover:text-gold-300">قوانین انتشار آگهی</Link>
            <Link href="/guide" className="transition-colors hover:text-gold-300">حریم خصوصی</Link>
            <Link href="/guide" className="transition-colors hover:text-gold-300">شرایط استفاده</Link>
            <Link href="/guide" className="transition-colors hover:text-gold-300">تماس با پشتیبانی</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
