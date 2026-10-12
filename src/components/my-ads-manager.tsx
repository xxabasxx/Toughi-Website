"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Rocket,
  Trash2,
  MapPin,
  BadgeCheck,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { cn, faNum, formatToman, timeAgoFa, toFa } from "@/lib/utils";
import type { ListingCard } from "@/lib/queries";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  active: { label: "فعال", cls: "bg-emerald-600/12 text-emerald-700" },
  sold: { label: "فروخته شد", cls: "bg-gold-500/20 text-gold-700" },
  hidden: { label: "پنهان", cls: "bg-ink-400/15 text-ink-500" },
};

export function MyAdsManager({ items }: { items: ListingCard[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [gone, setGone] = useState<Set<string>>(new Set());

  const act = async (id: string, action: string, extra?: Record<string, string>) => {
    setBusy(id + action);
    await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    setBusy(null);
    router.refresh();
  };

  const remove = async (id: string) => {
    setBusy(id + "del");
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setBusy(null);
    setConfirming(null);
    setGone((s) => new Set(s).add(id));
    router.refresh();
  };

  const visible = items.filter((i) => !gone.has(i.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-4">
      {visible.map((item) => {
        const meta = STATUS_META[item.status] ?? STATUS_META.active;
        return (
          <div
            key={item.id}
            className="card-luxe flex flex-col gap-4 rounded-[1.75rem] p-4 sm:flex-row sm:items-center"
          >
            <Link href={`/ad/${item.id}`} className="relative block h-32 w-full shrink-0 overflow-hidden rounded-2xl sm:w-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.images[0] ?? "/images/hero-pigeon.jpg"}
                alt={item.title}
                className="absolute inset-0 size-full object-cover"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-1 text-[10.5px] font-bold", meta.cls)}>
                  {meta.label}
                </span>
                {item.featured && (
                  <span className="flex items-center gap-1 rounded-full bg-gold-500/20 px-2.5 py-1 text-[10.5px] font-bold text-gold-700">
                    <BadgeCheck className="size-3" /> نشان‌دار
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px] text-ink-400">
                  <Clock className="size-3" /> {timeAgoFa(item.createdAt)}
                </span>
              </div>
              <Link href={`/ad/${item.id}`}>
                <h3 className="font-display mt-2 line-clamp-1 text-lg font-bold text-forest-950 hover:text-forest-700">
                  {item.title}
                </h3>
              </Link>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-gold-600" /> {item.cityName}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="size-3.5 text-gold-600" /> {faNum(item.views)} بازدید
                </span>
                <span className="font-display text-sm font-bold text-gold-700">{formatToman(item.price)}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
              <select
                value={item.status}
                disabled={busy !== null}
                onChange={(e) => act(item.id, "status", { status: e.target.value })}
                className="rounded-xl border border-ivory-300 bg-white/80 px-3 py-2.5 text-xs font-bold text-forest-800 focus:border-gold-500 focus:outline-none"
              >
                <option value="active">نمایش فعال</option>
                <option value="sold">فروخته شد</option>
                <option value="hidden">پنهان کردن</option>
              </select>
              <button
                onClick={() => act(item.id, "bump")}
                disabled={busy !== null || item.status !== "active"}
                className="btn-forest flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold disabled:opacity-40"
              >
                <Rocket className="size-3.5" />
                نرده — صدر نتایج
              </button>
              {confirming === item.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => remove(item.id)}
                    className="flex-1 rounded-xl bg-ruby-500 px-3 py-2.5 text-xs font-bold text-white"
                  >
                    تایید حذف
                  </button>
                  <button
                    onClick={() => setConfirming(null)}
                    className="rounded-xl border border-ivory-300 px-3 py-2.5 text-xs font-bold text-ink-500"
                  >
                    انصراف
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirming(item.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-ruby-500/30 px-4 py-2.5 text-xs font-bold text-ruby-500 transition-colors hover:bg-ruby-500/10"
                >
                  <Trash2 className="size-3.5" />
                  حذف آگهی
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
