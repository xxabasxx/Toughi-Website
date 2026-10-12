"use server";

import { getSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import {
  deleteBlock,
  getBlocks,
  getSiteSettings,
  getSetting,
  reorderBlocks,
  setSetting,
  upsertBlock,
  type BlockSection,
  type BlockInput,
} from "@/lib/cms";
import { db } from "@/db";
import { listings, categories, cities, users, favorites } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function guard() {
  const user = await getSessionUser();
  if (!isAdmin(user)) throw new Error("FORBIDDEN");
  return user;
}

export type SettingDef = {
  key: string;
  label: string;
  hint?: string;
  kind: "text" | "textarea" | "image" | "number" | "select";
  options?: { value: string; label: string }[];
};

export async function adminGetSettings(): Promise<Record<string, string>> {
  await guard();
  return getSiteSettings();
}

export async function adminSaveSetting(key: string, value: string): Promise<void> {
  await guard();
  if (!/^[a-z0-9_.-]+$/i.test(key)) throw new Error("INVALID_KEY");
  await setSetting(key, String(value).slice(0, 2000));
  revalidatePublic();
}

export async function adminGetBlocks(section: BlockSection) {
  await guard();
  return getBlocks(section);
}

export async function adminUpsertBlock(block: BlockInput) {
  await guard();
  const id = await upsertBlock({
    ...block,
    title: block.title ?? "",
    subtitle: block.subtitle ?? "",
    body: block.body ?? "",
    image: block.image ?? "",
    icon: block.icon ?? "",
    link: block.link ?? "",
  });
  revalidatePublic();
  return id;
}

export async function adminDeleteBlock(id: string) {
  await guard();
  await deleteBlock(id);
  revalidatePublic();
}

export async function adminReorderBlocks(section: BlockSection, orderedIds: string[]) {
  await guard();
  await reorderBlocks(section, orderedIds);
  revalidatePublic();
}

export async function adminListings(limit = 50) {
  await guard();
  const rows = await db
    .select({
      id: listings.id,
      title: listings.title,
      price: listings.price,
      status: listings.status,
      featured: listings.featured,
      views: listings.views,
      images: listings.images,
      createdAt: listings.createdAt,
      categoryName: categories.name,
      cityName: cities.name,
      sellerName: users.name,
    })
    .from(listings)
    .innerJoin(categories, eq(listings.categoryId, categories.id))
    .innerJoin(cities, eq(listings.cityId, cities.id))
    .innerJoin(users, eq(listings.userId, users.id))
    .orderBy(desc(listings.createdAt))
    .limit(limit);
  return rows;
}

export async function adminUpdateListing(
  id: string,
  patch: Partial<{
    title: string;
    description: string;
    price: number | null;
    negotiable: boolean;
    status: "active" | "sold" | "hidden";
    featured: boolean;
    images: string[];
    attributes: Record<string, string>;
  }>,
) {
  await guard();
  await db.update(listings).set({ ...patch, updatedAt: new Date() }).where(eq(listings.id, id));
  revalidatePublic();
}

export async function adminDeleteListing(id: string) {
  await guard();
  await db.delete(favorites).where(eq(favorites.listingId, id));
  await db.delete(listings).where(eq(listings.id, id));
  revalidatePublic();
}

export async function adminUsers() {
  await guard();
  const rows = await db
    .select({
      id: users.id,
      phone: users.phone,
      name: users.name,
      shop: users.shop,
      city: users.city,
      role: users.role,
      verified: users.verified,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(200);
  return rows;
}

export async function adminUpdateUser(
  id: string,
  patch: Partial<{ name: string; shop: string | null; verified: boolean }>,
) {
  await guard();
  await db.update(users).set(patch).where(eq(users.id, id));
  revalidatePublic();
}

export async function adminUpdateUserImages(id: string, images: string[]) {
  await guard();
  await db.update(listings).set({ images, updatedAt: new Date() }).where(eq(listings.id, id));
  revalidatePublic();
}

export async function revalidatePublic() {
  revalidatePath("/", "layout");
}
