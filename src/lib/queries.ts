import { db } from "@/db";
import {
  listings,
  categories,
  cities,
  users,
  favorites,
  conversations,

} from "@/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  lte,
  sql,
  count as dcount,
  ne,
  type SQL,
} from "drizzle-orm";

export const listingCardSelect = {
  id: listings.id,
  title: listings.title,
  price: listings.price,
  negotiable: listings.negotiable,
  images: listings.images,
  status: listings.status,
  featured: listings.featured,
  views: listings.views,
  createdAt: listings.createdAt,
  cityId: listings.cityId,
  cityName: cities.name,
  citySlug: cities.slug,
  categoryId: listings.categoryId,
  categoryName: categories.name,
  categorySlug: categories.slug,
  categoryKind: categories.kind,
  sellerName: users.name,
  sellerId: users.id,
};

export type ListingCard = {
  id: string;
  title: string;
  price: number | null;
  negotiable: boolean;
  images: string[];
  status: string;
  featured: boolean;
  views: number;
  createdAt: Date;
  cityId: number;
  cityName: string;
  citySlug: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  categoryKind: string;
  sellerName: string;
  sellerId: string;
  favorited?: boolean;
};

const cardJoin = db
  .select(listingCardSelect)
  .from(listings)
  .innerJoin(cities, eq(listings.cityId, cities.id))
  .innerJoin(categories, eq(listings.categoryId, categories.id))
  .innerJoin(users, eq(listings.userId, users.id));

export type ExploreFilters = {
  q?: string;
  category?: string;
  kind?: string;
  city?: string;
  min?: number;
  max?: number;
  sort?: string;
  page?: number;
  negotiable?: boolean;
  seller?: string;
  status?: string;
};

export const PAGE_SIZE = 12;

function buildConditions(f: ExploreFilters, categoryIds: number[]): SQL[] {
  const conds: SQL[] = [];
  conds.push(eq(listings.status, f.status ?? "active"));
  if (f.q) {
    const pattern = `%${f.q}%`;
    conds.push(
      sql`(${listings.title} ILIKE ${pattern} OR ${listings.description} ILIKE ${pattern} OR ${categories.name} ILIKE ${pattern})`,
    );
  }
  if (f.category && categoryIds.length > 0) {
    conds.push(sql`${listings.categoryId} IN ${categoryIds}`);
  }
  if (f.kind && ["birds", "pets", "gear"].includes(f.kind)) {
    conds.push(eq(categories.kind, f.kind));
  }
  if (f.min !== undefined) conds.push(gte(listings.price, f.min));
  if (f.max !== undefined) conds.push(lte(listings.price, f.max));
  if (f.negotiable) conds.push(eq(listings.negotiable, true));
  if (f.seller) conds.push(eq(listings.userId, f.seller));
  return conds;
}

function orderFor(sort?: string): SQL[] {
  switch (sort) {
    case "cheap":
      return [sql`${listings.price} ASC NULLS LAST`, desc(listings.createdAt)];
    case "expensive":
      return [sql`${listings.price} DESC NULLS LAST`, desc(listings.createdAt)];
    case "popular":
      return [desc(listings.views), desc(listings.createdAt)];
    case "featured":
      return [desc(listings.featured), desc(listings.createdAt)];
    default:
      return [desc(listings.featured), desc(listings.createdAt)];
  }
}

export async function exploreListings(f: ExploreFilters) {
  const allCats = await getCategories();
  let categoryIds: number[] = [];
  if (f.category) {
    const found = allCats.find((c) => c.slug === f.category);
    if (found) categoryIds = [found.id];
  }

  let cityId: number | undefined;
  if (f.city) {
    const c = await db.select().from(cities).where(eq(cities.slug, f.city)).limit(1);
    cityId = c[0]?.id;
  }

  const conds = buildConditions(f, categoryIds);
  if (f.city && cityId !== undefined) conds.push(eq(listings.cityId, cityId));
  else if (f.city) conds.push(sql`1 = 0`);

  const page = Math.max(1, f.page ?? 1);

  const [rows, totalRows] = await Promise.all([
    cardJoin
      .where(and(...conds))
      .orderBy(...orderFor(f.sort))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ value: dcount() })
      .from(listings)
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .where(and(...conds)),
  ]);

  return { rows: rows as unknown as ListingCard[], total: totalRows[0]?.value ?? 0, page };
}

export async function getListingDetail(id: string) {
  const rows = await db
    .select({
      listing: listings,
      city: cities,
      category: categories,
      seller: {
        id: users.id,
        name: users.name,
        shop: users.shop,
        city: users.city,
        verified: users.verified,
        createdAt: users.createdAt,
        phone: users.phone,
      },
    })
    .from(listings)
    .innerJoin(cities, eq(listings.cityId, cities.id))
    .innerJoin(categories, eq(listings.categoryId, categories.id))
    .innerJoin(users, eq(listings.userId, users.id))
    .where(eq(listings.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSimilarListings(categoryId: number, excludeId: string, limitCount = 4) {
  const rows = await cardJoin
    .where(and(eq(listings.categoryId, categoryId), ne(listings.id, excludeId), eq(listings.status, "active")))
    .orderBy(desc(listings.featured), desc(listings.createdAt))
    .limit(limitCount);
  return rows as unknown as ListingCard[];
}

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.sort));
}

export async function getCities() {
  return db.select().from(cities).orderBy(asc(cities.featured), asc(cities.id));
}

export async function getFeaturedListings(limitCount = 10) {
  const rows = await cardJoin
    .where(and(eq(listings.status, "active"), eq(listings.featured, true)))
    .orderBy(desc(listings.createdAt))
    .limit(limitCount);
  if (rows.length >= limitCount) return rows as unknown as ListingCard[];
  const extra = await cardJoin
    .where(and(eq(listings.status, "active"), ne(listings.featured, true)))
    .orderBy(desc(listings.views), desc(listings.createdAt))
    .limit(limitCount - rows.length);
  return [...rows, ...extra] as unknown as ListingCard[];
}

export async function getLatestListings(limitCount = 8) {
  const rows = await cardJoin
    .where(eq(listings.status, "active"))
    .orderBy(desc(listings.createdAt))
    .limit(limitCount);
  return rows as unknown as ListingCard[];
}

export async function getCategoryCounts() {
  const rows = await db
    .select({ categoryId: listings.categoryId, value: dcount() })
    .from(listings)
    .where(eq(listings.status, "active"))
    .groupBy(listings.categoryId);
  const map = new Map<number, number>();
  rows.forEach((r) => map.set(r.categoryId, r.value));
  return map;
}

export async function getStats() {
  const [ads] = await db
    .select({ value: dcount() })
    .from(listings)
    .where(eq(listings.status, "active"));
  const [sellers] = await db.select({ value: dcount() }).from(users);
  return {
    ads: ads?.value ?? 0,
    sellers: sellers?.value ?? 0,
  };
}

export async function getFavoritesMap(userId: string, listingIds: string[]) {
  if (listingIds.length === 0) return new Set<string>();
  const rows = await db
    .select({ listingId: favorites.listingId })
    .from(favorites)
    .where(eq(favorites.userId, userId));
  const all = new Set(rows.map((r) => r.listingId));
  return all;
}

export async function getFavoritesSet(userId: string | undefined) {
  const set = new Set<string>();
  if (!userId) return set;
  const rows = await db
    .select({ listingId: favorites.listingId })
    .from(favorites)
    .where(eq(favorites.userId, userId));
  rows.forEach((r) => set.add(r.listingId));
  return set;
}

export async function getConversationsFor(userId: string) {
  const rows = await db
    .select({
      conversation: conversations,
      listingTitle: listings.title,
      listingImage: listings.images,
      listingPrice: listings.price,
      listingStatus: listings.status,
      buyerName: sql<string>`(SELECT name FROM users WHERE id = ${conversations.buyerId})`,
      sellerName: sql<string>`(SELECT name FROM users WHERE id = ${conversations.sellerId})`,
      lastMessage: sql<string | null>`(
        SELECT body FROM messages WHERE conversation_id = ${conversations.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
      lastMessageAt: sql<Date | null>`(
        SELECT created_at FROM messages WHERE conversation_id = ${conversations.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
    })
    .from(conversations)
    .innerJoin(listings, eq(conversations.listingId, listings.id))
    .where(sql`${conversations.buyerId} = ${userId} OR ${conversations.sellerId} = ${userId}`)
    .orderBy(desc(conversations.updatedAt));
  return rows;
}
