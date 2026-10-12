import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ShieldCheck, MessageCircle, Gem } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";

export const metadata = { title: "ورود | ثبت‌نام" };

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";
  if (user) redirect(next);

  return (
    <div className="relative -mt-20 min-h-dvh overflow-hidden bg-forest-950 pt-20 text-ivory-100">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-pigeon.jpg" alt="" className="size-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-950/60 to-forest-950" />
      </div>
      <div className="grain absolute inset-0" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl items-center justify-center px-5 py-14">
        <div className="card-luxe grid w-full overflow-hidden rounded-[2.5rem] lg:grid-cols-2">
          {/* form side */}
          <div className="flex items-center justify-center p-8 sm:p-12">
            <Suspense>
              <AuthForm next={next} />
            </Suspense>
          </div>

          {/* brand side */}
          <div className="relative hidden flex-col justify-between bg-forest-950 p-10 lg:flex">
            <div className="grain absolute inset-0" />
            <div className="absolute inset-x-10 top-10 h-px bg-gradient-to-l from-transparent via-gold-500/50 to-transparent" />
            <Logo light />
            <div className="relative">
              <p className="font-display text-3xl font-bold leading-snug">
                حسابی به <span className="text-gradient-gold">اندازهٔ عشقت</span>
                <br />
                به پرنده‌ها
              </p>
              <ul className="mt-8 space-y-5">
                {[
                  { icon: ShieldCheck, text: "نماد احراز هویت طلایی برای فروشندگان حرفه‌ای" },
                  { icon: MessageCircle, text: "چت امن داخلی با خریدارها و فروشنده‌ها" },
                  { icon: Gem, text: "امکان صعود آگهی به بخش نشان‌دارها" },
                ].map((f) => (
                  <li key={f.text} className="flex items-center gap-3.5 text-sm text-ivory-100/75">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-500/15 text-gold-400">
                      <f.icon className="size-4.5" />
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
            <p className="relative text-xs text-ivory-100/40">
              با ورود یا ثبت‌نام، قوانین انتشار آگهی و حریم خصوصی طوقی را می‌پذیری.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
