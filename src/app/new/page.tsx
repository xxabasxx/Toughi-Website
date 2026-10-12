import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getCategories, getCities } from "@/lib/queries";
import { NewAdForm } from "@/components/new-ad-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "ثبت آگهی رایگان" };

export default async function NewAdPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/new");

  const [cats, cities] = await Promise.all([getCategories(), getCities()]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-9">
        <p className="mb-2 text-xs font-bold tracking-[0.3em] text-gold-600">فروش در طوقی</p>
        <h1 className="font-display text-4xl font-bold text-forest-950 sm:text-5xl">
          ثبت آگهی <span className="text-gradient-gold">رایگان</span>
        </h1>
        <p className="mt-3 text-sm text-ink-500">
          در چهار مرحله ساده، آگهی‌ات را جلوی چشم هزاران خریدار واقعی قرار بده.
        </p>
      </div>

      <NewAdForm
        categories={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, kind: c.kind, icon: c.icon }))}
        cities={cities.map((c) => ({ id: c.id, name: c.name }))}
        meName={user.name}
      />
    </div>
  );
}
