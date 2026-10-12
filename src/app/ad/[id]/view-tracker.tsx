"use client";

import { useEffect } from "react";

export function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    const key = `viewed:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    fetch(`/api/listings/${id}/view`, { method: "POST" }).catch(() => {});
  }, [id]);
  return null;
}
