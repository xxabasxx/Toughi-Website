import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, SearchX, MapPin, BadgeCheck } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import {
  exploreListings,
  getCategories,
  getCities,
  getFavoritesSet,
  PAGE_SIZE,
} from "@/lib/queries";
import { ExploreFilters } from "@/components/explore-filters";
import { ExploreSort } from "@/components/explore-sort";
import { ListingCardView } from "@/components/listing-card";
import { Reveal } from "@/components/reveal";
import { faNum, toFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

const KIND_LABELS: Record<string, string> = {
  birds: "پرندگان",
  pets: "حیوانات خانگی",
  gear: "قفس و تجهیزات",
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  return { title: q ? `جستجوی «${q}»` : "کشف آگهی‌ها" };
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  const user = await getSessionUser();
  const filters = {
    q: str("q"),
    category: str("category"),
    kind: str("kind"),
    city: str("city"),
    min: str("min") ? Number(str("min")) : undefined,
    max: str("max") ? Number(str("max")) : undefined,
    sort: str("sort"),
    page: str("page") ? Math.max(1, Number(str("page"))) : 1,
    negotiable: str("negotiable") === "1",
    seller: str("seller"),
  };

  const [{ rows, total, page }, cats, citiesList, favSet] = await Promise.all([
    exploreListings(filters),
    getCategories(),
    getCities(),
    getFavoritesSet(user?.id),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCat = cats.find((c) => c.slug === filters.category);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string" && v && k !== "page") params.set(k, v);
    }
    params.set("page", String(p));
    return `/explore?${params.toString()}`;
  };

  const headline = filters.q
    ? `نتایج جستجو برای «${filters.q}»`
    : activeCat
      ? activeCat.name
      : filters.kind
        ? KIND_LABELS[filters.kind]
        : "کشف آگهی‌ها";

  return (
    <div>
      {/* page head */}
      <section className="relative overflow-hidden bg-forest-950 pb-14 pt-12 text-ivory-100">
        <div className="grain absolute inset-0" />
        <div
          className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(201,162,75,0.3), transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold tracking-[0.3em] text-gold-500">بازار طوقی</p>
              <h1 className="font-display text-4xl font-bold sm:text-5xl">{headline}</h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-ivory-100/60">
                {faNum(total)} آگهی {filters.city ? "" : "در سراسر ایران"}
                {filters.seller && (
                  <span className="flex items-center gap-1 rounded-full bg-gold-500/15 px-3 py-1 text-xs text-gold-300">
                    <BadgeCheck className="size-3.5" /> آگهی‌های این فروشنده
                  </span>
                )}
              </p>
            </div>
            <div className="hidden items-center gap-1.5 text-xs text-ivory-100/50 lg:flex">
              <MapPin className="size-3.5 text-gold-500" />
              {citiesList.slice(0, 5).map((c, i) => (
                <span key={c.slug} className="flex items-center gap-1.5">
                  <Link href={`/explore?city=${c.slug}`} className="transition-colors hover:text-gold-300">
                    {c.name}
                  </Link>
                  {i < 4 && <span className="text-gold-600">•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
          <aside className="card-luxe h-fit rounded-[1.75rem] p-5 lg:sticky lg:top-28">
            <Suspense>
              <ExploreFilters
                categories={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, kind: c.kind }))}
                cities={citiesList.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
              />
            </Suspense>
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <Suspense>
                <ExploreSort />
              </Suspense>
              <p className="hidden shrink-0 text-xs text-ink-400 sm:block">
                صفحه {toFa(page)} از {toFa(totalPages)}
              </p>
            </div>

            {rows.length === 0 ? (
              <div className="card-luxe flex flex-col items-center gap-5 rounded-[2rem] px-8 py-20 text-center">
                <span className="grid size-20 place-items-center rounded-full bg-ivory-200 text-ink-400">
                  <SearchX className="size-9" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-forest-950">آگهی‌ای پیدا نشد</h2>
                  <p className="mt-2 max-w-sm text-sm leading-7 text-ink-400">
                    با تغییر فیلترها یا حذف آن‌ها دوباره تلاش کن؛ یا اولین نفری باش که در این دسته آگهی
                    ثبت می‌کند.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/explore" className="btn-forest rounded-full px-6 py-3 text-sm">
                    حذف فیلترها
                  </Link>
                  <Link href="/new" className="btn-gold rounded-full px-6 py-3 text-sm">
                    + ثبت آگهی
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {rows.map((item, i) => (
                    <Reveal key={item.id} delay={i % 3}>
                      <ListingCardView item={item} favored={favSet.has(item.id)} priority={i < 3} />
                    </Reveal>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    {page > 1 && (
                      <Link
                        href={pageHref(page - 1)}
                        aria-label="صفحه قبل"
                        className="grid size-11 place-items-center rounded-full border border-ivory-300 bg-white/70 text-ink-500 transition-all hover:border-gold-500 hover:text-gold-700"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    )}
                    {Array.from({ length: totalPages })
                      .map((_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center gap-2">
                          {idx > 0 && arr[idx - 1] < p - 1 && <span className="text-ink-400">…</span>}
                          <Link
                            href={pageHref(p)}
                            className={
                              p === page
                                ? "grid size-11 place-items-center rounded-full bg-forest-800 font-bold text-gold-200 shadow-lg"
                                : "grid size-11 place-items-center rounded-full border border-ivory-300 bg-white/70 text-sm text-ink-500 transition-all hover:border-gold-500 hover:text-gold-700"
                            }
                          >
                            {toFa(p)}
                          </Link>
                        </span>
                      ))}
                    {page < totalPages && (
                      <Link
                        href={pageHref(page + 1)}
                        aria-label="صفحه بعد"
                        className="grid size-11 place-items-center rounded-full border border-ivory-300 bg-white/70 text-ink-500 transition-all hover:border-gold-500 hover:text-gold-700"
                      >
                        <ChevronLeft className="size-4" />
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
