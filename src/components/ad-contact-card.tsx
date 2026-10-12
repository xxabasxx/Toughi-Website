"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Phone,
  MessageCircle,
  ShieldAlert,
  BadgeCheck,
  Copy,
  Check,
  Share2,
  LayoutDashboard,
} from "lucide-react";
import { FavoriteButton } from "./favorite-button";
import { formatToman, toFa, cn } from "@/lib/utils";

export function AdContactCard({
  listingId,
  price,
  negotiable,
  isOwner,
  favored,
  sellerName,
  sellerShop,
  sellerVerified,
  sellerSince,
}: {
  listingId: string;
  price: number | null;
  negotiable: boolean;
  isOwner: boolean;
  favored: boolean;
  sellerName: string;
  sellerShop: string | null;
  sellerVerified: boolean;
  sellerSince: string;
}) {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const revealPhone = async () => {
    if (loading || phone) return;
    setLoading(true);
    const res = await fetch(`/api/listings/${listingId}/phone`);
    if (res.status === 401) {
      router.push(`/auth?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const data = await res.json();
    if (data.ok) setPhone(data.phone);
    setLoading(false);
  };

  const startChat = async () => {
    if (chatLoading) return;
    setChatLoading(true);
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    if (res.status === 401) {
      router.push(`/auth?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const data = await res.json();
    setChatLoading(false);
    if (data.ok) router.push(`/chats/${data.id}`);
  };

  const copyPhone = async () => {
    if (!phone) return;
    await navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch {
        /* ignore */
      }
    }
    await navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 1500);
  };

  return (
    <div className="card-luxe sticky top-28 space-y-5 rounded-[2rem] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-ink-400">قیمت پیشنهادی</p>
          <p className={cn("font-display mt-1 text-3xl font-bold", price ? "text-gradient-gold" : "text-forest-800")}>
            {formatToman(price)}
          </p>
          {negotiable && (
            <span className="mt-2 inline-block rounded-full bg-forest-800/10 px-3 py-1 text-xs font-semibold text-forest-700">
              قابل مذاکره با فروشنده
            </span>
          )}
        </div>
        <FavoriteButton listingId={listingId} initialActive={favored} size="lg" />
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-ivory-300 bg-white/80 p-3.5">
        <span className="font-display grid size-12 shrink-0 place-items-center rounded-2xl bg-forest-800 text-xl font-bold text-gold-300">
          {sellerName.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-sm font-bold text-forest-950">
            {sellerShop ?? sellerName}
            {sellerVerified && <BadgeCheck className="size-4 shrink-0 text-gold-600" />}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-ink-400">
            عضو طوقی از {sellerSince}
            {sellerShop ? ` • ${sellerName}` : ""}
          </p>
        </div>
      </div>

      {isOwner ? (
        <button
          onClick={() => router.push("/my-ads")}
          className="btn-forest flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold"
        >
          <LayoutDashboard className="size-4" />
          مدیریت این آگهی
        </button>
      ) : (
        <div className="space-y-2.5">
          {phone ? (
            <div className="flex items-center justify-between gap-2 rounded-2xl border-2 border-gold-500/50 bg-gold-500/10 px-4 py-3.5">
              <div>
                <p className="text-[10px] text-ink-400">شماره تماس فروشنده</p>
                <p className="mt-0.5 text-xl font-bold tracking-wider text-forest-900" dir="ltr">
                  {phone}
                </p>
              </div>
              <button
                onClick={copyPhone}
                aria-label="کپی شماره"
                className="grid size-10 place-items-center rounded-xl bg-white text-forest-800 shadow transition-transform active:scale-90"
              >
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              </button>
            </div>
          ) : (
            <button
              onClick={revealPhone}
              disabled={loading}
              className="btn-gold flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm"
            >
              <Phone className="size-4" />
              {loading ? "در حال دریافت..." : "نمایش شماره تماس"}
            </button>
          )}

          <button
            onClick={startChat}
            disabled={chatLoading}
            className="btn-forest flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold"
          >
            <MessageCircle className="size-4" />
            {chatLoading ? "در حال اتصال..." : "چت با فروشنده"}
          </button>
        </div>
      )}

      <button
        onClick={share}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ivory-300 py-3 text-xs font-semibold text-ink-500 transition-colors hover:border-gold-500 hover:text-gold-700"
      >
        <Share2 className="size-4" />
        {shared ? "لینک کپی شد!" : "اشتراک‌گذاری آگهی"}
      </button>

      <div className="flex items-start gap-2.5 rounded-2xl bg-clay-500/10 p-4 text-[11.5px] leading-5 text-clay-600">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        پیش از هر پرداخت، حیوان را از نزدیک ببین و برگه سلامت دامپزشک را بررسی کن. طوقی هیچ‌گونه پیش‌پرداخت
        آنلاین دریافت نمی‌کند.
      </div>

      <p className="text-center text-[10px] text-ink-400">شناسه آگهی: {toFa(listingId.slice(0, 8))}</p>
    </div>
  );
}
