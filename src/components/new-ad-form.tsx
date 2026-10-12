"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Feather,
  PawPrint,
  PackageOpen,
  ImagePlus,
  Trash2,
  Crown,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Link2,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { cn, faNum, formatToman, toFa, parsePriceFa } from "@/lib/utils";
import { getCategoryIcon } from "./category-icon";

type Cat = { id: number; name: string; slug: string; kind: string; icon: string };
type City = { id: number; name: string };

const KINDS = [
  { key: "birds", label: "پرندگان", icon: Feather },
  { key: "pets", label: "حیوانات خانگی", icon: PawPrint },
  { key: "gear", label: "قفس و تجهیزات", icon: PackageOpen },
];

const STEPS = ["دسته‌بندی", "مشخصات", "عکس‌ها", "توضیحات و انتشار"];

const STEP_TIPS: Record<number, string[]> = {
  0: ["دسته‌بندی دقیق یعنی آگهی‌ات به خریدار درست نشان داده می‌شود.", "طوطی‌های بزرگ مثل ماکاو و کاسکو زیرمجموعهٔ جدا دارند."],
  1: ["عنوان کوتاه و گویا بنویس: گونه + ویژگی مهم + سن.", "قیمت منصفانه سرعت فروش را تا ۳ برابر بیشتر می‌کند.", "با تکمیل مشخصات، آگهی‌ات حرفه‌ای‌تر و قابل اعتمادتر دیده می‌شود."],
  2: ["نور طبیعی و پس‌زمینهٔ ساده — همین! پرنده را سرتاسری در کادر بگیر.", "عکس اول، جلد آگهی‌ات است؛ بهترین زاویه را بگذار.", "تا ۸ عکس می‌توانی همراه توضیح هر عکس ثبت کنی."],
  3: ["سابقه، علت فروش، رژیم غذایی و شرایط نگهداری را بنویس.", "قوانین معامله‌ات (حضوری/ارسال) را شفاف ذکر کن.", "شماره تماس در توضیحات نگذار؛ چت داخلی امن‌تر است."],
};

export function NewAdForm({ categories, cities, meName }: { categories: Cat[]; cities: City[]; meName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState("birds");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [cityId, setCityId] = useState<number | null>(null);
  const [priceText, setPriceText] = useState("");
  const [isAgreement, setIsAgreement] = useState(false);
  const [negotiable, setNegotiable] = useState(false);
  const [attrs, setAttrs] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const kindOfSelected = categories.find((c) => c.id === categoryId)?.kind ?? kind;
  const catsOfKind = useMemo(() => categories.filter((c) => c.kind === kind), [categories, kind]);

  const price = isAgreement ? null : parsePriceFa(priceText);
  const selectedCat = categories.find((c) => c.id === categoryId);

  const canNext =
    step === 0
      ? categoryId !== null
      : step === 1
        ? title.trim().length >= 5 && cityId !== null && (isAgreement || (price !== null && price > 0))
        : step === 2
          ? images.length >= 1
          : description.trim().length >= 20;

  const attrFields = useMemo(() => {
    if (kindOfSelected === "gear") {
      return [
        { key: "برند", placeholder: "مثلاً: بلوپت، PES، هوم‌پت" },
        { key: "وضعیت کالا", select: ["نو — آکبند", "در حد نو", "کارکرده — سالم"] },
        { key: "ابعاد / ظرفیت", placeholder: "مثلاً: ۸۰×۴۵×۴۵ سانتی‌متر" },
      ];
    }
    return [
      { key: "سن", placeholder: "مثلاً: ۸ ماهه / ۲ ساله / جوجه ۵۰ روزه" },
      { key: "جنسیت", select: ["نر", "ماده", "جفت", "نامشخص"] },
      { key: "گونه / نژاد", placeholder: "مثلاً: بلو اند گلد، پرشین دونه‌ای" },
      { key: "دست‌رام / اهلی", select: ["بله — کاملاً دست‌رام", "تا حدی", "خیر — قفسی"] },
      { key: "واکسیناسیون", select: ["کامل — با برگه", "بخشی انجام شده", "انجام نشده"] },
      { key: "غذا / رژیم", placeholder: "مثلاً: میکس توت‌دانه، مکمل پلت" },
    ];
  }, [kindOfSelected]);

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    const form = new FormData();
    Array.from(files)
      .slice(0, 8 - images.length)
      .forEach((f) => form.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (data.ok) setImages((imgs) => [...imgs, ...data.urls]);
    else setError(data.error ?? "خطا در آپلود");
    if (fileRef.current) fileRef.current.value = "";
  };

  const addUrl = () => {
    const u = urlInput.trim();
    if (!/^https?:\/\//.test(u)) {
      setError("لینک عکس باید با http شروع شود");
      return;
    }
    if (images.length >= 8) {
      setError("حداکثر ۸ عکس مجاز است");
      return;
    }
    setImages((imgs) => [...imgs, u]);
    setUrlInput("");
    setError("");
  };

  const submit = async () => {
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        price,
        negotiable,
        categoryId,
        cityId,
        images,
        attributes: attrs,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.ok) {
      router.push("/my-ads?created=1");
      router.refresh();
    } else {
      setError(data.error ?? "خطایی رخ داد؛ دوباره تلاش کن");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="card-luxe overflow-hidden rounded-[2rem]">
        {/* stepper */}
        <div className="border-b border-ivory-300/70 bg-white/60 px-6 py-5 sm:px-9">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-full text-sm font-bold transition-all duration-500",
                      i < step && "bg-gold-500 text-forest-950",
                      i === step && "bg-forest-800 text-gold-200 shadow-lg shadow-forest-800/30",
                      i > step && "bg-ivory-200 text-ink-400",
                    )}
                  >
                    {i < step ? <Check className="size-4" /> : toFa(i + 1)}
                  </span>
                  <span
                    className={cn(
                      "hidden text-[10.5px] font-semibold sm:block",
                      i === step ? "text-forest-800" : "text-ink-400",
                    )}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="relative mx-2 -mt-5 h-0.5 flex-1 overflow-hidden rounded-full bg-ivory-300">
                    <div
                      className="absolute right-0 top-0 h-full bg-gradient-to-l from-gold-600 to-gold-400 transition-all duration-700"
                      style={{ width: i < step ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-9">
          {/* STEP 0 — category */}
          {step === 0 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-forest-950">چه چیزی می‌خواهی عرضه کنی؟</h2>
              <p className="mt-2 text-sm text-ink-400">اول نوع آگهی و بعد دسته‌بندی دقیق آن را انتخاب کن.</p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {KINDS.map((k) => (
                  <button
                    key={k.key}
                    onClick={() => setKind(k.key)}
                    className={cn(
                      "flex flex-col items-center gap-2.5 rounded-2xl border-2 py-5 transition-all",
                      kind === k.key
                        ? "border-gold-500 bg-gold-500/10 text-forest-800"
                        : "border-ivory-300 bg-white/70 text-ink-400 hover:border-gold-500/50",
                    )}
                  >
                    <k.icon className="size-6" />
                    <span className="text-xs font-bold sm:text-sm">{k.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {catsOfKind.map((c) => {
                  const Icon = getCategoryIcon(c.icon);
                  const active = categoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCategoryId(c.id)}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-right transition-all",
                        active
                          ? "border-gold-500 bg-forest-800 text-gold-200 shadow-lg"
                          : "border-ivory-300 bg-white/70 text-ink-700 hover:border-gold-500/60",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                          active ? "bg-gold-500 text-forest-950" : "bg-ivory-200 text-forest-700 group-hover:bg-gold-500/30",
                        )}
                      >
                        <Icon className="size-4.5" />
                      </span>
                      <span className="text-[13px] font-bold leading-5">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 1 — details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-forest-950">مشخصات آگهی</h2>
                <p className="mt-2 text-sm text-ink-400">
                  دستهٔ انتخاب‌شده:{" "}
                  <span className="font-bold text-gold-700">{selectedCat?.name}</span>
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-ink-500">عنوان آگهی *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: طوطی ماکاو آبی و طلایی دستی ۸ ماهه، حلقه‌دار"
                  maxLength={160}
                  className="input-luxe"
                />
                <p className="mt-1.5 text-left text-[10px] text-ink-400">{toFa(title.length)} / {toFa(160)}</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-ink-500">شهر *</label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                    <select
                      value={cityId ?? ""}
                      onChange={(e) => setCityId(Number(e.target.value))}
                      className="input-luxe appearance-none pr-11"
                    >
                      <option value="" disabled>
                        انتخاب شهر
                      </option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-ink-500">قیمت (تومان) *</label>
                  <input
                    value={toFa(priceText)}
                    onChange={(e) => {
                      const n = parsePriceFa(e.target.value);
                      setPriceText(n === null ? "" : String(n));
                    }}
                    disabled={isAgreement}
                    placeholder="مثلاً: ۴۵٬۰۰۰٬۰۰۰"
                    inputMode="numeric"
                    className={cn("input-luxe", isAgreement && "opacity-40")}
                    dir="ltr"
                    style={{ textAlign: "right" }}
                  />
                  {price !== null && price > 0 && (
                    <p className="mt-1.5 font-display text-sm font-bold text-gold-700">{formatToman(price)}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => {
                    setIsAgreement(!isAgreement);
                    if (!isAgreement) setNegotiable(false);
                  }}
                  className={cn(
                    "rounded-full border-2 px-4 py-2 text-xs font-bold transition-all",
                    isAgreement ? "border-gold-500 bg-gold-500/15 text-forest-800" : "border-ivory-300 text-ink-400 hover:border-gold-500/60",
                  )}
                >
                  قیمت: توافقی
                </button>
                {!isAgreement && (
                  <button
                    onClick={() => setNegotiable(!negotiable)}
                    className={cn(
                      "rounded-full border-2 px-4 py-2 text-xs font-bold transition-all",
                      negotiable ? "border-gold-500 bg-gold-500/15 text-forest-800" : "border-ivory-300 text-ink-400 hover:border-gold-500/60",
                    )}
                  >
                    قابل مذاکره
                  </button>
                )}
              </div>

              <div className="grid gap-4 border-t border-ivory-300/70 pt-6 sm:grid-cols-2">
                {attrFields.map((f) => (
                  <div key={f.key}>
                    <label className="mb-2 block text-xs font-bold text-ink-500">{f.key}</label>
                    {f.select ? (
                      <select
                        value={attrs[f.key] ?? ""}
                        onChange={(e) => setAttrs((a) => ({ ...a, [f.key]: e.target.value }))}
                        className="input-luxe appearance-none"
                      >
                        <option value="">انتخاب کن</option>
                        {f.select.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={attrs[f.key] ?? ""}
                        onChange={(e) => setAttrs((a) => ({ ...a, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="input-luxe"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — images */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-forest-950">عکس‌های آگهی</h2>
              <p className="mt-2 text-sm text-ink-400">
                حداقل ۱ و حداکثر ۸ عکس. عکس اول به‌عنوان جلد آگهی نمایش داده می‌شود.
              </p>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="hidden"
                onChange={(e) => uploadFiles(e.target.files)}
              />

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || images.length >= 8}
                  className="flex aspect-square flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-gold-500/60 bg-gold-500/5 text-gold-700 transition-all hover:bg-gold-500/15 disabled:opacity-40"
                >
                  {uploading ? <Loader2 className="size-7 animate-spin" /> : <ImagePlus className="size-7" />}
                  <span className="text-xs font-bold">{uploading ? "در حال آپلود..." : "آپلود عکس"}</span>
                </button>

                {images.map((src, i) => (
                  <div key={src + i} className="group relative aspect-square overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`عکس ${toFa(i + 1)}`} className="size-full object-cover" />
                    {i === 0 && (
                      <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-bold text-forest-950">
                        <Crown className="size-3" /> جلد
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {i > 0 && (
                        <button
                          onClick={() =>
                            setImages((arr) => {
                              const next = [...arr];
                              const [x] = next.splice(i, 1);
                              next.unshift(x);
                              return next;
                            })
                          }
                          className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-forest-900"
                        >
                          جلد شود
                        </button>
                      )}
                      <button
                        onClick={() => setImages((arr) => arr.filter((_, j) => j !== i))}
                        aria-label="حذف عکس"
                        className="grid size-7 place-items-center rounded-full bg-ruby-500 text-white"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="یا لینک مستقیم عکس را اینجا بگذار (https://...)"
                    className="input-luxe pr-11 !text-xs"
                    dir="ltr"
                    style={{ textAlign: "left" }}
                  />
                </div>
                <button onClick={addUrl} className="btn-forest rounded-xl px-5 py-3 text-xs font-bold">
                  افزودن لینک
                </button>
              </div>
              <p className="mt-2 text-[10.5px] text-ink-400">{toFa(images.length)} از {toFa(8)} عکس</p>
            </div>
          )}

          {/* STEP 3 — description & preview */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-forest-950">توضیحات کامل آگهی</h2>
              <p className="mt-2 text-sm text-ink-400">هرچه صادقانه‌تر و کامل‌تر بنویسی، زودتر به فروش می‌رسی.</p>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                maxLength={3000}
                placeholder={`مثلاً:\nطوطی ماکاو بلو اند گلد دستی، متولد آبان ۱۴۰۳ است. کاملاً دست‌رام و به صدا عادت‌کرده؛ حلقه پا و برگه تولد دارد. با میکس اعلای توت‌دانه و مکمل پلت تغذیه می‌شود. علت واگذاری کمبود وقت است. تحویل فقط حضوری در تهران و بازدید کاملاً آزاد.`}
                className="input-luxe mt-6 !rounded-3xl leading-8"
              />
              <p className="mt-1.5 text-left text-[10px] text-ink-400">{faNum(description.length)} / {faNum(3000)}</p>

              {/* preview */}
              <div className="mt-7 rounded-3xl border-2 border-dashed border-gold-500/50 bg-gold-500/5 p-5">
                <p className="mb-3 flex items-center gap-2 text-xs font-bold text-gold-700">
                  <Sparkles className="size-4" />
                  پیش‌نمایش کارت آگهی تو
                </p>
                <div className="card-luxe flex max-w-sm overflow-hidden rounded-2xl">
                  <div className="relative w-32 shrink-0">
                    {images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={images[0]} alt="" className="absolute inset-0 size-full object-cover" />
                    ) : (
                      <div className="grid h-32 place-items-center bg-forest-900 text-gold-500/40">
                        <ImagePlus className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 p-3.5">
                    <p className="line-clamp-2 text-[13px] font-bold leading-6 text-forest-950">
                      {title || "عنوان آگهی تو"}
                    </p>
                    <p className="mt-1 text-[10.5px] text-ink-400">
                      {cities.find((c) => c.id === cityId)?.name ?? "شهر"} • لحظاتی پیش • {meName}
                    </p>
                    <p className="font-display mt-2 text-base font-bold text-gold-700">
                      {isAgreement ? "توافقی" : formatToman(price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-xl bg-ruby-500/10 px-4 py-3 text-xs font-bold text-ruby-500">{error}</p>
          )}

          {/* nav */}
          <div className="mt-9 flex items-center justify-between border-t border-ivory-300/70 pt-6">
            <button
              onClick={() => (step === 0 ? router.push("/") : setStep(step - 1))}
              className="flex items-center gap-1.5 rounded-full border border-ivory-300 px-5 py-3 text-xs font-bold text-ink-500 transition-colors hover:border-gold-500 hover:text-gold-700"
            >
              <ChevronRight className="size-4" />
              {step === 0 ? "انصراف" : "مرحله قبل"}
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext}
                className="btn-gold flex items-center gap-1.5 rounded-full px-7 py-3.5 text-sm disabled:opacity-40"
              >
                مرحله بعد
                <ChevronLeft className="size-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!canNext || submitting}
                className="btn-gold flex items-center gap-2 rounded-full px-7 py-3.5 text-sm disabled:opacity-40"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? "در حال انتشار..." : "انتشار آگهی"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* tips side */}
      <aside className="h-fit space-y-5 lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-[1.75rem] bg-forest-950 p-6 text-ivory-100">
          <div className="grain absolute inset-0" />
          <p className="relative mb-4 flex items-center gap-2 text-sm font-bold text-gold-300">
            <Lightbulb className="size-4" />
            نکته‌های طلایی — {STEPS[step]}
          </p>
          <ul className="relative space-y-3.5 text-[12.5px] leading-6 text-ivory-100/70">
            {STEP_TIPS[step].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-luxe rounded-[1.75rem] p-6 text-center text-xs leading-6 text-ink-400">
          ثبت آگهی در طوقی <span className="font-bold text-forest-800">کاملاً رایگان</span> است و پس از
          بررسی خودکار، بلافاصله نمایش داده می‌شود.
        </div>
      </aside>
    </div>
  );
}
