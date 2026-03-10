// Conversation Service — Thread & message management using conversations schema
// Handles ChatGPT-style conversation history with date grouping

import { pool } from "../../lib/db-pool.js";

export interface Thread {
  id: string;
  user_id: string | null;
  title: string;
  session_id: string;
  model: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  message_count?: number;
}

export interface Message {
  id: string;
  thread_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  structured_data: unknown;
  tokens_used: number | null;
  duration_ms: number | null;
  created_at: string;
}

export interface GroupedThreads {
  today: Thread[];
  yesterday: Thread[];
  last7Days: Thread[];
  older: Thread[];
}

/**
 * Create a new conversation thread.
 */
export async function createThread(
  sessionId: string,
  userId?: string,
  title?: string,
  model?: string,
): Promise<Thread> {
  const result = await pool.query(
    `INSERT INTO conversations.threads (session_id, user_id, title, model)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      sessionId,
      userId ?? null,
      title ?? "New Conversation",
      model ?? "llama-3.3-70b-versatile",
    ],
  );
  return result.rows[0] as Thread;
}

/**
 * Update a thread title (auto-generated from first message).
 */
export async function updateThreadTitle(
  threadId: string,
  title: string,
): Promise<void> {
  const safeTitle = title.slice(0, 100);
  await pool.query(
    `UPDATE conversations.threads SET title = $1, updated_at = now() WHERE id = $2`,
    [safeTitle, threadId],
  );
}

/**
 * Save a message to a thread.
 */
export async function saveMessage(
  threadId: string,
  role: "user" | "assistant",
  content: string,
  structuredData?: unknown,
  tokensUsed?: number,
  durationMs?: number,
): Promise<Message> {
  const result = await pool.query(
    `INSERT INTO conversations.messages (thread_id, role, content, structured_data, tokens_used, duration_ms)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      threadId,
      role,
      content,
      structuredData ? JSON.stringify(structuredData) : null,
      tokensUsed ?? null,
      durationMs ?? null,
    ],
  );
  return result.rows[0] as Message;
}

/**
 * Get all messages for a thread (ordered chronologically).
 */
export async function getThreadMessages(threadId: string): Promise<Message[]> {
  const result = await pool.query(
    `SELECT * FROM conversations.messages
     WHERE thread_id = $1
     ORDER BY created_at ASC`,
    [threadId],
  );
  return result.rows as Message[];
}

/**
 * Get a single thread by ID.
 */
export async function getThread(threadId: string): Promise<Thread | null> {
  const result = await pool.query(
    `SELECT t.*, 
       (SELECT COUNT(*) FROM conversations.messages WHERE thread_id = t.id) as message_count
     FROM conversations.threads t
     WHERE t.id = $1`,
    [threadId],
  );
  return (result.rows[0] as Thread) ?? null;
}

/**
 * List conversation threads for a user/session, grouped by date.
 */
export async function listThreads(
  sessionId: string,
  userId?: string,
): Promise<GroupedThreads> {
  const whereClause = userId
    ? `(t.user_id = $1 OR t.session_id = $2)`
    : `t.session_id = $1`;
  const params = userId ? [userId, sessionId] : [sessionId];

  const result = await pool.query(
    `SELECT t.*,
       (SELECT COUNT(*) FROM conversations.messages WHERE thread_id = t.id) as message_count
     FROM conversations.threads t
     WHERE ${whereClause} AND t.is_archived = false
     ORDER BY t.updated_at DESC
     LIMIT 50`,
    params,
  );

  const threads = result.rows as Thread[];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

  const grouped: GroupedThreads = {
    today: [],
    yesterday: [],
    last7Days: [],
    older: [],
  };

  for (const thread of threads) {
    const updatedAt = new Date(thread.updated_at);
    if (updatedAt >= todayStart) {
      grouped.today.push(thread);
    } else if (updatedAt >= yesterdayStart) {
      grouped.yesterday.push(thread);
    } else if (updatedAt >= weekStart) {
      grouped.last7Days.push(thread);
    } else {
      grouped.older.push(thread);
    }
  }

  return grouped;
}

/**
 * Delete a thread and all its messages.
 */
export async function deleteThread(threadId: string): Promise<void> {
  await pool.query(`DELETE FROM conversations.threads WHERE id = $1`, [
    threadId,
  ]);
}

/**
 * Archive a thread (soft delete).
 */
export async function archiveThread(threadId: string): Promise<void> {
  await pool.query(
    `UPDATE conversations.threads SET is_archived = true, updated_at = now() WHERE id = $1`,
    [threadId],
  );
}

/**
 * Get recent messages for context (last N messages from a thread).
 */
export async function getRecentMessages(
  threadId: string,
  limit = 20,
): Promise<Array<{ role: string; content: string }>> {
  const result = await pool.query(
    `SELECT role, content FROM conversations.messages
     WHERE thread_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [threadId, limit],
  );
  return result.rows as Array<{ role: string; content: string }>;
}

/**
 * Generate a title from the first message (first 6 words + "...").
 */
export function generateTitle(firstMessage: string): string {
  const words = firstMessage.trim().split(/\s+/).slice(0, 6);
  const title = words.join(" ");
  return title.length < firstMessage.trim().length ? `${title}...` : title;
}
