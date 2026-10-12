import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};
const MAX_SIZE = 6 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ ok: false, error: "فایلی انتخاب نشده است" }, { status: 400 });
    }
    if (files.length > 8) {
      return NextResponse.json({ ok: false, error: "حداکثر ۸ عکس مجاز است" }, { status: 400 });
    }
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const urls: string[] = [];
    for (const file of files) {
      const ext = ALLOWED[file.type];
      if (!ext) {
        return NextResponse.json({ ok: false, error: "فرمت تصویر باید JPG، PNG یا WEBP باشد" }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ ok: false, error: "حجم هر عکس باید کمتر از ۶ مگابایت باشد" }, { status: 400 });
      }
      const name = `${randomUUID()}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, name), buffer);
      urls.push(`/uploads/${name}`);
    }
    return NextResponse.json({ ok: true, urls });
  } catch {
    return NextResponse.json({ ok: false, error: "خطا در آپلود تصویر" }, { status: 500 });
  }
}
