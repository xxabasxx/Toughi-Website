import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle, BadgeCheck, Inbox } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getConversationsFor } from "@/lib/queries";
import { formatToman, timeAgoFa, cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";
export const metadata = { title: "گفتگوهای من" };

export default async function ChatsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/chats");

  const rows = await getConversationsFor(user.id);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <div className="mb-10">
        <p className="mb-2 text-xs font-bold tracking-[0.3em] text-gold-600">ارتباط امن</p>
        <h1 className="font-display flex items-center gap-3 text-4xl font-bold text-forest-950 sm:text-5xl">
          <MessageCircle className="size-9 text-gold-600" />
          گفتگوهای من
        </h1>
        <p className="mt-3 text-sm text-ink-400">
          بدون افشای شماره‌ات، مستقیم با خریدارها و فروشنده‌ها گفتگو کن.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card-luxe flex flex-col items-center gap-5 rounded-[2rem] px-8 py-20 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-forest-800/10 text-forest-700">
            <Inbox className="size-9" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold text-forest-950">هنوز گفتگویی نداری</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-ink-400">
              روی «چت با فروشنده» در هر آگهی بزن تا گفتگو اینجا اضافه شود.
            </p>
          </div>
          <Link href="/explore" className="btn-gold rounded-full px-7 py-3.5 text-sm">
            دیدن آگهی‌ها
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, i) => {
            const imBuyer = row.conversation.buyerId === user.id;
            const other = imBuyer ? row.sellerName : row.buyerName;
            const thumb = row.listingImage?.[0];
            return (
              <Reveal key={row.conversation.id} delay={Math.min(i, 4)}>
                <Link
                  href={`/chats/${row.conversation.id}`}
                  className="card-luxe flex items-center gap-4 rounded-[1.5rem] p-4"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl sm:size-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb ?? "/images/hero-pigeon.jpg"}
                      alt=""
                      className={cn("absolute inset-0 size-full object-cover", row.listingStatus === "sold" && "grayscale")}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 truncate text-sm font-bold text-forest-950">
                        {other}
                        <BadgeCheck className="size-3.5 shrink-0 text-gold-600" />
                      </p>
                      <span className="shrink-0 text-[10.5px] text-ink-400">
                        {row.lastMessageAt
                          ? timeAgoFa(row.lastMessageAt)
                          : timeAgoFa(row.conversation.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-ink-500">
                      {row.lastMessage ?? "گفتگو را شروع کن..."}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={cn(
                          "line-clamp-1 flex-1 rounded-full bg-ivory-200 px-3 py-1 text-[10.5px] text-ink-500",
                          row.listingStatus === "sold" && "opacity-60",
                        )}
                      >
                        دربارهٔ: {row.listingTitle}
                      </span>
                      <span className="font-display shrink-0 text-xs font-bold text-gold-700">
                        {formatToman(row.listingPrice)}
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
