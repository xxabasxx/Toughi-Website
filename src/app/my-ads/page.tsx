import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import { Plus, LayoutGrid, PartyPopper } from "lucide-react";
import { db } from "@/db";
import { listings, categories, cities, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { listingCardSelect, type ListingCard } from "@/lib/queries";
import { MyAdsManager } from "@/components/my-ads-manager";
import { faNum } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "آگهی‌های من" };

export default async function MyAdsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/my-ads");
  const sp = await searchParams;
  const created = sp.created === "1";

  const rows = (await db
    .select(listingCardSelect)
    .from(listings)
    .innerJoin(cities, eq(listings.cityId, cities.id))
    .innerJoin(categories, eq(listings.categoryId, categories.id))
    .innerJoin(users, eq(listings.userId, users.id))
    .where(eq(listings.userId, user.id))
    .orderBy(desc(listings.createdAt))) as unknown as ListingCard[];

  const active = rows.filter((r) => r.status === "active");
  const others = rows.filter((r) => r.status !== "active");

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      {created && (
        <div className="card-luxe mb-8 flex items-center gap-4 rounded-[1.75rem] border-l-4 border-l-gold-500 p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold-500/15 text-gold-600">
            <PartyPopper className="size-6" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-forest-950">آگهی‌ات منتشر شد!</p>
            <p className="text-xs text-ink-400">
              آگهی تو هم‌اکنون برای هزاران بازدیدکننده طوقی قابل مشاهده است.
            </p>
          </div>
          <Link href={`/ad/${rows[0]?.id ?? ""}`} className="btn-gold mr-auto hidden rounded-full px-5 py-2.5 text-xs font-bold sm:block">
            مشاهده آگهی
          </Link>
        </div>
      )}

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.3em] text-gold-600">داشبورد فروشنده</p>
          <h1 className="font-display text-4xl font-bold text-forest-950 sm:text-5xl">آگهی‌های من</h1>
          <p className="mt-2 text-sm text-ink-400">
            {faNum(active.length)} آگهی فعال{others.length > 0 && ` • ${faNum(others.length)} آرشیو`}
          </p>
        </div>
        <Link href="/new" className="btn-gold flex items-center gap-1.5 rounded-full px-6 py-3 text-sm">
          <Plus className="size-4" />
          ثبت آگهی جدید
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card-luxe flex flex-col items-center gap-5 rounded-[2rem] px-8 py-20 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-forest-800/10 text-forest-700">
            <LayoutGrid className="size-9" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold text-forest-950">هنوز آگهی‌ای نداری</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-ink-400">
              اولین آگهی‌ات را همین حالا ثبت کن؛ فقط چند دقیقه طول می‌کشد و کاملاً رایگان است.
            </p>
          </div>
          <Link href="/new" className="btn-gold rounded-full px-7 py-3.5 text-sm">
            + ثبت اولین آگهی
          </Link>
        </div>
      ) : (
        <MyAdsManager items={rows} />
      )}
    </div>
  );
}
