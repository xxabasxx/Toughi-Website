import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites, listings, categories, cities, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { listingCardSelect, type ListingCard } from "@/lib/queries";
import { ListingCardView } from "@/components/listing-card";
import { Reveal } from "@/components/reveal";
import { Heart, Compass } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "آگهی‌های نشان‌شده" };

export default async function FavoritesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/favorites");

  const rows = await db
    .select({ ...listingCardSelect, favId: favorites.id, favCreated: favorites.createdAt })
    .from(favorites)
    .innerJoin(listings, eq(favorites.listingId, listings.id))
    .innerJoin(cities, eq(listings.cityId, cities.id))
    .innerJoin(categories, eq(listings.categoryId, categories.id))
    .innerJoin(users, eq(listings.userId, users.id))
    .where(eq(favorites.userId, user.id))
    .orderBy(desc(favorites.createdAt));

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.3em] text-gold-600">مجموعه شخصی تو</p>
          <h1 className="font-display flex items-center gap-3 text-4xl font-bold text-forest-950 sm:text-5xl">
            <Heart className="size-9 fill-clay-500 text-clay-500" />
            نشان‌شده‌ها
          </h1>
        </div>
        <Link
          href="/explore"
          className="rounded-full border border-forest-800/25 px-6 py-3 text-sm font-bold text-forest-800 transition-all hover:border-gold-500 hover:bg-gold-500 hover:text-forest-950"
        >
          ادامه کاوش
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card-luxe flex flex-col items-center gap-5 rounded-[2rem] px-8 py-20 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-clay-500/10 text-clay-500">
            <Heart className="size-9" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold text-forest-950">هنوز چیزی نشان نکرده‌ای</h2>
            <p className="mt-2 mx-auto max-w-sm text-sm leading-7 text-ink-400">
              وقتی آگهی‌ای دیدی که جلبت کرد، روی قلب بزن تا اینجا ذخیره شود و همیشه در دسترست باشد.
            </p>
          </div>
          <Link href="/explore?sort=featured" className="btn-gold flex items-center gap-2 rounded-full px-7 py-3.5 text-sm">
            <Compass className="size-4" />
            دیدن آگهی‌های نشان‌دار
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((item, i) => (
            <Reveal key={item.favId} delay={i % 4}>
              <ListingCardView item={item as unknown as ListingCard} favored priority={i < 4} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
