import { integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"

export const stories = pgTable("stories", {
  id: uuid("id").primaryKey().defaultRandom(), author: text("author").notNull(), body: text("body").notNull(), mood: text("mood"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const storyMedia = pgTable("story_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  storyId: uuid("story_id").notNull(),
  type: text("type", { enum: ["image", "video"] }).notNull(),
  blobPath: text("blob_path").notNull(),
  posterPath: text("poster_path"),
  durationSeconds: integer("duration_seconds"),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [unique().on(table.storyId, table.position)])

export const reactions = pgTable("reactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  storyId: uuid("story_id").notNull(),
  author: text("author", { enum: ["a", "b"] }).notNull(),
  reaction: text("reaction", { enum: ["angry", "happy", "sad", "love", "lol", "poop"] }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [unique().on(table.storyId, table.author, table.reaction)])

export const replies = pgTable("replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  storyId: uuid("story_id").notNull(),
  author: text("author", { enum: ["a", "b"] }).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  author: text("author", { enum: ["a", "b"] }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const loginAttempts = pgTable("login_rate_limits", {
  key: text("ip_hash").primaryKey(), attempts: integer("failed_count").notNull().default(0), blockedUntil: timestamp("locked_until", { withTimezone: true }), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(), author: text("author").notNull(), endpoint: text("endpoint").notNull().unique(), p256dh: text("p256dh").notNull(), auth: text("auth").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
