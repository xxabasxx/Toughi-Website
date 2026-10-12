import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, cities, listings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const b = await req.json();
    const title = String(b?.title ?? "").trim();
    const description = String(b?.description ?? "").trim();
    const categoryId = Number(b?.categoryId);
    const cityId = Number(b?.cityId);
    const negotiable = Boolean(b?.negotiable);
    const price = b?.price === null || b?.price === undefined || b?.price === "" ? null : Number(b.price);
    const images: string[] = Array.isArray(b?.images)
      ? b.images.filter((x: unknown) => typeof x === "string" && x.length < 600).slice(0, 8)
      : [];
    const attributes: Record<string, string> = {};
    if (b?.attributes && typeof b.attributes === "object") {
      for (const [k, v] of Object.entries(b.attributes as Record<string, unknown>)) {
        if (typeof v === "string" && v.trim()) attributes[k.slice(0, 40)] = v.trim().slice(0, 120);
      }
    }

    if (title.length < 5 || title.length > 160) {
      return NextResponse.json({ ok: false, error: "عنوان باید بین ۵ تا ۱۶۰ کاراکتر باشد" }, { status: 400 });
    }
    if (description.length < 20) {
      return NextResponse.json({ ok: false, error: "توضیحات باید حداقل ۲۰ کاراکتر باشد" }, { status: 400 });
    }
    if (price !== null && (!Number.isFinite(price) || price < 0 || price > 999_000_000_000)) {
      return NextResponse.json({ ok: false, error: "قیمت نامعتبر است" }, { status: 400 });
    }
    const cat = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
    if (!cat[0]) return NextResponse.json({ ok: false, error: "دسته‌بندی نامعتبر است" }, { status: 400 });
    const city = await db.select().from(cities).where(eq(cities.id, cityId)).limit(1);
    if (!city[0]) return NextResponse.json({ ok: false, error: "شهر نامعتبر است" }, { status: 400 });
    if (images.length === 0) {
      return NextResponse.json({ ok: false, error: "حداقل یک عکس برای آگهی لازم است" }, { status: 400 });
    }

    const inserted = await db
      .insert(listings)
      .values({
        userId: user.id,
        title,
        description,
        price,
        negotiable,
        categoryId,
        cityId,
        images,
        attributes,
      })
      .returning({ id: listings.id });

    return NextResponse.json({ ok: true, id: inserted[0].id });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
