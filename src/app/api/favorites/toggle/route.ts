import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites, listings } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const { listingId } = await req.json();
    if (typeof listingId !== "string" || listingId.length < 10) {
      return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
    }
    const exists = await db
      .select({ id: listings.id })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);
    if (!exists[0]) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    const current = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.listingId, listingId)))
      .limit(1);
    if (current[0]) {
      await db.delete(favorites).where(eq(favorites.id, current[0].id));
      return NextResponse.json({ ok: true, active: false });
    }
    await db.insert(favorites).values({ userId: user.id, listingId });
    return NextResponse.json({ ok: true, active: true });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
