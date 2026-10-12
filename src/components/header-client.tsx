"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Heart,
  MessageCircle,
  UserRound,
  Menu,
  X,
  LogOut,
  LayoutGrid,
  BadgeCheck,
  ChevronDown,
  Settings2,
  Feather,
  PawPrint,
  PackageOpen,
  Sparkles,
} from "lucide-react";
import { Logo } from "./logo";
import { InstallAppLink } from "./install-app-link";
import { cn } from "@/lib/utils";

type CatItem = { name: string; slug: string; kind: string; icon: string };
type UserLite = { name: string; verified: boolean; shop: string | null; isAdmin?: boolean };

const KINDS = [
  { key: "birds", label: "پرندگان", icon: Feather, href: "/explore?kind=birds" },
  { key: "pets", label: "حیوانات خانگی", icon: PawPrint, href: "/explore?kind=pets" },
  { key: "gear", label: "قفس و تجهیزات", icon: PackageOpen, href: "/explore?kind=gear" },
];

export function HeaderClient({ user, categories }: { user: UserLite | null; categories: CatItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const catsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
    setCatsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) setCatsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserOpen(false);
    router.refresh();
  };

  const linkCls = (active: boolean) =>
    cn(
      "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
      active ? "text-forest-800" : "text-ink-500 hover:text-forest-800",
    );

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
        <header className="glass-light pointer-events-auto flex w-full max-w-7xl items-center gap-2 rounded-full py-2.5 pl-3 pr-4 shadow-[0_18px_40px_-24px_rgba(20,25,10,0.45)]">
          <Link href="/" aria-label="طوقی — صفحه اصلی" className="shrink-0">
            <Logo />
          </Link>

          <nav className="mx-auto hidden items-center gap-1 lg:flex">
            <Link href="/" className={linkCls(pathname === "/")}>
              خانه
            </Link>
            <Link href="/explore" className={linkCls(pathname === "/explore")}>
              همه آگهی‌ها
            </Link>

            <div className="relative" ref={catsRef}>
              <button
                onClick={() => setCatsOpen((v) => !v)}
                onMouseEnter={() => setCatsOpen(true)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  catsOpen ? "text-forest-800" : "text-ink-500 hover:text-forest-800",
                )}
              >
                دسته‌بندی‌ها
                <ChevronDown className={cn("size-3.5 transition-transform duration-300", catsOpen && "rotate-180")} />
              </button>

              <div
                onMouseLeave={() => setCatsOpen(false)}
                className={cn(
                  "absolute right-0 top-full w-[620px] origin-top pt-4 transition-all duration-300",
                  catsOpen ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-2",
                )}
              >
                <div className="card-luxe overflow-hidden rounded-3xl p-6">
                  <div className="grid grid-cols-3 gap-5">
                    {KINDS.map((k) => (
                      <div key={k.key}>
                        <Link
                          href={k.href}
                          className="mb-3 flex items-center gap-2 text-sm font-bold text-forest-800"
                        >
                          <span className="grid size-8 place-items-center rounded-xl bg-forest-800 text-gold-300">
                            <k.icon className="size-4" />
                          </span>
                          {k.label}
                        </Link>
                        <ul className="space-y-1.5 border-r-2 border-gold-500/30 pr-3">
                          {categories
                            .filter((c) => c.kind === k.key)
                            .slice(0, 6)
                            .map((c) => (
                              <li key={c.slug}>
                                <Link
                                  href={`/explore?category=${c.slug}`}
                                  className="text-[13px] text-ink-500 transition-colors hover:text-gold-600"
                                >
                                  {c.name}
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-forest-950 px-4 py-3">
                    <span className="flex items-center gap-2 text-xs text-gold-300">
                      <Sparkles className="size-4" />
                      فروشندگان احرازشده با نماد طلایی
                    </span>
                    <Link href="/explore?sort=featured" className="text-xs font-bold text-ivory-100 hover:text-gold-300">
                      مشاهده آگهی‌های نشان‌دار ←
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {KINDS.map((k) => (
              <Link key={k.key} href={k.href} className={linkCls(false)}>
                {k.label}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex shrink-0 items-center gap-1.5 lg:ms-0">
            {user && (
              <>
                <Link
                  href="/favorites"
                  className="hidden size-10 place-items-center rounded-full text-ink-500 transition-colors hover:bg-ivory-200 hover:text-clay-500 sm:grid"
                  aria-label="نشان‌شده‌ها"
                >
                  <Heart className="size-[18px]" />
                </Link>
                <Link
                  href="/chats"
                  className="hidden size-10 place-items-center rounded-full text-ink-500 transition-colors hover:bg-ivory-200 hover:text-forest-700 sm:grid"
                  aria-label="گفتگوها"
                >
                  <MessageCircle className="size-[18px]" />
                </Link>
              </>
            )}

            <Link
              href={user ? "/new" : "/auth?next=/new"}
              className="btn-gold hidden items-center gap-1.5 rounded-full px-5 py-2.5 text-sm md:inline-flex"
            >
              <Plus className="size-4" />
              ثبت آگهی
            </Link>

            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-ivory-300 bg-white/70 py-1.5 pl-3 pr-1.5 text-sm font-semibold text-forest-900 transition-colors hover:border-gold-500"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-forest-800 text-xs text-gold-300">
                    <UserRound className="size-4" />
                  </span>
                  <span className="hidden max-w-24 truncate sm:block">{user.name}</span>
                </button>
                <div
                  className={cn(
                    "absolute left-0 top-full w-60 origin-top-left pt-3 transition-all duration-300",
                    userOpen ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-2",
                  )}
                >
                  <div className="card-luxe overflow-hidden rounded-2xl p-2">
                    <div className="mb-1 flex items-center gap-2 rounded-xl bg-ivory-200/80 px-3 py-2.5">
                      <span className="text-sm font-bold text-forest-900">{user.name}</span>
                      {user.verified && <BadgeCheck className="size-4 text-gold-600" />}
                    </div>
                    {[
                      { href: "/my-ads", label: "آگهی‌های من", icon: LayoutGrid },
                      { href: "/favorites", label: "نشان‌شده‌ها", icon: Heart },
                      { href: "/chats", label: "گفتگوهای من", icon: MessageCircle },
                      ...(user.isAdmin ? [{ href: "/admin", label: "پنل مدیریت", icon: Settings2 }] : []),
                    ].map((i) => (
                      <Link
                        key={i.href}
                        href={i.href}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-ivory-200"
                      >
                        <i.icon className="size-4 text-forest-700" />
                        {i.label}
                      </Link>
                    ))}
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ruby-500 transition-colors hover:bg-ruby-500/10"
                    >
                      <LogOut className="size-4" />
                      خروج از حساب
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className="btn-forest hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold sm:inline-flex"
              >
                <UserRound className="size-4" />
                ورود | ثبت‌نام
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(true)}
              className="grid size-10 place-items-center rounded-full text-forest-900 transition-colors hover:bg-ivory-200 lg:hidden"
              aria-label="باز کردن منو"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </header>
      </div>

      <div className="h-[76px] sm:h-[84px]" aria-hidden />

      <div
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-forest-950 text-ivory-100 transition-all duration-500 lg:hidden",
          menuOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div className="grain absolute inset-0" />
        <div className="relative flex items-center justify-between px-6 py-5">
          <Logo light />
          <button
            onClick={() => setMenuOpen(false)}
            className="grid size-11 place-items-center rounded-full border border-gold-500/30 text-gold-300"
            aria-label="بستن منو"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="relative flex flex-col gap-1 px-8 pt-4">
          {[
            { href: "/", label: "خانه" },
            { href: "/explore", label: "همه آگهی‌ها" },
            { href: "/explore?kind=birds", label: "پرندگان" },
            { href: "/explore?kind=pets", label: "حیوانات خانگی" },
            { href: "/explore?kind=gear", label: "قفس و تجهیزات" },
            { href: "/favorites", label: "نشان‌شده‌ها" },
            { href: "/chats", label: "گفتگوها" },
            { href: "/my-ads", label: "آگهی‌های من" },
          ].map((l, i) => (
            <Link
              key={l.href + i}
              href={l.href}
              className={cn(
                "font-display border-b border-ivory-100/10 py-3.5 text-2xl font-semibold transition-all duration-500",
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
              style={{ transitionDelay: `${80 + i * 45}ms` }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="relative mt-auto flex flex-col gap-3 p-8">
          <Link href={user ? "/new" : "/auth?next=/new"} className="btn-gold rounded-full py-3.5 text-center text-base">
            + ثبت آگهی رایگان
          </Link>
          {!user && (
            <Link href="/auth" className="rounded-full border border-gold-500/40 py-3.5 text-center text-base text-gold-300">
              ورود | ثبت‌نام
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
