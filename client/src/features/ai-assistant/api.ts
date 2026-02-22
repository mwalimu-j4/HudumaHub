// AI Feature — API Layer
// Handles SSE streaming and REST calls to the AI backend

import type {
  SendMessagePayload,
  SSEChunk,
  ConversationListResponse,
  Conversation,
  AIHealthStatus,
} from "./types";

const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD
    ? "https://huduma-jqiq.onrender.com/api"
    : "http://localhost:5000/api");

/**
 * Stream a chat message via SSE.
 * Calls onChunk for each streamed piece, onDone when complete.
 */
export async function streamChatMessage(
  payload: SendMessagePayload,
  callbacks: {
    onMeta: (conversationId: string) => void;
    onChunk: (content: string) => void;
    onDone: (data: SSEChunk) => void;
    onError: (error: string) => void;
  },
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, stream: true }),
    signal,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(errorData?.error ?? `HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const dataLine = line.trim();
      if (!dataLine.startsWith("data: ")) continue;

      const jsonStr = dataLine.slice(6);
      try {
        const chunk = JSON.parse(jsonStr) as SSEChunk;

        switch (chunk.type) {
          case "meta":
            if (chunk.conversationId) {
              callbacks.onMeta(chunk.conversationId);
            }
            break;
          case "chunk":
            if (chunk.content) {
              callbacks.onChunk(chunk.content);
            }
            break;
          case "done":
            callbacks.onDone(chunk);
            break;
          case "error":
            callbacks.onError(chunk.error ?? "Unknown error");
            break;
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }
}

/**
 * Send a non-streaming chat message.
 */
export async function sendChatMessage(payload: SendMessagePayload): Promise<{
  conversationId: string;
  message: {
    id: string;
    role: "assistant";
    content: string;
    createdAt: string;
  };
}> {
  const response = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, stream: false }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(errorData?.error ?? `HTTP ${response.status}`);
  }

  const json = (await response.json()) as {
    success: boolean;
    data: {
      conversationId: string;
      message: {
        id: string;
        role: "assistant";
        content: string;
        createdAt: string;
      };
    };
  };
  return json.data;
}

/**
 * Fetch conversation history.
 */
export async function fetchConversation(
  conversationId: string,
): Promise<Conversation> {
  const response = await fetch(
    `${API_BASE}/ai/conversations/${conversationId}`,
  );
  if (!response.ok) throw new Error("Failed to fetch conversation");
  const json = (await response.json()) as {
    success: boolean;
    data: Conversation;
  };
  return json.data;
}

/**
 * List conversations for a session.
 */
export async function fetchConversations(
  sessionId: string,
  page = 1,
  limit = 20,
): Promise<ConversationListResponse> {
  const params = new URLSearchParams({
    sessionId,
    page: String(page),
    limit: String(limit),
  });
  const response = await fetch(`${API_BASE}/ai/conversations?${params}`);
  if (!response.ok) throw new Error("Failed to fetch conversations");
  return response.json() as Promise<ConversationListResponse>;
}

/**
 * Delete a conversation.
 */
export async function deleteConversationApi(
  conversationId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/ai/conversations/${conversationId}`,
    { method: "DELETE" },
  );
  if (!response.ok) throw new Error("Failed to delete conversation");
}

/**
 * Check AI service health.
 */
export async function checkAIHealth(): Promise<AIHealthStatus> {
  const response = await fetch(`${API_BASE}/ai/health`);
  const json = (await response.json()) as {
    success: boolean;
    data: AIHealthStatus;
  };
  return json.data;
}
