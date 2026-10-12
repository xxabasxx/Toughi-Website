"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  listingId,
  initialActive = false,
  size = "md",
}: {
  listingId: string;
  initialActive?: boolean;
  size?: "md" | "lg";
}) {
  const [active, setActive] = useState(initialActive);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const prev = active;
    setActive(!prev);
    try {
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.status === 401) {
        setActive(prev);
        router.push(`/auth?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const data = await res.json();
      setActive(Boolean(data.active));
      router.refresh();
    } catch {
      setActive(prev);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={active ? "حذف از نشان‌شده‌ها" : "نشان کردن آگهی"}
      className={cn(
        "grid place-items-center rounded-full backdrop-blur transition-all duration-300 active:scale-90",
        size === "lg" ? "size-12" : "size-9",
        active
          ? "bg-clay-500 text-white shadow-lg shadow-clay-500/40"
          : "bg-white/85 text-ink-500 hover:bg-white hover:text-clay-500",
      )}
    >
      <Heart className={cn(size === "lg" ? "size-5" : "size-4", active && "fill-current")} />
    </button>
  );
}
