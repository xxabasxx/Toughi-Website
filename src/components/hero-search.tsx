"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

export function HeroSearch({
  chips,
  cities,
}: {
  chips: { label: string; href: string }[];
  cities: { name: string; slug: string }[];
}) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    router.push(`/explore${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        className="glass-dark flex flex-col gap-2 rounded-[2rem] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center sm:rounded-full"
      >
        <div className="flex flex-1 items-center gap-3 rounded-full px-4 py-3.5">
          <Search className="size-5 shrink-0 text-gold-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="دنبال چه هستی؟ مثلاً «طوطی ماکاو دستی» یا «قناری تولیدی»..."
            className="w-full bg-transparent text-[15px] text-ivory-100 placeholder:text-ivory-100/45 focus:outline-none"
          />
        </div>
        <div className="hidden h-8 w-px bg-gold-500/25 sm:block" />
        <div className="flex items-center gap-2 px-3 sm:px-2">
          <MapPin className="size-4 shrink-0 text-gold-400" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full appearance-none bg-transparent py-3 text-sm text-ivory-100/90 focus:outline-none sm:w-28 sm:py-0 [&>option]:text-ink-900"
          >
            <option value="">همه شهرها</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-gold rounded-full px-8 py-3.5 text-sm">
          جستجو
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs text-ivory-100/50">داغِ امروز:</span>
        {chips.map((c) => (
          <button
            key={c.href}
            onClick={() => router.push(c.href)}
            className="rounded-full border border-gold-500/30 bg-forest-900/50 px-4 py-1.5 text-xs text-gold-200 backdrop-blur transition-all duration-300 hover:border-gold-400 hover:bg-gold-500 hover:text-forest-950"
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
