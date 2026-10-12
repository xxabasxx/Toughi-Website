import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations, listings, messages, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

async function getConv(id: string) {
  const rows = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const conv = await getConv(id);
    if (!conv || (conv.buyerId !== user.id && conv.sellerId !== user.id)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    const [listingRows, msgs, otherRows] = await Promise.all([
      db
        .select({
          title: listings.title,
          images: listings.images,
          price: listings.price,
          status: listings.status,
        })
        .from(listings)
        .where(eq(listings.id, conv.listingId))
        .limit(1),
      db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(asc(messages.createdAt))
        .limit(200),
      db
        .select({ name: users.name, verified: users.verified })
        .from(users)
        .where(eq(users.id, conv.buyerId === user.id ? conv.sellerId : conv.buyerId))
        .limit(1),
    ]);
    return NextResponse.json({
      ok: true,
      me: user.id,
      listing: listingRows[0] ?? null,
      other: otherRows[0] ?? null,
      messages: msgs.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        body: m.body,
        createdAt: m.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const conv = await getConv(id);
    if (!conv || (conv.buyerId !== user.id && conv.sellerId !== user.id)) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    const body = await req.json();
    const text = String(body?.body ?? "").trim();
    if (!text || text.length > 1500) {
      return NextResponse.json({ ok: false, error: "پیام نامعتبر است" }, { status: 400 });
    }
    await db.insert(messages).values({ conversationId: conv.id, senderId: user.id, body: text });
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conv.id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
