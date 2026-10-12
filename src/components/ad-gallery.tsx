"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Crown } from "lucide-react";
import { cn, toFa } from "@/lib/utils";

export function AdGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const current = images[index] ?? images[0];

  const go = (dir: 1 | -1) => {
    setIndex((i) => (i + dir + images.length) % images.length);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(1);
      if (e.key === "ArrowRight") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-[2rem] bg-forest-900 text-gold-500/40">
        <Crown className="size-16" />
      </div>
    );
  }

  return (
    <div>
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-forest-950 shadow-[0_30px_60px_-30px_rgba(10,20,10,0.5)]"
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return;
          const dx = e.changedTouches[0].clientX - touchX;
          if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1);
          setTouchX(null);
        }}
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src + i}
            src={src}
            alt={`${title} — عکس ${toFa(i + 1)}`}
            className={cn(
              "absolute inset-0 size-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              i === index ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]",
            )}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/40 via-transparent to-transparent" />

        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="عکس قبلی"
              className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-all hover:bg-gold-500 hover:text-forest-950 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="عکس بعدی"
              className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-all hover:bg-gold-500 hover:text-forest-950 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
          </>
        )}

        <span className="absolute bottom-4 left-4 rounded-full bg-forest-950/70 px-3.5 py-1.5 text-xs font-medium text-gold-200 backdrop-blur">
          {toFa(index + 1)} / {toFa(images.length)}
        </span>
      </div>

      {images.length > 1 && (
        <div className="hide-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIndex(i)}
              aria-label={`عکس ${toFa(i + 1)}`}
              className={cn(
                "relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl transition-all duration-300",
                i === index
                  ? "ring-2 ring-gold-500 ring-offset-2 ring-offset-ivory-100"
                  : "opacity-60 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
