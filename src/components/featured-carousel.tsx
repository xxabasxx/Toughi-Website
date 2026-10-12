"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { ListingCard } from "@/lib/queries";
import { ListingCardView } from "./listing-card";

export function FeaturedCarousel({
  items,
  favorites,
}: {
  items: ListingCard[];
  favorites: string[];
}) {
  const favSet = new Set(favorites);
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = () => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setProgress(max > 0 ? pos / max : 0);
    setCanPrev(pos > 8);
    setCanNext(pos < max - 8);
  };

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8) * -1, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-7 flex items-center gap-3">
        <button
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          aria-label="بعدی"
          className="grid size-12 place-items-center rounded-full border border-forest-800/20 bg-white/70 text-forest-800 transition-all hover:border-gold-500 hover:text-gold-600 disabled:opacity-30"
        >
          <ArrowRight className="size-5" />
        </button>
        <button
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          aria-label="قبلی"
          className="grid size-12 place-items-center rounded-full border border-forest-800/20 bg-white/70 text-forest-800 transition-all hover:border-gold-500 hover:text-gold-600 disabled:opacity-30"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-forest-800/10">
          <div
            className="absolute right-0 top-0 h-full rounded-full bg-gradient-to-l from-gold-600 to-gold-400 transition-all duration-300"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
      </div>

      <div
        ref={track}
        className="hide-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
        dir="rtl"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="w-[78vw] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%] xl:w-[23.5%]"
          >
            <ListingCardView item={item} favored={favSet.has(item.id)} priority big />
          </div>
        ))}
      </div>
    </div>
  );
}
