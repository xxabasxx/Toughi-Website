import {
  pgTable,
  uuid,
  varchar,
  text,
  bigint,
  boolean,
  integer,
  timestamp,
  jsonb,
  serial,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 140 }).notNull(),
  shop: varchar("shop", { length: 160 }),
  city: varchar("city", { length: 60 }),
  role: varchar("role", { length: 20 }).notNull().default("user"), // user | admin
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cmsBlocks = pgTable(
  "cms_blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    section: varchar("section", { length: 60 }).notNull(),
    sort: integer("sort").notNull().default(0),
    title: varchar("title", { length: 300 }).notNull().default(""),
    subtitle: varchar("subtitle", { length: 400 }).notNull().default(""),
    body: text("body").notNull().default(""),
    image: text("image").notNull().default(""),
    icon: varchar("icon", { length: 60 }).notNull().default(""),
    link: varchar("link", { length: 400 }).notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("cms_blocks_section_idx").on(t.section, t.sort)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    token: text("token").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_token_idx").on(t.token)],
);

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumed: boolean("consumed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  featured: boolean("featured").notNull().default(false),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  kind: varchar("kind", { length: 20 }).notNull(), // birds | pets | gear
  icon: varchar("icon", { length: 60 }).notNull().default("feather"),
  image: text("image"),
  sort: integer("sort").notNull().default(0),
});

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    cityId: integer("city_id")
      .notNull()
      .references(() => cities.id),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description").notNull().default(""),
    price: bigint("price", { mode: "number" }),
    negotiable: boolean("negotiable").notNull().default(false),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    attributes: jsonb("attributes").$type<Record<string, string>>().notNull().default({}),
    status: varchar("status", { length: 20 }).notNull().default("active"), // active | sold | hidden
    featured: boolean("featured").notNull().default(false),
    views: integer("views").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("listings_status_idx").on(t.status),
    index("listings_category_idx").on(t.categoryId),
    index("listings_city_idx").on(t.cityId),
    index("listings_created_idx").on(t.createdAt),
    index("listings_user_idx").on(t.userId),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("favorites_user_listing_unique").on(t.userId, t.listingId)],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("conversations_unique").on(t.listingId, t.buyerId)],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId, t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type CmsBlock = typeof cmsBlocks.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
