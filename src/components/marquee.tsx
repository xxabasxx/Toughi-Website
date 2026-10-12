import { Sparkle } from "lucide-react";

export function Marquee({ items }: { items: string[] }) {
  const row = (key: string, hidden = false) => (
    <div key={key} aria-hidden={hidden} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={`${key}-${i}`} className="flex items-center">
          <span className="font-display whitespace-nowrap px-8 text-xl font-medium tracking-wide text-gold-300/90 sm:text-2xl">
            {item}
          </span>
          <Sparkle className="size-3 shrink-0 text-gold-500/70" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-y border-gold-500/25 bg-forest-950 py-5">
      <div className="grain absolute inset-0" />
      <div className="flex w-max animate-marquee">
        {row("a")}
        {row("b", true)}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-forest-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-forest-950 to-transparent" />
    </div>
  );
}
