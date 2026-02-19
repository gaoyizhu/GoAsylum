import { count, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { feedbacks, InsertFeedback, InsertUser, messages, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Insert a new feedback into the database
 */
export async function createFeedback(feedback: InsertFeedback): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create feedback: database not available");
    throw new Error("Database not available");
  }

  try {
    await db.insert(feedbacks).values(feedback);
  } catch (error) {
    console.error("[Database] Failed to create feedback:", error);
    throw error;
  }
}

/**
 * Get all feedbacks ordered by creation time (newest first)
 */
export async function getAllFeedbacks() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get feedbacks: database not available");
    return [];
  }

  const result = await db.select().from(feedbacks).orderBy(desc(feedbacks.createdAt));
  return result;
}

/**
 * Mark a feedback as read
 */
export async function markFeedbackAsRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark feedback as read: database not available");
    throw new Error("Database not available");
  }

  try {
    await db.update(feedbacks).set({ isRead: 1 }).where(eq(feedbacks.id, id));
  } catch (error) {
    console.error("[Database] Failed to mark feedback as read:", error);
    throw error;
  }
}

/**
 * Delete a feedback by ID
 */
export async function deleteFeedback(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete feedback: database not available");
    throw new Error("Database not available");
  }

  try {
    await db.delete(feedbacks).where(eq(feedbacks.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete feedback:", error);
    throw error;
  }
}

/**
 * Insert a new message into the database
 */
export async function createMessage(message: { nickname: string; rank?: string; content: string }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create message: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(messages).values(message);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create message:", error);
    throw error;
  }
}

/**
 * Get all messages ordered by creation time (newest first) with pagination
 */
export async function getAllMessages(page: number = 1, pageSize: number = 20) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get messages: database not available");
    return { messages: [], total: 0, page, pageSize, totalPages: 0 };
  }

  // Get total count
  const totalResult = await db.select({ count: count() }).from(messages);
  const total = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Get paginated messages, with pinned messages first
  const offset = (page - 1) * pageSize;
  const result = await db
    .select()
    .from(messages)
    .orderBy(desc(messages.isPinned), desc(messages.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    messages: result,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Increment likes count for a message
 */
export async function likeMessage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot like message: database not available");
    throw new Error("Database not available");
  }

  try {
    const message = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    if (message.length === 0) {
      throw new Error("Message not found");
    }
    
    await db.update(messages).set({ likes: message[0].likes + 1 }).where(eq(messages.id, id));
  } catch (error) {
    console.error("[Database] Failed to like message:", error);
    throw error;
  }
}

/**
 * Delete a message by ID (admin only)
 */
export async function deleteMessage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete message: database not available");
    throw new Error("Database not available");
  }

  try {
    await db.delete(messages).where(eq(messages.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete message:", error);
    throw error;
  }
}

/**
 * Toggle message pin status (admin only)
 */
export async function toggleMessagePin(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot toggle message pin: database not available");
    throw new Error("Database not available");
  }

  try {
    const message = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    if (message.length === 0) {
      throw new Error("Message not found");
    }
    
    // Toggle isPinned: 0 -> 1 or 1 -> 0
    const newPinnedStatus = message[0].isPinned === 1 ? 0 : 1;
    await db.update(messages).set({ isPinned: newPinnedStatus }).where(eq(messages.id, id));
  } catch (error) {
    console.error("[Database] Failed to toggle message pin:", error);
    throw error;
  }
}

// Get message board statistics
export async function getMessageStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const allMessages = await db.select().from(messages).execute();
  
  const totalMessages = allMessages.length;
  const totalLikes = allMessages.reduce((sum, msg) => sum + msg.likes, 0);
  
  // Calculate today's messages
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMessages = allMessages.filter(msg => {
    const msgDate = new Date(msg.createdAt);
    return msgDate >= today;
  }).length;

  return {
    totalMessages,
    totalLikes,
    todayMessages,
  };
}
