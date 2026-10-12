import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const [listing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    if (!listing) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    if (listing.userId !== user.id) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const action = String(body?.action ?? "");

    if (action === "bump") {
      await db
        .update(listings)
        .set({ createdAt: new Date(), updatedAt: new Date() })
        .where(eq(listings.id, id));
      return NextResponse.json({ ok: true });
    }
    if (action === "status") {
      const status = String(body?.status ?? "");
      if (!["active", "sold", "hidden"].includes(status)) {
        return NextResponse.json({ ok: false, error: "وضعیت نامعتبر" }, { status: 400 });
      }
      await db.update(listings).set({ status, updatedAt: new Date() }).where(eq(listings.id, id));
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "عملیات نامعتبر" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const [listing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    if (!listing) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    if (listing.userId !== user.id) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    await db.delete(listings).where(eq(listings.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
