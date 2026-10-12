"use client";

import { useEffect, useState } from "react";
import {
  adminDeleteListing,
  adminListings,
  adminUpdateListing,
} from "@/lib/admin-actions";
import { AdminImagePicker, AdminSubmitButton, AdminText, AdminTextArea } from "./admin-inputs";
import { Crown, Edit3, Eye, Loader2, MapPin, Rocket, Trash2, X } from "lucide-react";
import { cn, faNum, formatToman, timeAgoFa } from "@/lib/utils";
import Link from "next/link";

type Row = Awaited<ReturnType<typeof adminListings>>[number];
type Patch = Parameters<typeof adminUpdateListing>[1];

const STATUS: Record<string, string> = { active: "فعال", sold: "فروخته شد", hidden: "پنهان" };

export function ListingsEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [patch, setPatch] = useState<Patch>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setRows(await adminListings(80));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (id: string, p: Patch) => {
    setBusy(id);
    await adminUpdateListing(id, p);
    await load();
    setEditing(null);
    setPatch({});
    setBusy(null);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    setPatch({
      title: r.title,
      price: r.price,
      status: r.status as Patch["status"],
      featured: r.featured,
      images: r.images ?? [],
    });
  };

  if (loading) {
    return (
      <div className="card-luxe flex h-40 items-center justify-center rounded-[2rem]">
        <Loader2 className="size-6 animate-spin text-gold-600" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="card-luxe flex flex-col gap-4 rounded-2xl p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.images?.[0] ?? "/images/hero-pigeon.jpg"} alt="" className="absolute inset-0 size-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-bold text-forest-950">
                {r.title}
                {r.featured && <Crown className="size-4 text-gold-600" />}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-400">
                <span>{r.categoryName}</span>
                <span className="flex items-center gap-1"><MapPin className="size-3 text-gold-600" />{r.cityName}</span>
                <span>{r.sellerName}</span>
                <span>{timeAgoFa(r.createdAt)}</span>
                <span className={cn("rounded-full px-2 py-0.5 font-bold",
                  r.status === "active" && "bg-emerald-600/12 text-emerald-700",
                  r.status === "sold" && "bg-gold-500/20 text-gold-700",
                  r.status === "hidden" && "bg-ink-400/15 text-ink-500")}>
                  {STATUS[r.status] ?? r.status}
                </span>
                <span className="flex items-center gap-1"><Eye className="size-3 text-gold-600" />{faNum(r.views)}</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link href={`/ad/${r.id}`} target="_blank" className="grid size-9 place-items-center rounded-xl border border-ivory-300 text-ink-500 hover:border-gold-500" aria-label="مشاهده">
                <Eye className="size-4" />
              </Link>
              <button onClick={() => openEdit(r)} className="grid size-9 place-items-center rounded-xl border border-ivory-300 text-ink-500 hover:border-gold-500" aria-label="ویرایش">
                <Edit3 className="size-4" />
              </button>
              <button
                onClick={async () => {
                  setBusy(r.id + "f");
                  await adminUpdateListing(r.id, { featured: !r.featured });
                  await load();
                  setBusy(null);
                }}
                className={cn("grid size-9 place-items-center rounded-xl border transition-colors", r.featured ? "border-gold-500 bg-gold-500/15 text-gold-700" : "border-ivory-300 text-ink-400 hover:border-gold-500")}
                aria-label="نمایش در نشان‌دارها"
              >
                <Crown className="size-4" />
              </button>
              <button
                onClick={async () => {
                  setBusy(r.id + "b");
                  await adminUpdateListing(r.id, {});
                  setBusy(r.id + "bb");
                  await fetch(`/api/listings/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "bump" }) });
                  await load();
                  setBusy(null);
                }}
                className="grid size-9 place-items-center rounded-xl border border-ivory-300 text-ink-400 hover:border-gold-500" aria-label="نرده"
              >
                <Rocket className="size-4" />
              </button>
              <select
                value={r.status}
                onChange={async (e) => {
                  setBusy(r.id + "s");
                  await adminUpdateListing(r.id, { status: e.target.value as Patch["status"] });
                  await load();
                  setBusy(null);
                }}
                className="rounded-xl border border-ivory-300 bg-white/80 px-2.5 py-2 text-xs font-bold text-forest-800"
              >
                {Object.entries(STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <button
                onClick={async () => {
                  if (!confirm(`آگهی «${r.title.slice(0, 30)}...» کامل حذف شود؟`)) return;
                  setBusy(r.id + "d");
                  await adminDeleteListing(r.id);
                  await load();
                  setBusy(null);
                }}
                className="grid size-9 place-items-center rounded-xl border border-ruby-500/30 text-ruby-500 hover:bg-ruby-500/10"
                aria-label="حذف"
              >
                {busy === r.id + "d" ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              </button>
            </div>
          </div>

          {editing?.id === r.id && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save(r.id, patch);
              }}
              className="space-y-4 rounded-2xl border-2 border-gold-500/40 bg-gold-500/5 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-forest-900">ویرایش سریع آگهی</p>
                <button type="button" onClick={() => setEditing(null)} className="grid size-8 place-items-center rounded-full text-ink-400 hover:bg-ivory-200" aria-label="انصراف">
                  <X className="size-4" />
                </button>
              </div>
              <AdminText label="عنوان" value={String(patch.title ?? "")} onChange={(v) => setPatch({ ...patch, title: v })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminText label="قیمت (تومان — خالی = توافقی)" value={patch.price === null || patch.price === undefined ? "" : String(patch.price)} onChange={(v) => setPatch({ ...patch, price: v ? Number(v.replace(/[^0-9]/g, "")) : null })} dir="ltr" />
                <AdminText label="وضعیت نمایش" value={String(patch.status ?? "")} onChange={() => {}} hint="وضعیت را از سلکت کنار هم خیلی سریع عوض کن" />
              </div>
              <AdminImagePicker
                label="عکس اصلی آگهی"
                value={patch.images?.[0] ?? ""}
                onChange={(v) => {
                  const rest = (patch.images ?? []).slice(1);
                  setPatch({ ...patch, images: v ? [v, ...rest] : rest });
                }}
                hint="بقیه عکس‌ها دست‌نخورده می‌مانند"
              />
              <AdminSubmitButton pending={busy === r.id} label="ذخیره تغییرات آگهی" />
            </form>
          )}
        </div>
      ))}
    </div>
  );
}
