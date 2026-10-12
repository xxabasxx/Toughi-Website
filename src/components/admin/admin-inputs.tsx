"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader2, Save, ImagePlus, X, Trash2 } from "lucide-react";

export function AdminField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-ink-500">{label}</label>
      {children}
      {hint && <p className="text-[10.5px] leading-5 text-ink-400">{hint}</p>}
    </div>
  );
}

export function AdminText({
  label,
  value,
  onChange,
  placeholder,
  hint,
  dir = "rtl",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <AdminField label={label ?? ""} hint={hint}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="input-luxe w-full"
      />
    </AdminField>
  );
}

export function AdminTextArea({
  label,
  value,
  onChange,
  hint,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
}) {
  return (
    <AdminField label={label} hint={hint}>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="input-luxe w-full resize-y" />
    </AdminField>
  );
}

export function AdminImagePicker({
  label,
  value,
  onChange,
  hint,
  aspect = "aspect-[16/9]",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  aspect?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append("files", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (data.ok && data.urls?.[0]) onChange(data.urls[0]);
  };

  return (
    <AdminField label={label} hint={hint}>
      <div className="space-y-2">
        {value && (
          <div className={`relative ${aspect} overflow-hidden rounded-2xl border border-ivory-300`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute left-2 top-2 grid size-8 place-items-center rounded-full bg-ruby-500 text-white shadow-lg"
              aria-label="حذف تصویر"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <label className="btn-forest flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {uploading ? "در حال آپلود..." : "آپلود عکس"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </AdminField>
  );
}

export function AdminSubmitButton({ pending, label = "ذخیره تغییرات" }: { pending?: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-gold flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm disabled:opacity-50"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      {pending ? "در حال ذخیره..." : label}
    </button>
  );
}
