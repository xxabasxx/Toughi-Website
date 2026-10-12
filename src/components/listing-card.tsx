import Link from "next/link";
import { MapPin, Eye, Crown } from "lucide-react";
import type { ListingCard } from "@/lib/queries";
import { formatToman, timeAgoFa, faNum, cn } from "@/lib/utils";
import { FavoriteButton } from "./favorite-button";

export function ListingCardView({
  item,
  favored = false,
  priority = false,
  big = false,
}: {
  item: ListingCard;
  favored?: boolean;
  priority?: boolean;
  big?: boolean;
}) {
  const img = item.images?.[0];
  const sold = item.status === "sold";

  return (
    <Link
      href={`/ad/${item.id}`}
      className={cn(
        "card-luxe group relative flex flex-col overflow-hidden rounded-[1.75rem]",
        big && "h-full",
      )}
    >
      <div className={cn("relative overflow-hidden", big ? "aspect-[5/4]" : "aspect-[4/3]")}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={item.title}
            loading={priority ? "eager" : "lazy"}
            className={cn(
              "size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]",
              sold && "grayscale-[0.5]",
            )}
          />
        ) : (
          <div className="grid size-full place-items-center bg-forest-900 text-gold-500/40">
            <Crown className="size-10" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/55 via-transparent to-transparent opacity-80" />

        <div className="absolute right-3 top-3 flex flex-col items-start gap-1.5">
          {item.featured && (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-l from-gold-600 to-gold-400 px-3 py-1 text-[11px] font-bold text-forest-950 shadow-lg">
              <Crown className="size-3" />
              نشان‌دار
            </span>
          )}
          {sold && (
            <span className="rounded-full bg-ink-950/85 px-3 py-1 text-[11px] font-bold text-ivory-100 backdrop-blur">
              فروخته شد
            </span>
          )}
        </div>

        <div className="absolute left-3 top-3 z-10">
          <FavoriteButton listingId={item.id} initialActive={favored} />
        </div>

        <span className="absolute bottom-3 right-3 rounded-full bg-forest-950/70 px-3 py-1 text-[11px] font-medium text-gold-200 backdrop-blur">
          {item.categoryName}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <h3
          className={cn(
            "line-clamp-2 font-display font-bold leading-7 text-forest-950 transition-colors group-hover:text-forest-700",
            big ? "text-xl" : "text-[17px]",
          )}
        >
          {item.title}
        </h3>

        <div className="mt-auto">
          <div className="mb-2.5 flex items-center justify-between text-[12px] text-ink-400">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 text-gold-600" />
              {item.cityName}
            </span>
            <span>{timeAgoFa(item.createdAt)}</span>
          </div>

          <div className="flex items-end justify-between border-t border-ivory-300/80 pt-2.5">
            <p
              className={cn(
                "font-display font-bold",
                item.price ? "text-gradient-gold text-xl" : "text-lg text-forest-700",
              )}
            >
              {formatToman(item.price)}
            </p>
            <span className="flex items-center gap-1 text-[11px] text-ink-400">
              <Eye className="size-3.5" />
              {faNum(item.views)}
            </span>
          </div>

          {item.negotiable && (
            <span className="mt-2 inline-block rounded-full bg-forest-800/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-forest-700">
              قابل مذاکره
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
