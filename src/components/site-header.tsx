import { getSessionUser } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import { isAdmin } from "@/lib/admin";
import { HeaderClient } from "./header-client";

export async function SiteHeader() {
  const [user, cats] = await Promise.all([getSessionUser(), getCategories()]);
  return (
    <HeaderClient
      user={
        user
          ? { name: user.name, verified: user.verified, shop: user.shop, isAdmin: isAdmin(user) }
          : null
      }
      categories={cats.map((c) => ({ name: c.name, slug: c.slug, kind: c.kind, icon: c.icon }))}
    />
  );
}
