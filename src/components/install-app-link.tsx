"use client";

import { useState, useEffect } from "react";
import { X, Share, SquareArrowUp, Plus, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export function InstallAppLink({ className }: { className?: string }) {
  const [showGuide, setShowGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const click = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      deferredPrompt = null;
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <a
        href="#"
        onClick={click}
        className={cn("flex items-center gap-2 transition-colors hover:text-gold-300", className)}
      >
        <Smartphone className="size-3.5 text-gold-500" />
        {installed ? "اپلیکیشن نصب شد ✓" : "دریافت اپلیکیشن طوقی"}
      </a>

      {showGuide && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-forest-950/70 backdrop-blur-sm sm:items-center"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="card-luxe m-4 w-full max-w-sm rounded-[1.75rem] p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display flex items-center gap-2 text-xl font-bold text-forest-950">
                <Smartphone className="size-5 text-gold-600" />
                نصب اپلیکیشن طوقی
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                aria-label="بستن"
                className="grid size-8 place-items-center rounded-full text-ink-400 hover:bg-ivory-200"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 space-y-4 text-[13px] leading-7 text-ink-700">
              <div className="rounded-2xl bg-ivory-200/80 p-4">
                <p className="font-bold text-forest-900">در اندروید (کروم):</p>
                <p className="mt-1 text-ink-500">روی منوی ⋮ بزن و «Install app» یا «Add to Home screen» را انتخاب کن.</p>
              </div>
              <div className="rounded-2xl bg-ivory-200/80 p-4">
                <p className="font-bold text-forest-900">در آیفون (سافاری):</p>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-ink-500">
                  دکمهٔ
                  <SquareArrowUp className="size-4 text-gold-600" />
                  Share و سپس
                  <span className="flex items-center gap-1 rounded-lg bg-white px-2 py-0.5 text-xs font-bold">
                    <Plus className="size-3.5" /> Add to Home Screen
                  </span>
                  را بزن.
                </p>
              </div>
              <p className="flex items-start gap-2 text-xs text-ink-400">
                <Share className="mt-0.5 size-4 shrink-0 text-gold-600" />
                بعد از نصب، طوقی مثل یک اپ واقعی اجرا می‌شود و صفحاتی که بازدید کردی بدون اینترنت
                هم باز می‌شوند.
              </p>
            </div>
          </div>
        </div>
      )}
    </ >
  );
}
