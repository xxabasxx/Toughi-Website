import Link from "next/link";
import {
  ShieldCheck,
  Handshake,
  FileCheck2,
  House,
  Ban,
  MessageCircle,
  BadgeCheck,
  Sparkles,
  PhoneCall,
  ArrowLeft,
  CircleCheck,
  CircleX,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { getSetting, getBlocks } from "@/lib/cms";
import { getCmsIcon } from "@/lib/cms-icons";

export const metadata = { title: "راهنمای امن معامله" };

const STEPS = [
  {
    icon: MessageCircle,
    title: "گفتگو و پرسش دقیق",
    desc: "از چت داخلی استفاده کن؛ سن، جنسیت، سابقه درمان، رژیم غذایی و دلیل واگذاری را بپرس. پاسخ‌های مبهم یعنی باید محتاط باشی.",
  },
  {
    icon: FileCheck2,
    title: "بررسی مدارک و اصالت",
    desc: "حلقهٔ پای پرندگان، برگهٔ تولد یا اصالت برای گونه‌های خاص، برگهٔ سلامت دامپزشک و دفترچه واکسن برای سگ و گربه را ببین.",
  },
  {
    icon: House,
    title: "بازدید حضوری در محل",
    desc: "حیوان را از نزدیک ببین؛ محیط نگهداری را بررسی کن. لقمهٔ چشم و نوک بال‌ها، براقی پر و سطح انرژی، نشانه‌های سلامت‌اند.",
  },
  {
    icon: Handshake,
    title: "پرداخت هنگام تحویل",
    desc: "مبلغ را فقط هنگام تحویل حضوری پرداخت کن. به هیچ عنوان پیش‌پرداخت یا بیعانه قبل از دیدن حیوان واریز نکن.",
  },
];

const DOS = [
  "تحویل گرفتن برگهٔ سلامت و حلقه پا برای طوطی‌های باارزش",
  "قرار گذاشتن در مکان عمومی یا نزدیک محل فروشنده با همراه",
  "تهیه قفس حمل استاندارد قبل از مراجعه به قرار",
  "استعلام قیمت روز گونه از چند فروشگاه معتبر",
  "گرفتن رسید یا وضعیت توافق در چت داخلی طوقی",
];

const DONTS = [
  "واریز هرگونه مبلغ قبل از مشاهدهٔ حضوری حیوان",
  "سپردن حیوان به دست ارسال بدون بیمه و جعبه استاندارد",
  "اعتماد به عکس‌های موجود در اینترنت به‌جای عکس اختصاصی",
  "بازگویی اطلاعات بانکی یا کارت ملی در چت",
  "خرید گونه‌های حفاظت‌شده یا صید وحش بدون پروانه",
];

export default async function GuidePage() {
  const [goldenRule, doBlocks, dontBlocks, stepBlocks] = await Promise.all([
    getSetting("guide.golden_rule", "«هیچ معامله‌ای این‌قدر فوری نیست که نشود یک بار دیدنش،\nو هیچ فروشنده‌ای آن‌قدر مطمئن نیست که نشود مدارکش را خواست.»"),
    getBlocks("guide_do"),
    getBlocks("guide_dont"),
    getBlocks("guide_steps"),
  ]);
  const dos = doBlocks.length ? doBlocks.map((b) => b.title) : DOS;
  const donts = dontBlocks.length ? dontBlocks.map((b) => b.title) : DONTS;
  const steps = stepBlocks.length
    ? stepBlocks
    : STEPS.map((x) => ({ id: x.title, icon: iconKeyFor(x.title), title: x.title, body: x.desc, sort: 0, section: "guide_steps" as const, subtitle: "", image: "", link: "", createdAt: new Date(0), updatedAt: new Date(0) }));

  function iconKeyFor(title: string) {
    if (title.includes("گفتگو")) return "chat";
    if (title.includes("مدارک") || title.includes("اصالت")) return "file";
    if (title.includes("محل") || title.includes("حضوری") || title.includes("بازدید")) return "house";
    if (title.includes("تحویل") || title.includes("پردالت")) return "handshake";
    return "shield";
  }
  return (
    <div className="overflow-hidden">
      {/* hero */}
      <section className="relative overflow-hidden bg-forest-950 py-20 text-ivory-100">
        <div className="grain absolute inset-0" />
        <div
          className="pointer-events-none absolute right-1/2 top-16 size-[560px] translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(201,162,75,0.45), transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <Reveal>
            <span className="mx-auto mb-6 grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-gold-400 to-gold-700 text-forest-950 shadow-xl shadow-gold-500/30">
              <ShieldCheck className="size-8" />
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h1 className="font-display text-4xl font-bold leading-snug sm:text-5xl">
              راهنمای <span className="text-gradient-gold">امن معامله</span> در طوقی
            </h1>
          </Reveal>
          <Reveal delay={2}>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-ivory-100/65">
              خرید حیوان، شروع یک رابطهٔ چندساله است. این راهنما را دنبال کن تا هم معامله‌ات امن باشد
              و هم همراه تازه‌ات سالم و اصیل به خانه برسد.
            </p>
          </Reveal>
        </div>
      </section>

      {/* steps */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {steps.map((s, i) => (
            <Reveal key={s.id ?? s.title} delay={i}>
              <div className="card-luxe relative h-full overflow-hidden rounded-[1.75rem] p-7">
                <span className="font-display pointer-events-none absolute -left-2 -top-4 text-8xl font-bold text-gold-500/15">
                  {["۱", "۲", "۳", "۴"][i]}
                </span>
                <span className="grid size-12 place-items-center rounded-2xl bg-forest-800 text-gold-300">
                  {(() => { const I = getCmsIcon(s.icon || "shield"); return <I className="size-5" />; })()}
                </span>
                <h3 className="font-display mt-5 text-xl font-bold text-forest-950">{s.title}</h3>
                <p className="mt-3 text-[13px] leading-7 text-ink-500">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* do / don't */}
      <section className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-[1.75rem] border-2 border-emerald-600/25 bg-emerald-600/5 p-8">
              <h3 className="font-display flex items-center gap-2 text-xl font-bold text-emerald-700">
                <CircleCheck className="size-6" />
                حتماً انجام بده
              </h3>
              <ul className="mt-5 space-y-3.5 text-[13px] leading-7 text-ink-700">
                {dos.map((d) => (
                  <li key={d} className="flex items-start gap-2.5">
                    <CircleCheck className="mt-1 size-4 shrink-0 text-emerald-600" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="h-full rounded-[1.75rem] border-2 border-ruby-500/25 bg-ruby-500/5 p-8">
              <h3 className="font-display flex items-center gap-2 text-xl font-bold text-ruby-500">
                <Ban className="size-6" />
                هرگز انجام نده
              </h3>
              <ul className="mt-5 space-y-3.5 text-[13px] leading-7 text-ink-700">
                {donts.map((d) => (
                  <li key={d} className="flex items-start gap-2.5">
                    <CircleX className="mt-1 size-4 shrink-0 text-ruby-500" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* golden rules */}
      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-forest-950 p-10 text-ivory-100 sm:p-14">
            <div className="grain absolute inset-0" />
            <div className="relative mx-auto max-w-2xl text-center">
              <Sparkles className="mx-auto size-8 text-gold-400" />
              <h2 className="font-display mt-5 text-3xl font-bold leading-snug">
                قانون طلایی طوقی
              </h2>
              <p className="font-display mt-5 whitespace-pre-line text-xl leading-10 text-ivory-100/85">
                {goldenRule}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-gold-300">
                <span className="flex items-center gap-1.5 rounded-full border border-gold-500/30 px-4 py-2">
                  <BadgeCheck className="size-4" /> فروشندگان نماد طلایی بررسی‌شده‌اند
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-gold-500/30 px-4 py-2">
                  <PhoneCall className="size-4" /> پشتیبانی: ۰۲۱-۹۱۰۰۸۸۰۰
                </span>
              </div>
              <Link
                href="/explore?sort=featured"
                className="btn-gold mt-9 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm"
              >
                کاوش آگهی‌های نشان‌دار
                <ArrowLeft className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
