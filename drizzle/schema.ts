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
 * Feedbacks table for storing user feedback from Director's Mailbox
 */
export const feedbacks = mysqlTable("feedbacks", {
  id: int("id").autoincrement().primaryKey(),
  /** User's nickname (required) */
  nickname: varchar("nickname", { length: 100 }).notNull(),
  /** Contact information (optional, email or WeChat) */
  contact: varchar("contact", { length: 320 }),
  /** Feedback message content (required) */
  message: text("message").notNull(),
  /** Whether the feedback has been read by admin */
  isRead: int("isRead").default(0).notNull(),
  /** Timestamp when feedback was submitted */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;
/**
 * Messages table for storing message board posts
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  /** User's nickname (required, 2-20 characters) */
  nickname: varchar("nickname", { length: 100 }).notNull(),
  /** Optional rank/level (e.g., "业余1段", "业余5段") */
  rank: varchar("rank", { length: 50 }),
  /** Message content (required, 10-500 characters) */
  content: text("content").notNull(),
  /** Number of likes */
  likes: int("likes").default(0).notNull(),
  /** Whether the message is pinned (1 = pinned, 0 = not pinned) */
  isPinned: int("isPinned").default(0).notNull(),
  /** User ID of the message author (nullable for anonymous messages) */
  userId: int("userId"),
  /** Timestamp when message was posted */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Timestamp when message was last edited (null if never edited) */
  editedAt: timestamp("editedAt"),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
