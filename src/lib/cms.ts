import { db } from "@/db";
import { cmsBlocks, siteSettings } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export type Settings = Record<string, string>;

const cache = new Map<string, string>();
let cacheLoaded = false;
let cachePromise: Promise<void> | null = null;

async function loadSettings(): Promise<void> {
  try {
    const rows = await db.select().from(siteSettings);
    cache.clear();
    for (const r of rows) cache.set(r.key, r.value);
    cacheLoaded = true;
  } catch {
    cacheLoaded = false;
  }
}

export async function getSiteSettings(): Promise<Settings> {
  if (!cacheLoaded) {
    if (!cachePromise) cachePromise = loadSettings().finally(() => { cachePromise = null; });
    await cachePromise;
  }
  return Object.fromEntries(cache);
}

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const s = await getSiteSettings();
  return s[key] ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
  cache.set(key, value);
  cacheLoaded = true;
}

export function invalidateSettingsCache(): void {
  cacheLoaded = false;
}

export type BlockSection =
  | "hero"
  | "marquee"
  | "why"
  | "cta"
  | "footer_about"
  | "guide_do"
  | "guide_dont"
  | "guide_steps"
  | "footer_hot";

export type BlockInput = {
  id?: string;
  section: BlockSection;
  sort?: number;
  title?: string;
  subtitle?: string;
  body?: string;
  image?: string;
  icon?: string;
  link?: string;
};

export async function getBlocks(section: BlockSection) {
  try {
    return await db
      .select()
      .from(cmsBlocks)
      .where(eq(cmsBlocks.section, section))
      .orderBy(asc(cmsBlocks.sort), asc(cmsBlocks.id));
  } catch {
    return [];
  }
}

export async function upsertBlock(block: BlockInput): Promise<string> {
  const base = {
    section: block.section,
    title: block.title ?? "",
    subtitle: block.subtitle ?? "",
    body: block.body ?? "",
    image: block.image ?? "",
    icon: block.icon ?? "",
    link: block.link ?? "",
    sort: block.sort ?? 0,
    updatedAt: new Date(),
  };
  if (block.id) {
    await db.update(cmsBlocks).set(base).where(eq(cmsBlocks.id, block.id));
    return block.id;
  }
  const [inserted] = await db.insert(cmsBlocks).values(base).returning({ id: cmsBlocks.id });
  return inserted.id;
}

export async function deleteBlock(id: string): Promise<void> {
  await db.delete(cmsBlocks).where(eq(cmsBlocks.id, id));
}

export async function reorderBlocks(section: BlockSection, orderedIds: string[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(cmsBlocks).set({ sort: i }).where(eq(cmsBlocks.id, orderedIds[i]));
  }
}
