"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminGetSettings, adminSaveSetting } from "@/lib/admin-actions";
import { AdminField, AdminImagePicker, AdminSubmitButton, AdminText, AdminTextArea } from "./admin-inputs";
import { BlockListEditor } from "./block-list-editor";
import { ListingsEditor } from "./listings-editor";
import {
  LayoutDashboard,
  Settings2,
  MessageSquare,
  ShieldCheck,
  Eye,
  RefreshCcw,
  Loader2,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "settings", label: "تنظیمات سایت", icon: Settings2 },
  { key: "listings", label: "ویرایش آگهی‌ها", icon: Images },
  { key: "hero", label: "هیرو و مارکی", icon: LayoutDashboard },
  { key: "why", label: "چرا طوقی + CTA", icon: ShieldCheck },
  { key: "footer", label: "فوتر", icon: MessageSquare },
  { key: "guide", label: "راهنما", icon: Eye },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const SETTING_DEFS: {
  key: string;
  label: string;
  hint?: string;
  kind: "text" | "textarea" | "image" | "number" | "select";
  options?: { value: string; label: string }[];
}[] = [
  { key: "site.title", label: "عنوان سایت", hint: "مثلاً: طوقی | بازار لاکچری پرندگان و حیوانات خانگی", kind: "text" },
  { key: "site.description", label: "توضیحات سایت (سئو)", kind: "textarea" },
  { key: "home.hero_title", label: "عنوان بزرگ صفحه اصلی", kind: "textarea" },
  { key: "home.hero_subtitle", label: "زیرعنوان صفحه اصلی", kind: "textarea" },
  { key: "home.hero_image", label: "عکس هیرو", kind: "image" },
  { key: "home.hero_badge", label: "متن بج بالای عنوان", kind: "text" },
  { key: "home.hero_chips", label: "جستجوهای سریع هیرو", hint: "هر آیتم: برچسب:لینک — آیتم‌ها با | جدا شوند", kind: "textarea" },
  { key: "home.show_hero_float_cards", label: "نمایش کارت‌های شناور کنار هیرو", kind: "select", options: [
    { value: "1", label: "نمایش" },
    { value: "0", label: "پنهان" },
  ]},
  { key: "home.show_marquee", label: "نمایش نوار متحرک", kind: "select", options: [
    { value: "1", label: "نمایش" },
    { value: "0", label: "پنهان" },
  ]},
  { key: "home.show_categories", label: "نمایش دسته‌بندی‌های صفحه اصلی", kind: "select", options: [
    { value: "1", label: "نمایش" },
    { value: "0", label: "پنهان" },
  ]},
  { key: "home.show_featured", label: "نمایش آگهی‌های نشان‌دار", kind: "select", options: [
    { value: "1", label: "نمایش" },
    { value: "0", label: "پنهان" },
  ]},
  { key: "home.show_latest", label: "نمایش جدیدترین آگهی‌ها", kind: "select", options: [
    { value: "1", label: "نمایش" },
    { value: "0", label: "پنهان" },
  ]},
  { key: "home.show_why", label: "نمایش بخش «چرا طوقی؟»", kind: "select", options: [
    { value: "1", label: "نمایش" },
    { value: "0", label: "پنهان" },
  ]},
  { key: "home.show_cta", label: "نمایش باکس ثبت آگهی", kind: "select", options: [
    { value: "1", label: "نمایش" },
    { value: "0", label: "پنهان" },
  ]},
  { key: "footer.about", label: "متن دربارهٔ طوقی در فوتر", kind: "textarea" },
  { key: "footer.tagline", label: "جمله کوتاه زیر فوتر", kind: "text" },
  { key: "footer.phone", label: "تلفن پشتیبانی", kind: "text" },
  { key: "footer.email", label: "ایمیل پشتیبانی", kind: "text" },
  { key: "guide.golden_rule", label: "قانون طلایی راهنما", kind: "textarea" },
  { key: "admin.cta_text", label: "متن دکمه استقرار در پنل مدیریت", hint: "نمایش به مدیر برای لینک به پیج استقرار", kind: "text" },
];

export function AdminShell() {
  const router = useRouter();
  const [active, setActive] = useState<TabKey>("settings");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    const s = await adminGetSettings();
    setSettings(s);
    setDraft(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async (key: string) => {
    setSavingKey(key);
    const value = draft[key] ?? settings[key] ?? "";
    await adminSaveSetting(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSavingKey(null);
    router.refresh();
  };

  const settingDef = (key: string) => SETTING_DEFS.find((d) => d.key === key);

  const renderSetting = (def: (typeof SETTING_DEFS)[number]) => {
    const val = draft[def.key] ?? settings[def.key] ?? "";
    const dirty = (draft[def.key] ?? "") !== (settings[def.key] ?? "");
    return (
      <div key={def.key} className="card-luxe rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {def.kind === "text" && (
              <AdminText label={def.label} hint={def.hint} value={val} onChange={(v) => setDraft((d) => ({ ...d, [def.key]: v }))} />
            )}
            {def.kind === "textarea" && (
              <AdminTextArea label={def.label} hint={def.hint} value={val} onChange={(v) => setDraft((d) => ({ ...d, [def.key]: v }))} rows={4} />
            )}
            {def.kind === "image" && (
              <AdminImagePicker label={def.label} hint={def.hint} value={val} onChange={(v) => setDraft((d) => ({ ...d, [def.key]: v }))} />
            )}
            {def.kind === "number" && (
              <AdminText label={def.label} hint={def.hint} value={val} onChange={(v) => setDraft((d) => ({ ...d, [def.key]: v.replace(/[^0-9]/g, "") }))} dir="ltr" />
            )}
            {def.kind === "select" && (
              <AdminField label={def.label} hint={def.hint}>
                <select
                  value={val}
                  onChange={(e) => setDraft((d) => ({ ...d, [def.key]: e.target.value }))}
                  className="input-luxe w-full appearance-none"
                >
                  <option value="">انتخاب کن</option>
                  {def.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </AdminField>
            )}
          </div>
          <button
            onClick={() => save(def.key)}
            disabled={!dirty || savingKey === def.key}
            className="btn-gold shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold disabled:opacity-40"
          >
            {savingKey === def.key ? <Loader2 className="size-4 animate-spin" /> : "ذخیره"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="card-luxe h-fit rounded-[2rem] p-4 lg:sticky lg:top-28">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-ink-500">
          <Settings2 className="size-4 text-gold-600" />
          مدیریت واقعی محتوا
        </p>
        <nav className="space-y-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-right text-sm font-semibold transition-colors",
                active === t.key
                  ? "bg-forest-800 text-gold-200"
                  : "text-ink-600 hover:bg-ivory-200 hover:text-forest-800",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 rounded-2xl bg-ivory-200/70 p-3 text-[11px] leading-5 text-ink-500">
          هر تغییر بلافاصله روی کل سایت اعمال می‌شود. برای دیدن نتیجه سریع روی refresh صفحه عمومی بزن.
        </div>
        <button
          onClick={() => {
            router.refresh();
            refresh();
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-ivory-300 py-2.5 text-xs font-bold text-ink-500 transition-colors hover:border-gold-500"
        >
          <RefreshCcw className="size-3.5" />
          تازه‌سازی
        </button>
      </aside>

      <div className="space-y-6">
        {active === "settings" && (
          <div className="space-y-4">
            <div className="card-luxe rounded-[2rem] p-5">
              <h2 className="font-display text-2xl font-bold text-forest-950">تنظیمات کلی</h2>
              <p className="mt-1.5 text-sm text-ink-400">
                عنوان، توضیحات سئو، برندینگ و داده‌های سراسری سایت را اینجا عوض کن.
              </p>
            </div>
            {loading ? (
              <div className="card-luxe flex h-40 items-center justify-center rounded-[2rem]">
                <Loader2 className="size-6 animate-spin text-gold-600" />
              </div>
            ) : (
              SETTING_DEFS.filter((d) =>
                ["site.title", "site.description", "admin.cta_text", "footer.about", "footer.tagline", "footer.phone", "footer.email", "guide.golden_rule"].includes(d.key),
              ).map(renderSetting)
            )}
          </div>
        )}

        {active === "listings" && (
          <div className="space-y-4">
            <div className="card-luxe rounded-[2rem] p-5">
              <h2 className="font-display text-2xl font-bold text-forest-950">ویرایش زندهٔ آگهی‌ها</h2>
              <p className="mt-1.5 text-sm text-ink-400">
                عنوان، عکس، قیمت، وضعیت، «نشان‌دار» و حذف هر آگهی را همینجا مدیریت کن — بلافاصله روی سایت اعمال می‌شود.
              </p>
            </div>
            <ListingsEditor />
          </div>
        )}

        {active === "hero" && (
          <div className="space-y-4">
            <div className="card-luxe rounded-[2rem] p-5">
              <h2 className="font-display text-2xl font-bold text-forest-950">هیرو و بخش‌های صفحه اصلی</h2>
              <p className="mt-1.5 text-sm text-ink-400">
                عنوان، زیرعنوان، عکس و سوییچ نمایش ماژول‌های صفحه اصلی را مدیریت کن.
              </p>
            </div>
            {loading ? (
              <div className="card-luxe flex h-40 items-center justify-center rounded-[2rem]">
                <Loader2 className="size-6 animate-spin text-gold-600" />
              </div>
            ) : (
              SETTING_DEFS.filter((d) => d.key.startsWith("home.")).map(renderSetting)
            )}
            <div className="card-luxe rounded-[2rem] p-5">
              <BlockListEditor section="marquee" allowImage={false} allowIcon={false} />
            </div>
          </div>
        )}

        {active === "why" && (
          <div className="space-y-4">
            <div className="card-luxe rounded-[2rem] p-5">
              <h2 className="font-display text-2xl font-bold text-forest-950">چرا طوقی + CTA</h2>
              <p className="mt-1.5 text-sm text-ink-400">چهار کارت اعتمادسازی و باکس دعوت به ثبت آگهی را ویرایش کن.</p>
            </div>
            <div className="card-luxe rounded-[2rem] p-5">
              <BlockListEditor section="why" allowImage={false} allowIcon />
            </div>
            <div className="card-luxe rounded-[2rem] p-5">
              <BlockListEditor section="cta" allowImage allowIcon={false} />
            </div>
          </div>
        )}

        {active === "footer" && (
          <div className="space-y-4">
            <div className="card-luxe rounded-[2rem] p-5">
              <h2 className="font-display text-2xl font-bold text-forest-950">فوتر</h2>
              <p className="mt-1.5 text-sm text-ink-400">
                متن معرفی فوتر و جستجوهای داغ را ویرایش کن.
              </p>
            </div>
            <div className="card-luxe rounded-[2rem] p-5">
              <BlockListEditor section="footer_about" allowImage={false} allowIcon={false} />
            </div>
            <div className="card-luxe rounded-[2rem] p-5">
              <BlockListEditor section="footer_hot" allowImage={false} allowIcon={false} />
            </div>
          </div>
        )}

        {active === "guide" && (
          <div className="space-y-4">
            <div className="card-luxe rounded-[2rem] p-5">
              <h2 className="font-display text-2xl font-bold text-forest-950">راهنمای امن معامله</h2>
              <p className="mt-1.5 text-sm text-ink-400">متن‌های صفحه راهنما و نکات انجام/تفریح را ویرایش کن.</p>
            </div>
            <div className="card-luxe rounded-[2rem] p-5">
              {loading ? (
                <div className="flex h-24 items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-gold-600" />
                </div>
              ) : (
                SETTING_DEFS.filter((d) => d.key === "guide.golden_rule").map(renderSetting)
              )}
            </div>
            <div className="card-luxe rounded-[2rem] p-5">
              <BlockListEditor section="guide_steps" allowImage={false} allowIcon />
            </div>
            <div className="card-luxe rounded-[2rem] p-5">
              <BlockListEditor section="guide_do" allowImage={false} allowIcon={false} />
            </div>
            <div className="card-luxe rounded-[2rem] p-5">
              <BlockListEditor section="guide_dont" allowImage={false} allowIcon={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
