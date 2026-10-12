"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Search,
  Feather,
  PawPrint,
  PackageOpen,
  LayoutGrid,
  MapPin,
  RotateCcw,
  Check,
} from "lucide-react";
import { cn, toFa } from "@/lib/utils";

type Cat = { id: number; name: string; slug: string; kind: string };
type City = { id: number; name: string; slug: string };

const KINDS = [
  { key: "", label: "همه", icon: LayoutGrid },
  { key: "birds", label: "پرندگان", icon: Feather },
  { key: "pets", label: "حیوانات خانگی", icon: PawPrint },
  { key: "gear", label: "قفس و تجهیزات", icon: PackageOpen },
];

const PRICE_CHIPS = [
  { label: "تا ۱ میلیون", min: "", max: "1000000" },
  { label: "۱ تا ۱۰ میلیون", min: "1000000", max: "10000000" },
  { label: "۱۰ تا ۵۰ میلیون", min: "10000000", max: "50000000" },
  { label: "بالای ۵۰ میلیون", min: "50000000", max: "" },
];

export function ExploreFilters({ categories, cities }: { categories: Cat[]; cities: City[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const current = {
    q: sp.get("q") ?? "",
    kind: sp.get("kind") ?? "",
    category: sp.get("category") ?? "",
    city: sp.get("city") ?? "",
    min: sp.get("min") ?? "",
    max: sp.get("max") ?? "",
    negotiable: sp.get("negotiable") ?? "",
    sort: sp.get("sort") ?? "",
    seller: sp.get("seller") ?? "",
  };

  const [q, setQ] = useState(current.q);
  const [min, setMin] = useState(current.min);
  const [max, setMax] = useState(current.max);

  const apply = (patch: Record<string, string>) => {
    const params = new URLSearchParams(sp.toString());
    params.delete("page");
    for (const [k, v] of Object.entries(patch)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`/explore${params.size ? `?${params.toString()}` : ""}`);
  };

  const reset = () => {
    setQ("");
    setMin("");
    setMax("");
    router.push("/explore");
  };

  const filteredCats = current.kind ? categories.filter((c) => c.kind === current.kind) : categories;

  return (
    <div className="space-y-6">
      {/* search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
        className="relative"
      >
        <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو در آگهی‌ها..."
          className="input-luxe pr-11"
        />
      </form>

      {/* kind */}
      <div>
        <p className="mb-3 text-xs font-bold tracking-wider text-ink-400">نوع</p>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((k) => (
            <button
              key={k.key}
              onClick={() => apply({ kind: k.key, category: "" })}
              className={cn(
                "flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-[13px] font-semibold transition-all",
                current.kind === k.key
                  ? "border-gold-500 bg-gold-500/15 text-forest-800"
                  : "border-ivory-300 bg-white/70 text-ink-500 hover:border-gold-500/60",
              )}
            >
              <k.icon className="size-4 shrink-0" />
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {/* categories */}
      <div>
        <p className="mb-3 text-xs font-bold tracking-wider text-ink-400">دسته‌بندی</p>
        <div className="max-h-72 space-y-1 overflow-y-auto pl-1">
          {filteredCats.map((c) => (
            <button
              key={c.slug}
              onClick={() => apply({ category: current.category === c.slug ? "" : c.slug })}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] transition-colors",
                current.category === c.slug
                  ? "bg-forest-800 font-bold text-gold-200"
                  : "text-ink-700 hover:bg-ivory-200",
              )}
            >
              {c.name}
              {current.category === c.slug && <Check className="size-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* price */}
      <div>
        <p className="mb-3 text-xs font-bold tracking-wider text-ink-400">قیمت (تومان)</p>
        <div className="flex items-center gap-2">
          <input
            value={min}
            onChange={(e) => setMin(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="حداقل"
            inputMode="numeric"
            className="input-luxe !py-2.5 text-xs"
          />
          <span className="text-ink-400">—</span>
          <input
            value={max}
            onChange={(e) => setMax(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="حداکثر"
            inputMode="numeric"
            className="input-luxe !py-2.5 text-xs"
          />
        </div>
        <button
          onClick={() => apply({ min, max })}
          className="btn-forest mt-2.5 w-full rounded-xl py-2.5 text-xs font-bold"
        >
          اعمال بازه قیمت
        </button>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRICE_CHIPS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setMin(p.min);
                setMax(p.max);
                apply({ min: p.min, max: p.max });
              }}
              className="rounded-full border border-ivory-300 bg-white/70 px-3 py-1.5 text-[11px] text-ink-500 transition-colors hover:border-gold-500 hover:text-gold-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* city */}
      <div>
        <p className="mb-3 text-xs font-bold tracking-wider text-ink-400">شهر</p>
        <div className="relative">
          <MapPin className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <select
            value={current.city}
            onChange={(e) => apply({ city: e.target.value })}
            className="input-luxe appearance-none pr-11"
          >
            <option value="">همه شهرها</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* negotiable */}
      <button
        onClick={() => apply({ negotiable: current.negotiable ? "" : "1" })}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-[13px] font-semibold transition-all",
          current.negotiable
            ? "border-gold-500 bg-gold-500/15 text-forest-800"
            : "border-ivory-300 bg-white/70 text-ink-500 hover:border-gold-500/60",
        )}
      >
        فقط آگهی‌های قابل مذاکره
        <span
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            current.negotiable ? "bg-gold-500" : "bg-ivory-300",
          )}
        >
          <span
            className={cn(
              "absolute top-1 size-4 rounded-full bg-white shadow transition-all",
              current.negotiable ? "right-6" : "right-1",
            )}
          />
        </span>
      </button>

      <button
        onClick={reset}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ivory-300 py-3 text-xs font-semibold text-ink-400 transition-colors hover:border-clay-500 hover:text-clay-500"
      >
        <RotateCcw className="size-3.5" />
        حذف همه فیلترها
      </button>

      <p className="text-center text-[10px] leading-5 text-ink-400">
        {toFa("1405")} طوقی — معاملهٔ امن با نکات راهنما
      </p>
    </div>
  );
}
