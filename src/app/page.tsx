import Link from "next/link";
import {
  ShieldCheck,
  MessageCircle,
  Gem,
  Headset,
  ArrowLeft,
  BadgeCheck,
  Lock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getSetting, getBlocks } from "@/lib/cms";
import { getCmsIcon } from "@/lib/cms-icons";
import {
  getFeaturedListings,
  getLatestListings,
  getCategories,
  getCities,
  getStats,
  getCategoryCounts,
  getFavoritesSet,
} from "@/lib/queries";
import { HeroSearch } from "@/components/hero-search";
import { Marquee } from "@/components/marquee";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { ListingCardView } from "@/components/listing-card";
import { Reveal, FadeIn } from "@/components/reveal";
import { toFa, faNum } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    user, featured, latest, cats, cities, stats, catCounts,
    heroTitle, heroSubtitle, heroImageRaw, heroBadge, heroChipsRaw,
    showMarquee, showCategories, showFeatured, showLatest, showWhy, showCta, showFloatCards,
    marqueeBlocks, whyBlocks, ctaBlocks, floatBlocks,
  ] = await Promise.all([
    getSessionUser(),
    getFeaturedListings(10),
    getLatestListings(8),
    getCategories(),
    getCities(),
    getStats(),
    getCategoryCounts(),
    getSetting("home.hero_title", "همراهِ بال‌دارِ\nزندگی‌ات را |با افتخار| انتخاب کن"),
    getSetting("home.hero_subtitle", "از طوطی ماکاوِ دستیِ پرورش‌یافته تا قناری تولیدیِ اصالت‌دار؛ هر آگهی در طوقی با دقت گزینش می‌شود تا معامله‌ای امن، شفاف و لذت‌بخش را تجربه کنی."),
    getSetting("home.hero_image", ""),
    getSetting("home.hero_badge", "بازار گزیدهٔ پرندگان و حیوانات خانگی ایران"),
    getSetting("home.hero_chips", "طوطی ماکاو:/explore?category=macaw|کاسکو سخنگو:/explore?category=grey-parrot|قناری تولیدی:/explore?category=canary|گربه پرشین:/explore?category=cat|توافقی و مذاکره‌ای:/explore?negotiable=1"),
    getSetting("home.show_marquee", "1"),
    getSetting("home.show_categories", "1"),
    getSetting("home.show_featured", "1"),
    getSetting("home.show_latest", "1"),
    getSetting("home.show_why", "1"),
    getSetting("home.show_cta", "1"),
    getSetting("home.show_hero_float_cards", "1"),
    getBlocks("marquee"),
    getBlocks("why"),
    getBlocks("cta"),
    getBlocks("hero"),
  ]);
  const favSet = await getFavoritesSet(user?.id);

  const heroImage = heroImageRaw || "/images/hero-pigeon.jpg";
  const chips = heroChipsRaw.split("|").map((s) => {
    const idx = s.lastIndexOf(":");
    return { label: s.slice(0, idx), href: s.slice(idx + 1) || "/explore" };
  }).filter((c) => c.label);
  const heroLines = heroTitle.split("\n");
  const whyItems = (whyBlocks.length ? whyBlocks : [
    { id: "d1", icon: "shield", title: "احراز هویت طلایی", body: "هویت فروشگاه‌ها و پرورش‌دهندگان حرفه‌ای با مدارک رسمی بررسی و با نماد طلایی معرفی می‌شوند." },
    { id: "d2", icon: "chat", title: "چت امن داخلی", body: "بدون افشای شماره تماس، مستقیم با فروشنده گفتگو کن و فقط وقتی مطمئن شدی جلسه ملاقات بگذار." },
    { id: "d3", icon: "gem", title: "گزینش تخصصی آگهی‌ها", body: "تیم ادیتور طوقی آگهی‌ها را بر اساس گونه، اصالت و سلامت بررسی می‌کند؛ آگهی‌های نامعتبر حذف می‌شوند." },
    { id: "d4", icon: "lock", title: "راهنمای معاملهٔ امن", body: "از پرداخت امن در محل تا چک‌لیست بررسی سلامت پرنده — همراه تو هستیم تا معامله‌ای بی‌دغدغه داشته باشی." },
  ]);
  const marqueeItems = marqueeBlocks.length
    ? marqueeBlocks.map((b) => b.title).filter(Boolean)
    : ["طوطی ماکاو آبی و طلایی", "کاسکو تنه‌قرمز سخنگو", "قناری ساکسی‌نژاد تولیدی", "عروس هلندی لوتینو دست‌رام", "فنچ زیبرا و گلدان", "ماکائو هایسنت دستی", "گربه پرشین چشم‌آبی", "آکواریوم دیسکاس پلانت", "مرغ عشق ژاکلینی", "طاووس سفید هندی"];
  const cta = ctaBlocks[0] ?? {
    title: "پرنده‌ات را به دست |بهترین نگهدارنده‌ها| بسپار",
    subtitle: "ثبت آگهی کاملاً رایگان است",
    body: "در کمتر از دو دقیقه آگهی‌ات را با عکس‌های دیدنی ثبت کن؛ به هزاران خریدار واقعی در سراسر ایران نمایش داده شود و با چت داخلی، امن و سریع معامله کن.",
    image: "/images/cta-cockatoo.jpg",
    icon: "",
  };
  const floatCards = floatBlocks.length && showFloatCards === "1"
    ? floatBlocks.slice(0, 2)
    : showFloatCards === "1"
      ? [
          { icon: "shield", title: "فروشندگان احرازشده", body: "نماد طلایی فقط برای هویت‌های تأییدشده" },
          { icon: "chat", title: "چت امن داخلی", body: "بدون افشای شماره، مستقیم گفتگو کن" },
        ]
      : [];
  const show = (v: string) => v !== "0";

  const showcase = cats
    .filter((c) => c.image)
    .sort((a, b) => (catCounts.get(b.id) ?? 0) - (catCounts.get(a.id) ?? 0))
    .slice(0, 7);

  const renderHeroLine = (line: string, key: number) => {
    const parts = line.split(/(\|[^|]*\|)/g).filter(Boolean);
    return (
      <span key={key} className="block">
        {parts.map((p, i) =>
          p.startsWith("|") && p.endsWith("|") ? (
            <span key={i} className="text-gradient-gold animate-shine">{p.slice(1, -1)}</span>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </span>
    );
  };

  return (
    <div className="overflow-hidden">
      {/* ===================== HERO ===================== */}
      <section className="relative -mt-[84px] flex min-h-[100svh] items-center bg-forest-950 pt-[100px] text-ivory-100">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt="کبوتر زینتی گردن‌فر سفید"
            className="size-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-forest-950 via-forest-950/78 to-forest-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-transparent to-forest-950/70" />
        </div>
        <div className="grain absolute inset-0" />

        <div
          className="pointer-events-none absolute -left-40 top-1/3 size-[540px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(201,162,75,0.35), transparent 65%)" }}
        />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <FadeIn delay={0.1}>
              <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-gold-500/35 bg-forest-900/60 px-5 py-2 text-xs font-medium tracking-wide text-gold-300 backdrop-blur">
                <Sparkles className="size-3.5" />
                {heroBadge}
              </p>
            </FadeIn>

            <FadeIn delay={0.22}>
              <h1 className="font-display text-[13vw] font-bold leading-[1.12] tracking-tight sm:text-6xl lg:text-[4.6rem]">
                {heroLines.map((line, i) => renderHeroLine(line, i))}
              </h1>
            </FadeIn>

            <FadeIn delay={0.36}>
              <p className="mt-6 max-w-xl whitespace-pre-line text-[15px] leading-8 text-ivory-100/70 sm:text-base">
                {heroSubtitle}
              </p>
            </FadeIn>

            <FadeIn delay={0.5} className="mt-9 max-w-2xl">
              <HeroSearch
                cities={cities.map((c) => ({ name: c.name, slug: c.slug }))}
chips={chips}
              />
            </FadeIn>

            <FadeIn delay={0.66}>
              <div className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-ivory-100/10 pt-7">
                {[
                  { num: faNum(stats.ads), label: "آگهی فعال و بررسی‌شده" },
                  { num: faNum(stats.sellers), label: "فروشندهٔ عضو" },
                  { num: faNum(cities.length), label: "شهر تحت پوشش" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-4xl font-bold text-gold-300">
                      {s.num}
                      <span className="text-gold-500">+</span>
                    </p>
                    <p className="mt-1 text-xs text-ivory-100/55">{s.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <div className="hidden justify-end gap-4 pb-2 lg:flex lg:flex-col">
            {floatCards.map((c, i) => (
              <FadeIn key={c.title} delay={0.7 + i * 0.15}>
                <div className="glass-dark flex w-72 items-start gap-3.5 rounded-3xl p-5 shadow-2xl" style={{ transform: `translateY(${i * 8}px)` }}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-forest-950">
                    {(() => { const I = getCmsIcon(c.icon, ShieldCheck); return <I className="size-5" />; })()}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-bold text-ivory-100">
                      {c.title}
                      <BadgeCheck className="size-4 text-gold-400" />
                    </p>
                    <p className="mt-1 text-xs leading-5 text-ivory-100/60">{c.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <ChevronDown className="size-6 animate-float text-gold-400/80" />
        </div>
      </section>

      {show(showMarquee) && <Marquee items={marqueeItems} />}

      {/* ===================== CATEGORIES ===================== */}
      {show(showCategories) && (
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-gold-600">
                <span className="h-px w-10 bg-gold-500" />
                دنیای طوقی
              </p>
              <h2 className="font-display text-4xl font-bold leading-snug text-forest-950 sm:text-5xl">
                دسته‌بندی‌های <span className="text-gradient-gold">گزیده</span>
              </h2>
            </div>
            <Link
              href="/explore"
              className="group flex items-center gap-2 rounded-full border border-forest-800/25 px-6 py-3 text-sm font-bold text-forest-800 transition-all hover:border-gold-500 hover:bg-gold-500 hover:text-forest-950"
            >
              مشاهده همه آگهی‌ها
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {showcase.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.6} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <Link
                href={`/explore?category=${c.slug}`}
                className="group relative block h-full min-h-40 overflow-hidden rounded-[1.75rem] lg:min-h-48"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image ?? "/images/hero-pigeon.jpg"}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/25 to-transparent transition-opacity duration-500" />
                <div className="absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-gold-500/0 transition-all duration-500 group-hover:ring-gold-500/60" />
                <div className="relative flex h-full flex-col justify-end p-5 lg:p-6">
                  <p className={`font-display font-bold text-ivory-100 ${i === 0 ? "text-2xl lg:text-3xl" : "text-lg"}`}>
                    {c.name}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-gold-300">
                    {toFa(catCounts.get(c.id) ?? 0)} آگهی فعال
                    <span className="grid size-6 translate-y-1 place-items-center rounded-full bg-gold-500 text-forest-950 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowLeft className="size-3.5" />
                    </span>
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}

          <Reveal delay={4}>
            <Link
              href="/explore"
              className="group relative flex h-full min-h-40 flex-col justify-between overflow-hidden rounded-[1.75rem] bg-forest-950 p-5 lg:min-h-48 lg:p-6"
            >
              <div className="grain absolute inset-0" />
              <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-gold-500/20 blur-3xl transition-all group-hover:bg-gold-500/35" />
              <Sparkles className="relative size-7 text-gold-400" />
              <div className="relative">
                <p className="font-display text-lg font-bold text-ivory-100">
                  {toFa(cats.length)} دسته‌بندی تخصصی
                </p>
                <p className="mt-1 text-xs leading-5 text-ivory-100/60">
                  از فنچ کوچک تا کاکادوی سلطنتی — کاوش کن
                </p>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>
      )}

      {/* ===================== FEATURED ===================== */}
      {show(showFeatured) && (
      <section className="relative py-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-ivory-200/70 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <Reveal>
            <div className="mb-10 flex items-center gap-4">
              <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-700 text-forest-950 shadow-lg shadow-gold-500/30">
                <Gem className="size-6" />
              </span>
              <div>
                <h2 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">
                  آگهی‌های <span className="text-gradient-gold">نشان‌دار</span>
                </h2>
                <p className="mt-1.5 text-sm text-ink-500">انتخاب منتخب فروشگاه‌ها و پرورش‌دهندگان برتر</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <FeaturedCarousel items={featured} favorites={[...favSet]} />
          </Reveal>
        </div>
      </section>
      )}

      {/* ===================== LATEST ===================== */}
      {show(showLatest) && (
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-gold-600">
                <span className="h-px w-10 bg-gold-500" />
                تازه از قفس
              </p>
              <h2 className="font-display text-4xl font-bold leading-snug text-forest-950 sm:text-5xl">
                جدیدترین آگهی‌ها
              </h2>
            </div>
            <Link
              href="/explore"
              className="group flex items-center gap-2 rounded-full border border-forest-800/25 px-6 py-3 text-sm font-bold text-forest-800 transition-all hover:border-gold-500 hover:bg-gold-500 hover:text-forest-950"
            >
              مشاهده همه
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((item, i) => (
            <Reveal key={item.id} delay={i % 4}>
              <ListingCardView item={item} favored={favSet.has(item.id)} priority={i < 4} />
            </Reveal>
          ))}
        </div>
      </section>
      )}

      {/* ===================== WHY ===================== */}
      {show(showWhy) && (
      <section className="relative overflow-hidden bg-forest-950 py-24 text-ivory-100">
        <div className="grain absolute inset-0" />
        <div
          className="pointer-events-none absolute right-1/2 top-0 size-[620px] translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(201,162,75,0.4), transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-3 text-xs font-bold tracking-[0.3em] text-gold-500">چرا طوقی؟</p>
              <h2 className="font-display text-4xl font-bold leading-snug sm:text-5xl">
                تجربه‌ای که لایقِ <span className="text-gradient-gold">همراهِ توست</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyItems.map((f, i) => (
              <Reveal key={f.id} delay={i}>
                <div className="group relative h-full overflow-hidden rounded-[1.75rem] border border-ivory-100/10 bg-forest-900/60 p-7 transition-all duration-500 hover:border-gold-500/40 hover:bg-forest-900">
                  <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gold-500/10 blur-2xl transition-all duration-500 group-hover:bg-gold-500/25" />
                  <span className="relative grid size-13 w-13 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-700 p-3.5 text-forest-950">
                    {(() => { const I = getCmsIcon(f.icon, ShieldCheck); return <I className="size-6" />; })()}
                  </span>
                  <h3 className="font-display relative mt-6 text-xl font-bold">{f.title}</h3>
                  <p className="relative mt-3 text-[13px] leading-6 text-ivory-100/60">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ===================== CTA ===================== */}
      {show(showCta) && (
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="card-luxe relative grid overflow-hidden rounded-[2.5rem] lg:grid-cols-2">
            <div className="relative min-h-72 lg:min-h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cta.image || "/images/cta-cockatoo.jpg"}
                alt={cta.title.split("|").join("").slice(0, 40) || "دعوت به ثبت آگهی"}
                className="absolute inset-0 size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#fdfaf2]" />
            </div>
            <div className="relative flex flex-col justify-center gap-6 p-9 sm:p-14">
              <p className="flex w-fit items-center gap-2 rounded-full bg-gold-500/15 px-4 py-1.5 text-xs font-bold text-gold-700">
                <Headset className="size-3.5" />
                {cta.subtitle || "ثبت آگهی کاملاً رایگان است"}
              </p>
              <h2 className="font-display text-3xl font-bold leading-snug text-forest-950 sm:text-[2.6rem]">
                {(cta.title || "").split("|").map((part, i) =>
                  i % 2 === 1 ? (
                    <span key={i} className="text-gradient-gold">{part}</span>
                  ) : (
                    <span key={i}>{part}</span>
                  ),
                )}
              </h2>
              <p className="max-w-md text-[15px] leading-8 text-ink-500">
                {cta.body}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/new" className="btn-gold rounded-full px-8 py-3.5 text-sm">
                  + ثبت آگهی رایگان
                </Link>
                <Link
                  href="/guide"
                  className="rounded-full border border-forest-800/25 px-8 py-3.5 text-sm font-bold text-forest-800 transition-all hover:border-gold-500 hover:text-gold-700"
                >
                  راهنمای امن معامله
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
      )}
    </div>
  );
}
