import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { normalizePhone, isValidIranPhone } from "@/lib/utils";

/** عدد فارسی به انگلیسی */
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const toFa = (s: string | number) =>
  String(s).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
const en = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));

/**
 * ارسال پیامک با پشتیبانی چندگانه از سرویس‌های ایرانی.
 * هر کدام از متغیرهای محیطی زیر را که ست کنی فعال می‌شود:
 *   SMS_PROVIDER=kavenegar + KAVENEGAR_API_KEY + SMS_TEMPLATE
 *   SMS_PROVIDER=ippanel  + IPPANEL_API_KEY + SMS_TEMPLATE + SMS_FROM
 *   SMS_PROVIDER=ghasedak + GHASEDAK_API_KEY + SMS_TEMPLATE + SMS_FROM
 *   SMS_PROVIDER=sms.ir   + SMSIR_API_KEY + SMSROUTE + SMS_TEMPLATE_ID
 * اگر هیچ‌کدام ست نباشلی، کد در پاسخ devCode برمی‌گردد (حالت توسعه).
 */
async function sendSms(phone: string, code: string): Promise<{ sent: boolean; provider?: string; error?: string }> {
  const provider = (process.env.SMS_PROVIDER ?? "").toLowerCase();
  const text = `کد ورود به طوقی: ${toFa(code)}\nاین کد تا ۳ دقیقه معتبر است.`;

  try {
    if (provider === "kavenegar") {
      const apiKey = process.env.KAVENEGAR_API_KEY;
      if (!apiKey) return { sent: false, provider, error: "KAVENEGAR_API_KEY missing" };
      const res = await fetch(
        `https://api.kavenegar.com/v1/${apiKey}/sms/send.json?receptor=${phone}&message=${encodeURIComponent(text)}`,
        { method: "POST" },
      );
      const data = await res.json();
      if (data.return?.status === 200) return { sent: true, provider };
      return { sent: false, provider, error: JSON.stringify(data.return) };
    }

    if (provider === "ippanel" || provider === "farazsms") {
      const apiKey = process.env.IPPANEL_API_KEY;
      const from = process.env.SMS_FROM || "+983000505";
      if (!apiKey) return { sent: false, provider, error: "IPPANEL_API_KEY missing" };
      const res = await fetch("https://api2.ippanel.com/api/v1/sms/send/webservice/single", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: apiKey },
        body: JSON.stringify({ origin: from, destination: phone, message: text }),
      });
      if (res.ok) return { sent: true, provider };
      return { sent: false, provider, error: await res.text() };
    }

    if (provider === "ghasedak") {
      const apiKey = process.env.GHASEDAK_API_KEY;
      const from = process.env.SMS_FROM || "10008566";
      if (!apiKey) return { sent: false, provider, error: "GHASEDAK_API_KEY missing" };
      const res = await fetch("https://gateway.ghasedak.me/rest/api/v1/WebService/SendSingleSms", {
        method: "POST",
        headers: { apikey: apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ lineNumber: from, message: text, receptor: en(phone) }),
      });
      const data = await res.json();
      if (data.isSuccess || data.success) return { sent: true, provider };
      return { sent: false, provider, error: JSON.stringify(data.message || data.result) };
    }

    if (provider === "smsir" || provider === "sms.ir") {
      const apiKey = process.env.SMSIR_API_KEY;
      const route = process.env.SMSROUTE || "مصادقه";
      if (!apiKey) return { sent: false, provider, error: "SMSIR_API_KEY missing" };
      const apiUrl = process.env.SMSIR_API_URL || "https://api.sms.ir/v1/send/verifyCode";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
        body: JSON.stringify({
          mobile: en(phone),
          templateId: Number(process.env.SMS_TEMPLATE_ID || 1),
          parameters: [{ name: "Code", value: en(code) }],
          route,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.status === 1 || res.ok) return { sent: true, provider: "smsir" };
      return { sent: false, provider: "smsir", error: JSON.stringify(data) };
    }

    return { sent: false, error: "no_provider_configured" };
  } catch (err: unknown) {
    return { sent: false, provider, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = normalizePhone(String(body?.phone ?? ""));
    if (!isValidIranPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: "شماره موبایل معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹" },
        { status: 400 },
      );
    }

    const code = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);
    await db.insert(otpCodes).values({ phone, code, expiresAt });

    const sent = await sendSms(phone, code);

    if (sent.sent) {
      return NextResponse.json({ ok: true, sent: true, provider: sent.provider });
    }

    // اگر سرویس پیامک ست نشده یا خطایی رخ داده، برای تست/توسعه کد را برگردان
    if (sent.error === "no_provider_configured") {
      return NextResponse.json({ ok: true, sent: false, devCode: code });
    }
    return NextResponse.json(
      { ok: false, error: `خطا در ارسال پیامک (${sent.provider || "provider"}): لطفاً چند دقیقه دیگر تلاش کن`, devCode: code },
      { status: 502 },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
