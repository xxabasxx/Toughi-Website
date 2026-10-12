"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Map, Plus, Heart, MessageCircle, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNavbar({ authed }: { authed: boolean }) {
  const pathname = usePathname();

  const isActive = (hrefs: string[]) => hrefs.some((h) => pathname === h || pathname.startsWith(h));
  const hide = pathname === "/auth" || pathname.startsWith("/chats/");

  if (hide) return null;

  const item = "flex flex-1 flex-col items-center gap-1 pt-2 pb-1 text-[10px] font-medium transition-colors";
  const iconCls = "size-[22px] transition-transform duration-300";

  return (
    <nav
      className="glass-light fixed inset-x-0 bottom-0 z-50 block border-t-2 border-gold-500/40 shadow-[0_-14px_40px_-14px_rgba(20,25,10,0.5)] lg:hidden"
      aria-label="ناوبری موبایل"
    >
      <div className="mx-auto flex max-w-md items-end justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        {/* خانه */}
        <Link href="/" className={cn(item, pathname === "/" ? "text-forest-800" : "text-ink-400 hover:text-forest-700")}>
          <House className={iconCls} strokeWidth={pathname === "/" ? 2.4 : 1.9} />
          خانه
        </Link>

        {/* آگهی‌ها */}
        <Link
          href="/explore"
          className={cn(item, isActive(["/explore", "/ad"]) && pathname !== "/new" ? "text-forest-800" : "text-ink-400 hover:text-forest-700")}
        >
          <Map className={iconCls} strokeWidth={isActive(["/explore", "/ad"]) && pathname !== "/new" ? 2.4 : 1.9} />
          آگهی‌ها
        </Link>

        {/* ثبت آگهی — دکمه وسط بزرگ */}
        <Link href={authed ? "/new" : "/auth?next=/new"} className="relative flex flex-1 justify-center" aria-label="ثبت آگهی جدید">
          <span className="btn-gold absolute -top-8 grid size-[60px] place-items-center rounded-full shadow-[0_14px_36px_-8px_rgba(201,162,75,0.9)] ring-4 ring-ivory-100 transition-transform duration-300 active:scale-95">
            <Plus className="size-7" strokeWidth={2.6} />
          </span>
          <span className="pb-1 pt-7 text-[10px] font-bold text-forest-900">ثبت آگهی</span>
        </Link>

        {/* نشان‌شده‌ها */}
        <Link
          href={authed ? "/favorites" : "/auth?next=/favorites"}
          className={cn(item, pathname === "/favorites" || pathname.startsWith("/favorites") ? "text-forest-800" : "text-ink-400 hover:text-forest-700")}
        >
          <Heart className={iconCls} strokeWidth={pathname === "/favorites" || pathname.startsWith("/favorites") ? 2.4 : 1.9} />
          نشان‌شده‌ها
        </Link>

        {/* گفتگو / ورود */}
        <Link
          href={authed ? "/chats" : "/auth"}
          className={cn(item, pathname === "/chats" || pathname.startsWith("/chats") ? "text-forest-800" : "text-ink-400 hover:text-forest-700")}
        >
          {authed ? (
            <MessageCircle className={iconCls} strokeWidth={pathname === "/chats" || pathname.startsWith("/chats") ? 2.4 : 1.9} />
          ) : (
            <LogIn className={iconCls} strokeWidth={1.9} />
          )}
          {authed ? "گفتگو" : "ورود"}
        </Link>
      </div>
    </nav>
  );
}
