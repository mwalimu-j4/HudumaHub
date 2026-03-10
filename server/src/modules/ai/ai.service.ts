// AI Service Layer — Business Logic for AI Chat
// Integrates caching, conversation threads, analytics, and AI streaming

import { prisma } from "../../prisma/client.js";
import { streamChat, chat, type ChatMessage } from "../../lib/ai-client.js";
import { buildSystemMessages } from "./ai.prompt.js";
import { parseStructuredData } from "./structured-parser.js";
import {
  checkCache,
  storeInCache,
  detectCategory,
  getQuestionHash,
} from "../cache/index.js";
import {
  createThread,
  updateThreadTitle,
  saveMessage as saveThreadMessage,
  getRecentMessages,
  generateTitle,
  getThreadMessages,
  listThreads as listConversationThreads,
  deleteThread,
  getThread,
} from "../conversations/index.js";
import { logQueryEvent } from "../analytics/index.js";
import type { SendMessageInput } from "./ai.validation.js";

/** Max character length for AI responses */
const MAX_RESPONSE_LENGTH = 800;

/** Phrases that should never appear in a government assistant response */
const FORBIDDEN_PHRASES = [
  "let me know",
  "feel free",
  "i will guide you",
  "i'll guide you",
  "don't worry",
  "no worries",
  "great question",
  "good question",
  "sure!",
  "of course!",
  "absolutely!",
  "i hope this helps",
  "i understand how",
  "happy to help",
  "glad to help",
  "oh no",
  "that's a great",
  "that sounds",
];

/**
 * Sanitize AI response: trim length, strip forbidden filler phrases.
 */
function sanitizeResponse(text: string): string {
  let cleaned = text;

  for (const phrase of FORBIDDEN_PHRASES) {
    const regex = new RegExp(phrase, "gi");
    cleaned = cleaned.replace(regex, "");
  }

  cleaned = cleaned.replace(
    /^(hello[!,.]?\s*|hi[!,.]?\s*|hey[!,.]?\s*|greetings[!,.]?\s*)/i,
    "",
  );

  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.trim();

  if (cleaned.length > MAX_RESPONSE_LENGTH) {
    const truncated = cleaned.slice(0, MAX_RESPONSE_LENGTH);
    const lastNewline = truncated.lastIndexOf("\n");
    const lastPeriod = truncated.lastIndexOf(".");
    const cutPoint = Math.max(lastNewline, lastPeriod);
    cleaned =
      cutPoint > 0 ? truncated.slice(0, cutPoint + 1).trim() : truncated.trim();
  }

  return cleaned;
}

/**
 * Handle a chat message with cache-first strategy.
 * Returns cached response or streams new AI response.
 */
export async function handleChatStream(input: SendMessageInput) {
  const { message, conversationId, sessionId, model } = input;
  const startTime = Date.now();

  // Step 1: Get or create conversation thread (split schema)
  let threadId = conversationId;
  if (!threadId) {
    const thread = await createThread(
      sessionId,
      undefined,
      generateTitle(message),
      model,
    );
    threadId = thread.id;
  } else {
    // Also update the legacy Prisma table for backwards compat
  }

  // Step 2: Check cache FIRST
  const cached = await checkCache(message);
  if (cached) {
    const latency = Date.now() - startTime;
    const category = detectCategory(message);
    const hash = getQuestionHash(message);

    // Save to conversation history
    await saveThreadMessage(threadId, "user", message);
    await saveThreadMessage(
      threadId,
      "assistant",
      cached.answer_text,
      cached.structured_data,
    );

    // Log analytics
    await logQueryEvent(hash, true, latency, category).catch(() => {});

    // Return cached response as a single-chunk "stream"
    async function* cachedStream(): AsyncGenerator<{
      content: string;
      done: boolean;
      fromCache: boolean;
    }> {
      yield { content: cached!.answer_text, done: true, fromCache: true };
    }

    return {
      conversationId: threadId,
      stream: cachedStream(),
      fromCache: true,
      structuredData: cached.structured_data,
    };
  }

  // Step 3: Cache miss — save user message and stream AI response
  await saveThreadMessage(threadId, "user", message);

  // Load conversation context
  const history = await getRecentMessages(threadId, 20);
  const aiMessages: ChatMessage[] = buildSystemMessages(
    history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  );

  const stream = streamChat(aiMessages, model);

  return { conversationId: threadId, stream, fromCache: false };
}

/**
 * Non-streaming chat with caching.
 */
export async function handleChatComplete(input: SendMessageInput) {
  const { message, conversationId, sessionId, model } = input;
  const startTime = Date.now();

  let threadId = conversationId;
  if (!threadId) {
    const thread = await createThread(
      sessionId,
      undefined,
      generateTitle(message),
      model,
    );
    threadId = thread.id;
  }

  // Check cache first
  const cached = await checkCache(message);
  if (cached) {
    const latency = Date.now() - startTime;
    await saveThreadMessage(threadId, "user", message);
    const saved = await saveThreadMessage(
      threadId,
      "assistant",
      cached.answer_text,
      cached.structured_data,
    );
    await logQueryEvent(
      getQuestionHash(message),
      true,
      latency,
      detectCategory(message),
    ).catch(() => {});

    return {
      conversationId: threadId,
      message: {
        id: saved.id,
        role: "assistant" as const,
        content: cached.answer_text,
        structuredData: cached.structured_data,
        createdAt: saved.created_at,
        fromCache: true,
      },
    };
  }

  // Cache miss
  await saveThreadMessage(threadId, "user", message);

  const history = await getRecentMessages(threadId, 20);
  const aiMessages: ChatMessage[] = buildSystemMessages(
    history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  );

  const result = await chat(aiMessages, model);
  const cleanedContent = sanitizeResponse(result.content);
  const structured = parseStructuredData(cleanedContent);

  // Save to cache and conversation
  const category = detectCategory(message);
  await storeInCache(message, cleanedContent, structured, category).catch(
    () => {},
  );

  const saved = await saveThreadMessage(
    threadId,
    "assistant",
    cleanedContent,
    structured,
    result.evalCount,
    result.totalDuration,
  );

  const latency = Date.now() - startTime;
  await logQueryEvent(getQuestionHash(message), false, latency, category).catch(
    () => {},
  );

  return {
    conversationId: threadId,
    message: {
      id: saved.id,
      role: "assistant" as const,
      content: cleanedContent,
      structuredData: structured,
      createdAt: saved.created_at,
      fromCache: false,
    },
  };
}

/**
 * Save the final streamed assistant message + cache it.
 */
export async function saveAssistantMessage(
  conversationId: string,
  content: string,
  durationMs?: number,
  tokenCount?: number,
  originalQuestion?: string,
) {
  const cleanedContent = sanitizeResponse(content);
  const structured = parseStructuredData(cleanedContent);

  // Save to split-schema conversation
  const saved = await saveThreadMessage(
    conversationId,
    "assistant",
    cleanedContent,
    structured,
    tokenCount,
    durationMs,
  );

  // Cache the response for future hits
  if (originalQuestion) {
    const category = detectCategory(originalQuestion);
    await storeInCache(
      originalQuestion,
      cleanedContent,
      structured,
      category,
    ).catch(() => {});

    const latency = durationMs ?? 0;
    await logQueryEvent(
      getQuestionHash(originalQuestion),
      false,
      latency,
      category,
    ).catch(() => {});
  }

  return saved;
}

/**
 * Get a conversation thread with all messages.
 */
export async function getConversation(conversationId: string) {
  const thread = await getThread(conversationId);
  if (!thread) return null;

  const messages = await getThreadMessages(conversationId);
  return {
    id: thread.id,
    title: thread.title,
    model: thread.model,
    createdAt: thread.created_at,
    updatedAt: thread.updated_at,
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      structuredData: m.structured_data,
      tokensUsed: m.tokens_used,
      durationMs: m.duration_ms,
      createdAt: m.created_at,
    })),
  };
}

/**
 * List conversations for a session, grouped by date.
 */
export async function listConversations(
  sessionId: string,
  page: number,
  limit: number,
) {
  const grouped = await listConversationThreads(sessionId);

  // Flatten for pagination
  const all = [
    ...grouped.today,
    ...grouped.yesterday,
    ...grouped.last7Days,
    ...grouped.older,
  ];
  const total = all.length;
  const start = (page - 1) * limit;
  const paginated = all.slice(start, start + limit);

  return {
    conversations: paginated.map((t) => ({
      id: t.id,
      title: t.title,
      model: t.model,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      _count: { messages: Number(t.message_count ?? 0) },
    })),
    grouped,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Delete a conversation.
 */
export async function deleteConversation(conversationId: string) {
  await deleteThread(conversationId);
  return { deleted: true };
}
