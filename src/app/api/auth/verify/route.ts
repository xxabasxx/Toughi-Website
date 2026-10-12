import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes, users } from "@/db/schema";
import { createSession, setSessionCookie } from "@/lib/auth";
import { normalizePhone, isValidIranPhone } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = normalizePhone(String(body?.phone ?? ""));
    const code = String(body?.code ?? "").replace(/[۰-۹]/g, (d) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
    );
    const name = String(body?.name ?? "").trim();

    if (!isValidIranPhone(phone) || !/^\d{4}$/.test(code)) {
      return NextResponse.json({ ok: false, error: "اطلاعات نامعتبر است" }, { status: 400 });
    }

    const otp = await db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.phone, phone), eq(otpCodes.consumed, false)))
      .orderBy(desc(otpCodes.id))
      .limit(1);

    const latest = otp[0];
    if (!latest || latest.code !== code || latest.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, error: "کد تایید اشتباه یا منقضی شده است" }, { status: 400 });
    }

    let user = (
      await db.select().from(users).where(eq(users.phone, phone)).limit(1)
    )[0];

    if (!user) {
      if (name.length < 2) {
        // کد مصرف نمی‌شود تا کاربر بدون درخواست مجدد بتواند نام را وارد کند
        return NextResponse.json({ ok: true, needsName: true });
      }
      const inserted = await db
        .insert(users)
        .values({ phone, name })
        .returning();
      user = inserted[0];
    }

    await db.update(otpCodes).set({ consumed: true }).where(eq(otpCodes.id, latest.id));

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, phone: user.phone, verified: user.verified },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
