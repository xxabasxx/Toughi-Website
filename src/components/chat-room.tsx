"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Send, BadgeCheck, ShieldAlert, Loader2 } from "lucide-react";
import { cn, formatToman, faTime, toFa } from "@/lib/utils";

type Msg = { id: string; senderId: string; body: string; createdAt: string };
type Payload = {
  ok: boolean;
  me?: string;
  listing?: { title: string; images: string[]; price: number | null; status: string } | null;
  other?: { name: string; verified: boolean } | null;
  messages?: Msg[];
};

export function ChatRoom({ conversationId, adId }: { conversationId: string; adId?: string }) {
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const countRef = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/chats/${conversationId}/messages`, { cache: "no-store" });
      if (res.status === 401) {
        router.push("/auth?next=/chats");
        return;
      }
      const json = await res.json();
      if (!json.ok) {
        setError(true);
        return;
      }
      setData(json);
      if ((json.messages?.length ?? 0) !== countRef.current) {
        countRef.current = json.messages?.length ?? 0;
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
      }
    } catch {
      /* ignore */
    }
  }, [conversationId, router]);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft("");
    await fetch(`/api/chats/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSending(false);
    load();
  };

  if (error) {
    return (
      <div className="card-luxe mx-auto max-w-xl rounded-[2rem] p-14 text-center">
        <p className="font-display text-2xl font-bold text-forest-950">گفتگو پیدا نشد</p>
        <p className="mt-3 text-sm text-ink-400">این گفتگو وجود ندارد یا دسترسی به آن نداری.</p>
        <Link href="/chats" className="btn-forest mt-6 inline-block rounded-full px-7 py-3 text-sm">
          بازگشت به گفتگوها
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[60dvh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gold-600" />
      </div>
    );
  }

  const { listing, other, messages = [], me } = data;

  return (
    <div className="card-luxe mx-auto flex h-[78dvh] max-w-3xl flex-col overflow-hidden rounded-[2rem]">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-ivory-300/70 bg-white/70 px-5 py-3.5">
        <button
          onClick={() => router.push("/chats")}
          className="grid size-10 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ivory-200"
          aria-label="بازگشت"
        >
          <ArrowRight className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-bold text-forest-950">
            {other?.name}
            {other?.verified && <BadgeCheck className="size-4 text-gold-600" />}
          </p>
          <p className="text-[10.5px] text-ink-400">آنلاین بودن نشان داده نمی‌شود — پاسخ معمولاً ظرف چند ساعت</p>
        </div>
        {listing && adId && (
          <Link
            href={`/ad/${adId}`}
            className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-ivory-300 bg-ivory-100 p-1.5 pl-4 transition-all hover:border-gold-500"
          >
            <div className="relative size-10 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={listing.images[0] ?? "/images/hero-pigeon.jpg"} alt="" className="absolute inset-0 size-full object-cover" />
            </div>
            <div className="max-w-32">
              <p className="line-clamp-1 text-[10.5px] font-bold text-forest-900">{listing.title}</p>
              <p className="font-display text-[11px] font-bold text-gold-700">{formatToman(listing.price)}</p>
            </div>
          </Link>
        )}
      </div>

      {/* messages */}
      <div className="relative flex-1 space-y-3 overflow-y-auto bg-ivory-100/70 p-5">
        <div className="mx-auto mb-4 flex max-w-md items-center gap-2.5 rounded-2xl bg-clay-500/10 px-4 py-3 text-[11px] leading-5 text-clay-600">
          <ShieldAlert className="size-4 shrink-0" />
          شماره‌ات و مبلغ بیعانه را در چت نفرست؛ ملاقات و معامله فقط حضوری.
        </div>

        {messages.length === 0 && (
          <p className="py-10 text-center text-xs text-ink-400">
            اولین پیام را بفرست تا گفتگو آغاز شود.
          </p>
        )}

        {messages.map((m) => {
          const mine = m.senderId === me;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[78%] rounded-3xl px-4.5 py-3 text-[13.5px] leading-7 shadow-sm sm:max-w-[70%]",
                  mine
                    ? "rounded-bl-md bg-forest-800 text-ivory-100"
                    : "rounded-br-md border border-ivory-300 bg-white text-ink-900",
                )}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className={cn("mt-1 text-left text-[9.5px]", mine ? "text-ivory-100/50" : "text-ink-400")}>
                  {faTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <form onSubmit={send} className="flex items-center gap-2.5 border-t border-ivory-300/70 bg-white/80 p-3.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="پیامت را بنویس..."
          maxLength={1500}
          className="input-luxe flex-1 !rounded-full"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          aria-label="ارسال پیام"
          className="btn-gold grid size-12 shrink-0 place-items-center rounded-full disabled:opacity-40"
        >
          <Send className="size-5 -scale-x-100" />
        </button>
      </form>
    </div>
  );
}
