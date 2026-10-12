"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  ShieldCheck,
  ArrowLeft,
  UserRound,
  KeyRound,
  BadgeCheck,
  RefreshCcw,
} from "lucide-react";
import { cn, toFa } from "@/lib/utils";

type Step = "phone" | "code" | "name";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const toEn = (s: string) => s.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));

export function AuthForm({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [editingIndex, setEditingIndex] = useState<number>(0);
  const [name, setName] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (step === "code") inputs.current[0]?.focus();
  }, [step]);

  const requestCode = async () => {
    setError("");
    const normalized = toEn(phone);
    if (!/^09\d{9}$/.test(normalized)) {
      setError("شماره موبایل را کامل و صحیح وارد کن");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: normalized }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      setDevCode(data.devCode ?? null);
      if (data.sent) setDevCode(null);
      setStep("code");
      setCountdown(120);
      setCode(["", "", "", ""]);
      setEditingIndex(0);
    } else {
      setError(data.error ?? "خطایی رخ داد");
    }
  };

  const verify = async (finalName?: string) => {
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: toEn(phone), code: code.join(""), name: finalName }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok && data.needsName) {
      setStep("name");
      return;
    }
    if (data.ok) {
      router.replace(next || "/");
      router.refresh();
      return;
    }
    setError(data.error ?? "خطایی رخ داد");
  };

  const onCodeChange = (i: number, val: string) => {
    const cleaned = toEn(val).replace(/[^0-9]/g, "");
    if (!cleaned) {
      // اگر چیزی حذف شد، خانهٔ فعلی را پاک کن و به قبل برو
      const nextCode = [...code];
      nextCode[i] = "";
      setCode(nextCode);
      if (i > 0) setTimeout(() => inputs.current[i - 1]?.focus(), 0);
      return;
    }

    // مقدار جدید در این خانه: آخرین رقم وارد شده را بگیر
    const digit = cleaned.slice(-1);
    const nextCode = [...code];
    nextCode[i] = digit;
    setCode(nextCode);

    // خودکار به خانهٔ بعد برو
    if (i < 3) setTimeout(() => inputs.current[i + 1]?.focus(), 0);
  };

  const onCodeKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      // اگر خانه خالی بود، به خانه قبل برو و آن را پاک کن
      const nextCode = [...code];
      nextCode[i - 1] = "";
      setCode(nextCode);
      setTimeout(() => inputs.current[i - 1]?.focus(), 0);
    }
    if (e.key === "Backspace" && code[i]) {
      // اگر خانه پر بود، فقط پاکش کن (onChange خودش فوکوس را عوض می‌کند)
      return;
    }
    if (e.key === "ArrowRight" && i < 3) {
      e.preventDefault();
      setTimeout(() => inputs.current[i + 1]?.focus(), 0);
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      setTimeout(() => inputs.current[i - 1]?.focus(), 0);
    }
    if (e.key === "Enter" && code.every((c) => c)) verify();
  };

  const onCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = toEn(e.clipboardData.getData("text")).replace(/[^0-9]/g, "").slice(0, 4);
    if (!pasted) return;
    const nextCode = ["", "", "", ""];
    pasted.split("").forEach((d, idx) => { nextCode[idx] = d; });
    setCode(nextCode);
    setTimeout(() => inputs.current[Math.min(pasted.length, 3)]?.focus(), 0);
  };

  const fullCode = code.every((c) => c);

  return (
    <div className="w-full max-w-md">
      {step === "phone" && (
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-950">به طوقی خوش آمدی</h1>
          <p className="mt-3 text-sm leading-7 text-ink-500">
            برای خرید، فروش، چت و نشان‌کردن آگهی‌ها با شماره موبایل وارد شو یا ثبت‌نام کن.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestCode();
            }}
            className="mt-8 space-y-4"
          >
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 size-4.5 -translate-y-1/2 text-gold-600" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
                inputMode="tel"
                className="input-luxe pr-12 py-4 text-base"
                autoComplete="tel"
              />
            </div>
            {error && <p className="text-xs font-semibold text-ruby-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base"
            >
              {loading ? "در حال ارسال کد..." : "دریافت کد تایید"}
              <ArrowLeft className="size-4" />
            </button>
          </form>

          <div className="mt-7 flex items-center gap-3 rounded-2xl border border-gold-500/30 bg-gold-500/10 p-4 text-xs leading-6 text-gold-700">
            <ShieldCheck className="size-5 shrink-0" />
            برای امنیت شما، ورود در طوقی فقط با کد پیامکی انجام می‌شود؛ هیچ رمزی ذخیره نمی‌کنیم.
          </div>
        </div>
      )}

      {step === "code" && (
        <div>
          <button
            onClick={() => setStep("phone")}
            className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-ink-400 transition-colors hover:text-gold-700"
          >
            <ArrowLeft className="size-3.5 rotate-180" />
            تغییر شماره موبایل
          </button>
          <h1 className="font-display text-3xl font-bold text-forest-950">کد تایید را وارد کن</h1>
          <p className="mt-3 text-sm text-ink-500">
            کد چهاررقمی برای <span className="font-bold text-forest-900">{phone}</span> ارسال شد.
          </p>

          {devCode && (
            <div className="mt-5 flex items-center justify-between rounded-2xl border-2 border-dashed border-gold-500/50 bg-gold-500/10 px-5 py-3.5">
              <span className="text-xs font-semibold text-gold-700">نسخهٔ نمایشی — کد تایید:</span>
              <span className="text-2xl font-black tracking-[0.4em] text-forest-900" dir="ltr">
                {devCode}
              </span>
            </div>
          )}

          <div className="mt-7 flex justify-center gap-3" dir="ltr">
            {code.map((c, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                value={toFa(c)}
                onChange={(e) => onCodeChange(i, e.target.value)}
                onKeyDown={(e) => onCodeKey(i, e)}
                onPaste={onCodePaste}
                onFocus={() => setTimeout(() => inputs.current[i]?.select?.(), 0)}
                inputMode="numeric"
                maxLength={2}
                className={cn(
                  "size-16 rounded-2xl border-2 bg-white/80 text-center text-2xl font-black text-forest-950 transition-all focus:outline-none select-all",
                  c ? "border-gold-500 shadow-[0_8px_20px_-8px_rgba(201,162,75,0.6)]" : "border-ivory-300/90",
                  "focus:border-gold-500 focus:bg-white hover:border-gold-500/50",
                )}
                aria-label={`رقم ${toFa(i + 1)}`}
              />
            ))}
          </div>

          {error && <p className="mt-4 text-center text-xs font-semibold text-ruby-500">{error}</p>}

          <button
            onClick={() => verify()}
            disabled={!fullCode || loading}
            className="btn-gold mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base disabled:opacity-40"
          >
            <KeyRound className="size-4" />
            {loading ? "در حال بررسی..." : "تایید و ورود"}
          </button>

          <button
            onClick={requestCode}
            disabled={countdown > 0 || loading}
            className="mt-4 flex w-full items-center justify-center gap-2 text-xs font-semibold text-ink-400 transition-colors hover:text-gold-700 disabled:opacity-50"
          >
            <RefreshCcw className="size-3.5" />
            {countdown > 0 ? `ارسال مجدد کد تا ${toFa(countdown)} ثانیه دیگر` : "ارسال مجدد کد"}
          </button>
        </div>
      )}

      {step === "name" && (
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-950">یک قدم مانده!</h1>
          <p className="mt-3 text-sm leading-7 text-ink-500">
            اولین ورودت در طوقیست. نامی که خریدارها می‌بینند را بنویس — می‌توانی نام فروشگاهت را هم بعداً
            اضافه کنی.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim().length < 2) {
                setError("نام باید حداقل ۲ حرف باشد");
                return;
              }
              verify(name.trim());
            }}
            className="mt-8 space-y-4"
          >
            <div className="relative">
              <UserRound className="absolute right-4 top-1/2 size-4.5 -translate-y-1/2 text-gold-600" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام و نام خانوادگی یا نام فروشگاه"
                className="input-luxe pr-12 py-4 text-base"
              />
            </div>
            {error && <p className="text-xs font-semibold text-ruby-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base"
            >
              <BadgeCheck className="size-5" />
              {loading ? "در حال ساخت حساب..." : "شروع استفاده از طوقی"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
