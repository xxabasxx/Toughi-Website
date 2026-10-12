import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { toFa } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const rows = await db
      .select({ phone: users.phone, name: users.name, shop: users.shop })
      .from(listings)
      .innerJoin(users, eq(listings.userId, users.id))
      .where(eq(listings.id, id))
      .limit(1);
    if (!rows[0]) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({
      ok: true,
      phone: toFa(rows[0].phone),
      name: rows[0].name,
      shop: rows[0].shop,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
