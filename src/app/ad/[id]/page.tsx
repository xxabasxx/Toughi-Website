import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ChevronLeft,
  MapPin,
  Clock,
  Eye,
  Tag,
  BadgeCheck,
  ShieldCheck,
  Handshake,
  FileCheck2,
  House,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getListingDetail, getSimilarListings, getFavoritesSet } from "@/lib/queries";
import { AdGallery } from "@/components/ad-gallery";
import { AdContactCard } from "@/components/ad-contact-card";
import { ListingCardView } from "@/components/listing-card";
import { Reveal } from "@/components/reveal";
import { ViewTracker } from "./view-tracker";
import { formatToman, timeAgoFa, formatDateFa, faNum, toFa, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const row = await getListingDetail(id);
    if (!row) return { title: "آگهی یافت نشد" };
    return {
      title: row.listing.title,
      description: row.listing.description.slice(0, 150),
    };
  } catch {
    return { title: "آگهی" };
  }
}

export default async function AdDetailPage({ params }: PageProps) {
  const { id } = await params;
  let row;
  try {
    row = await getListingDetail(id);
  } catch {
    row = null;
  }
  if (!row) notFound();

  const user = await getSessionUser();
  const isOwner = user?.id === row.seller.id;
  if (row.listing.status !== "active" && !isOwner) notFound();

  const [similar, favSet] = await Promise.all([
    getSimilarListings(row.listing.categoryId, row.listing.id, 4),
    getFavoritesSet(user?.id),
  ]);

  const { listing, city, category, seller } = row;
  const attrs = Object.entries(listing.attributes ?? {}).filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
      <ViewTracker id={listing.id} />

      {/* breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-ink-400">
        <Link href="/" className="transition-colors hover:text-gold-700">خانه</Link>
        <ChevronLeft className="size-3" />
        <Link href="/explore" className="transition-colors hover:text-gold-700">آگهی‌ها</Link>
        <ChevronLeft className="size-3" />
        <Link href={`/explore?category=${category.slug}`} className="transition-colors hover:text-gold-700">
          {category.name}
        </Link>
        <ChevronLeft className="size-3" />
        <span className="line-clamp-1 max-w-56 font-medium text-ink-700">{listing.title}</span>
      </nav>

      {listing.status !== "active" && (
        <div className="mb-5 rounded-2xl bg-clay-500/15 px-5 py-3 text-sm font-semibold text-clay-600">
          این آگهی در حالت «{listing.status === "sold" ? "فروخته‌شده" : "پنهان"}» است و فقط برای شما قابل مشاهده است.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <AdGallery images={listing.images} title={listing.title} />

          {/* title block */}
          <div className="mt-7">
            <div className="flex flex-wrap items-center gap-2">
              {listing.featured && (
                <span className="rounded-full bg-gradient-to-l from-gold-600 to-gold-400 px-3 py-1 text-[11px] font-bold text-forest-950">
                  نشان‌دار
                </span>
              )}
              <span className="rounded-full bg-forest-800/10 px-3 py-1 text-[11px] font-semibold text-forest-700">
                {category.name}
              </span>
            </div>
            <h1 className="font-display mt-3 text-2xl font-bold leading-relaxed text-forest-950 sm:text-3xl">
              {listing.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-gold-600" /> {city.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-gold-600" /> {timeAgoFa(listing.createdAt)} — {formatDateFa(listing.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="size-3.5 text-gold-600" /> {faNum(listing.views)} بازدید
              </span>
            </div>
          </div>

          {/* attributes */}
          {attrs.length > 0 && (
            <Reveal>
              <div className="mt-8">
                <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold text-forest-950">
                  <Tag className="size-5 text-gold-600" />
                  مشخصات
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {attrs.map(([k, v]) => (
                    <div key={k} className="card-luxe rounded-2xl px-4 py-3.5">
                      <p className="text-[11px] text-ink-400">{k}</p>
                      <p className="mt-1 text-sm font-bold text-forest-900">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* description */}
          <Reveal delay={1}>
            <div className="mt-9">
              <h2 className="font-display mb-4 text-xl font-bold text-forest-950">توضیحات فروشنده</h2>
              <div className="card-luxe rounded-[1.75rem] p-6 text-[15px] leading-9 text-ink-700 sm:p-7">
                {listing.description.split("\n").map((line, i) => (
                  <p key={i} className={cn(!line && "h-3")}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>

          {/* safety */}
          <Reveal delay={2}>
            <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-forest-950 p-6 text-ivory-100 sm:p-7">
              <div className="grain absolute inset-0" />
              <h2 className="font-display relative flex items-center gap-2 text-lg font-bold text-gold-300">
                <ShieldCheck className="size-5" />
                نکات امن معامله
              </h2>
              <ul className="relative mt-4 space-y-3 text-[13px] leading-6 text-ivory-100/70">
                <li className="flex items-start gap-2.5">
                  <House className="mt-0.5 size-4 shrink-0 text-gold-400" />
                  حتماً در محل و حضوری حیوان را بررسی کن؛ از مشاهده به فیلم اکتفا نکن.
                </li>
                <li className="flex items-start gap-2.5">
                  <FileCheck2 className="mt-0.5 size-4 shrink-0 text-gold-400" />
                  برای طوطی‌های خاص، حلقه پا، برگه تولد یا اصالت و برگه سلامت دامپزشک را بخواه.
                </li>
                <li className="flex items-start gap-2.5">
                  <Handshake className="mt-0.5 size-4 shrink-0 text-gold-400" />
                  هیچ‌وقت قبل از تحویل، بیعانه یا مبلغی واریز نکن.
                </li>
              </ul>
            </div>
          </Reveal>
        </div>

        {/* side */}
        <div>
          <AdContactCard
            listingId={listing.id}
            price={listing.price}
            negotiable={listing.negotiable}
            isOwner={isOwner}
            favored={favSet.has(listing.id)}
            sellerName={seller.name}
            sellerShop={seller.shop}
            sellerVerified={seller.verified}
            sellerSince={formatDateFa(seller.createdAt)}
          />

          <Link
            href={`/explore?seller=${seller.id}`}
            className="card-luxe mt-4 flex items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold text-forest-800 transition-all hover:border-gold-500"
          >
            <span className="flex items-center gap-2">
              <BadgeCheck className={cn("size-4", seller.verified ? "text-gold-600" : "text-ink-400")} />
              سایر آگهی‌های {seller.shop ?? seller.name}
            </span>
            <ChevronLeft className="size-4" />
          </Link>
        </div>
      </div>

      {/* similar */}
      {similar.length > 0 && (
        <section className="mt-20">
          <Reveal>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-2 text-xs font-bold tracking-[0.25em] text-gold-600">شاید این‌ها را هم دوست داشته باشی</p>
                <h2 className="font-display text-3xl font-bold text-forest-950">آگهی‌های مشابه</h2>
              </div>
              <Link
                href={`/explore?category=${category.slug}`}
                className="group flex items-center gap-1.5 text-sm font-bold text-forest-800 transition-colors hover:text-gold-700"
              >
                همهٔ {category.name}
                <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((item, i) => (
              <Reveal key={item.id} delay={i}>
                <ListingCardView item={item} favored={favSet.has(item.id)} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <div className="mt-24" />
    </div>
  );
}
