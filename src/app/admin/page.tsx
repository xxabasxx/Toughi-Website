import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { ShieldCheck, Settings2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "پنل مدیریت طوقی" };

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/admin");
  if (!isAdmin(user)) redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-10">
        <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-gold-600">
          <ShieldCheck className="size-4" />
          فقط برای مدیر سایت
        </p>
        <h1 className="font-display flex items-center gap-3 text-4xl font-bold text-forest-950 sm:text-5xl">
          <Settings2 className="size-9 text-gold-600" />
          پنل مدیریت محتوا
        </h1>
        <p className="mt-3 text-sm text-ink-400">
          عنوان‌ها، عکس‌ها، متن‌های صفحات و بخش‌های سایت را اینجا مستقیم و لحظه‌ای ویرایش کن.
        </p>
      </div>

      <AdminShell />
    </div>
  );
}
