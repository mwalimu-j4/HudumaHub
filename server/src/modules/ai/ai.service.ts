// AI Service Layer — Business Logic for AI Chat
// Handles conversation persistence and Ollama interaction

import { prisma } from "../../prisma/client.js";
import { streamChat, chat, type ChatMessage } from "../../lib/ollama.js";
import { buildSystemMessages } from "./ai.prompt.js";
import type { SendMessageInput } from "./ai.validation.js";

/**
 * Get or create a conversation, then stream the AI response.
 * Returns an async generator for Server-Sent Events.
 */
export async function handleChatStream(input: SendMessageInput) {
  const { message, conversationId, sessionId, model } = input;

  // Get or create conversation
  let convoId = conversationId;
  if (!convoId) {
    const conversation = await prisma.conversation.create({
      data: {
        sessionId,
        model: model ?? "llama3.2",
        title: message.slice(0, 80),
      },
    });
    convoId = conversation.id;
  }

  // Save user message
  await prisma.message.create({
    data: {
      conversationId: convoId,
      role: "USER",
      content: message,
    },
  });

  // Load conversation history (last 20 messages for context window)
  const history = await prisma.message.findMany({
    where: { conversationId: convoId },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { role: true, content: true },
  });

  // Build messages array for Ollama
  const ollamaMessages: ChatMessage[] = buildSystemMessages(
    history.map((m) => ({
      role: m.role.toLowerCase() as "user" | "assistant",
      content: m.content,
    })),
  );

  // Stream response
  const stream = streamChat(ollamaMessages, model);

  return { conversationId: convoId, stream };
}

/**
 * Non-streaming chat completion — saves full response once done.
 */
export async function handleChatComplete(input: SendMessageInput) {
  const { message, conversationId, sessionId, model } = input;

  // Get or create conversation
  let convoId = conversationId;
  if (!convoId) {
    const conversation = await prisma.conversation.create({
      data: {
        sessionId,
        model: model ?? "llama3.2",
        title: message.slice(0, 80),
      },
    });
    convoId = conversation.id;
  }

  // Save user message
  await prisma.message.create({
    data: {
      conversationId: convoId,
      role: "USER",
      content: message,
    },
  });

  // Load conversation history
  const history = await prisma.message.findMany({
    where: { conversationId: convoId },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { role: true, content: true },
  });

  const ollamaMessages: ChatMessage[] = buildSystemMessages(
    history.map((m) => ({
      role: m.role.toLowerCase() as "user" | "assistant",
      content: m.content,
    })),
  );

  const result = await chat(ollamaMessages, model);

  // Save assistant response
  const assistantMessage = await prisma.message.create({
    data: {
      conversationId: convoId,
      role: "ASSISTANT",
      content: result.content,
      durationMs: result.totalDuration
        ? Math.round(result.totalDuration / 1_000_000)
        : undefined,
      tokenCount: result.evalCount,
    },
  });

  return {
    conversationId: convoId,
    message: {
      id: assistantMessage.id,
      role: "assistant" as const,
      content: result.content,
      createdAt: assistantMessage.createdAt.toISOString(),
    },
  };
}

/**
 * Save the final streamed assistant message to DB.
 */
export async function saveAssistantMessage(
  conversationId: string,
  content: string,
  durationMs?: number,
  tokenCount?: number,
) {
  return prisma.message.create({
    data: {
      conversationId,
      role: "ASSISTANT",
      content,
      durationMs,
      tokenCount,
    },
  });
}

/**
 * Get a conversation with all its messages.
 */
export async function getConversation(conversationId: string) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          tokenCount: true,
          durationMs: true,
          createdAt: true,
        },
      },
    },
  });
}

/**
 * List conversations for a session.
 */
export async function listConversations(
  sessionId: string,
  page: number,
  limit: number,
) {
  const skip = (page - 1) * limit;
  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: { sessionId },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        model: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    }),
    prisma.conversation.count({ where: { sessionId } }),
  ]);

  return {
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Delete a conversation and its messages (cascading).
 */
export async function deleteConversation(conversationId: string) {
  return prisma.conversation.delete({
    where: { id: conversationId },
  });
}
