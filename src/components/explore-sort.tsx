"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SORTS = [
  { key: "", label: "جدیدترین" },
  { key: "featured", label: "نشان‌دارها" },
  { key: "cheap", label: "ارزان‌ترین" },
  { key: "expensive", label: "گران‌ترین" },
  { key: "popular", label: "پربازدیدترین" },
];

export function ExploreSort() {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("sort") ?? "";

  const apply = (key: string) => {
    const params = new URLSearchParams(sp.toString());
    params.delete("page");
    if (key) params.set("sort", key);
    else params.delete("sort");
    router.push(`/explore${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      <ArrowUpDown className="size-4 shrink-0 text-gold-600" />
      {SORTS.map((s) => (
        <button
          key={s.key}
          onClick={() => apply(s.key)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all",
            current === s.key
              ? "bg-forest-800 text-gold-200 shadow-lg"
              : "bg-white/70 text-ink-500 hover:bg-ivory-200 hover:text-forest-800",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
