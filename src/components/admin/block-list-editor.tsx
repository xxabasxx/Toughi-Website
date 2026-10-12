"use client";

import { useEffect, useState } from "react";
import { adminDeleteBlock, adminGetBlocks, adminReorderBlocks, adminUpsertBlock } from "@/lib/admin-actions";
import type { CmsBlock } from "@/db/schema";
import { AdminField, AdminImagePicker, AdminSubmitButton, AdminText, AdminTextArea } from "./admin-inputs";
import { ArrowDown, ArrowUp, Edit3, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<string, string> = {
  hero: "هیرو (متن اصلی صفحه)",
  marquee: "آیتم‌های نوار متحرک",
  why: "کارت‌های «چرا طوقی؟»",
  cta: "باکس دعوت به ثبت آگهی",
  footer_about: "متن معرفی در فوتر",
  guide_do: "نکات «حتماً انجام بده» راهنما",
  guide_dont: "نکات «هرگز انجام نده» راهنما",
  guide_steps: "مراحل امن معامله راهنما",
  footer_hot: "جستجوهای داغ فوتر",
};

const ICON_OPTIONS = [
  { value: "shield", label: "سپر امنیت" },
  { value: "chat", label: "چت" },
  { value: "gem", label: "گوهر" },
  { value: "lock", label: "قفل" },
  { value: "sparkles", label: "درخشش" },
  { value: "file", label: "سند / مدارک" },
  { value: "house", label: "خانه" },
  { value: "handshake", label: "دست‌دادن" },
  { value: "badge", label: "نشان" },
  { value: "phone", label: "تلفن" },
  { value: "feather", label: "پر" },
  { value: "paw", label: "پنجه" },
] as const;

type BlockDraft = {
  id?: string;
  section: string;
  sort: number;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  icon: string;
  link: string;
};

function emptyDraft(section: string, sort = 0): BlockDraft {
  return { section, sort, title: "", subtitle: "", body: "", image: "", icon: "", link: "" };
}

export function BlockListEditor({ section, allowImage = true, allowIcon = true }: { section: string; allowImage?: boolean; allowIcon?: boolean }) {
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlockDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const rows = await adminGetBlocks(section as any);
    setBlocks(rows);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const startAdd = () =>
    setEditing(emptyDraft(section, blocks.length ? Math.max(...blocks.map((b) => b.sort)) + 1 : 0));

  const startEdit = (b: CmsBlock) =>
    setEditing({
      id: b.id,
      section: b.section,
      sort: b.sort,
      title: b.title,
      subtitle: b.subtitle,
      body: b.body,
      image: b.image,
      icon: b.icon,
      link: b.link,
    });

  const submit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminUpsertBlock(editing as any);
      await load();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("بلاک حذف شود؟")) return;
    setDeleting(id);
    await adminDeleteBlock(id);
    await load();
    setDeleting(null);
  };

  const move = async (block: CmsBlock, dir: -1 | 1) => {
    const idx = blocks.findIndex((b) => b.id === block.id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= blocks.length) return;
    const ordered = [...blocks];
    [ordered[idx], ordered[next]] = [ordered[next], ordered[idx]];
    const ids = ordered.map((b) => b.id);
    setSaving(true);
    await adminReorderBlocks(block.section as any, ids);
    await load();
    setSaving(false);
  };

  const draft = editing;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-forest-900">{SECTION_LABELS[section] ?? section}</p>
        <button
          onClick={startAdd}
          className="btn-forest flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold"
        >
          <Plus className="size-4" /> افزودن بلاک
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-gold-600" />
        </div>
      ) : blocks.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-ivory-300 bg-ivory-200/40 p-10 text-center text-sm text-ink-400">
          هنوز بلاکی برای این بخش ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((b) => (
            <div
              key={b.id}
              className="card-luxe flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <button
                    onClick={() => move(b, -1)}
                    className="grid size-6 place-items-center rounded-md text-ink-400 hover:bg-ivory-200"
                    aria-label="بالا"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => move(b, 1)}
                    className="grid size-6 place-items-center rounded-md text-ink-400 hover:bg-ivory-200"
                    aria-label="پایین"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
                {b.image ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.image} alt="" className="absolute inset-0 size-full object-cover" />
                  </div>
                ) : (
                  <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-forest-800/10 text-forest-700">
                    <Edit3 className="size-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-forest-950">{b.title || "(بدون عنوان)"}</p>
                {b.subtitle && <p className="mt-0.5 truncate text-xs text-ink-500">{b.subtitle}</p>}
                {b.body && <p className="line-clamp-2 mt-1 text-xs leading-5 text-ink-400">{b.body}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => startEdit(b)}
                  className="grid size-9 place-items-center rounded-xl border border-ivory-300 text-ink-500 transition-colors hover:border-gold-500"
                  aria-label="ویرایش"
                >
                  <Edit3 className="size-4" />
                </button>
                <button
                  onClick={() => remove(b.id)}
                  disabled={deleting === b.id}
                  className="grid size-9 place-items-center rounded-xl border border-ruby-500/30 text-ruby-500 transition-colors hover:bg-ruby-500/10 disabled:opacity-40"
                  aria-label="حذف"
                >
                  {deleting === b.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await submit();
          }}
          className="card-luxe space-y-4 rounded-2xl border-2 border-gold-500/40 p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-forest-900">{draft.id ? "ویرایش بلاک" : "افزودن بلاک جدید"}</p>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="grid size-8 place-items-center rounded-full text-ink-400 hover:bg-ivory-200"
              aria-label="انصراف"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminText label="عنوان" value={draft.title} onChange={(v) => setEditing({ ...draft, title: v })} placeholder="مثلاً: احراز هویت طلایی" />
            <AdminText label="زیرعنوان / اسلگن" value={draft.subtitle} onChange={(v) => setEditing({ ...draft, subtitle: v })} placeholder="اختیاری" />
          </div>

          <AdminTextArea
            label="متن بدنه"
            value={draft.body}
            onChange={(v) => setEditing({ ...draft, body: v })}
            hint="می‌تواند چند خطی باشد؛ در بعضی بخش‌ها دانسته‌ها با | یا Enter جدا می‌شوند."
            rows={5}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {allowImage && (
              <AdminImagePicker
                label="عکس"
                value={draft.image}
                onChange={(v) => setEditing({ ...draft, image: v })}
                hint="برای آیتم‌هایی که تصویر دارند (مثل گالری یا بنرها)"
              />
            )}
            {allowIcon && (
              <AdminField label="آیکون" hint="از آیکون‌های آماده سایت">
                <select
                  value={draft.icon}
                  onChange={(e) => setEditing({ ...draft, icon: e.target.value })}
                  className="input-luxe w-full appearance-none"
                >
                  <option value="">بدون آیکون</option>
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </AdminField>
            )}
          </div>

          <AdminText
            label="لینک (اختیاری)"
            value={draft.link}
            onChange={(v) => setEditing({ ...draft, link: v })}
            dir="ltr"
            placeholder="/guide یا https://..."
          />

          <AdminText label="ترتیب نمایش (عدد کوچکتر = بالاتر)" value={String(draft.sort)} onChange={(v) => setEditing({ ...draft, sort: Number(v.replace(/[^0-9]/g, "")) || 0 })} dir="ltr" hint="برای تغییر جایگاه آیتم‌ها بین بقیه" />

          <AdminSubmitButton pending={saving} label="ذخیره بلاک" />
        </form>
      )}
    </div>
  );
}
