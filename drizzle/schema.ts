import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Table pour stocker les sites clonés
 */
export const clonedSites = mysqlTable("clonedSites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  originalUrl: text("originalUrl").notNull(),
  title: text("title"),
  htmlContent: text("htmlContent"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  zipFileUrl: text("zipFileUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClonedSite = typeof clonedSites.$inferSelect;
export type InsertClonedSite = typeof clonedSites.$inferInsert;

/**
 * Table pour stocker les ressources extraites (CSS, JS, images, fonts)
 */
export const clonedResources = mysqlTable("clonedResources", {
  id: int("id").autoincrement().primaryKey(),
  siteId: int("siteId").notNull(),
  resourceType: mysqlEnum("resourceType", ["css", "js", "image", "font", "other"]).notNull(),
  originalUrl: text("originalUrl").notNull(),
  localPath: text("localPath"),
  s3Url: text("s3Url"),
  fileSize: int("fileSize"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClonedResource = typeof clonedResources.$inferSelect;
export type InsertClonedResource = typeof clonedResources.$inferInsert;