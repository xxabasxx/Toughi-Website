import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations, listings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const { listingId } = await req.json();
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, String(listingId)))
      .limit(1);
    if (!listing) return NextResponse.json({ ok: false, error: "آگهی یافت نشد" }, { status: 404 });
    if (listing.userId === user.id) {
      return NextResponse.json({ ok: false, error: "نمی‌توانی برای آگهی خودت چت باز کنی" }, { status: 400 });
    }
    const existing = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.listingId, listing.id), eq(conversations.buyerId, user.id)))
      .limit(1);
    if (existing[0]) {
      return NextResponse.json({ ok: true, id: existing[0].id });
    }
    const inserted = await db
      .insert(conversations)
      .values({ listingId: listing.id, buyerId: user.id, sellerId: listing.userId })
      .returning({ id: conversations.id });
    return NextResponse.json({ ok: true, id: inserted[0].id });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
