// AI Feature — Shared Types

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
  messages?: ChatMessage[];
}

export interface ConversationListResponse {
  success: boolean;
  data: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SendMessagePayload {
  message: string;
  conversationId?: string;
  sessionId: string;
  model?: string;
  stream?: boolean;
}

export interface SSEChunk {
  type: "meta" | "chunk" | "done" | "error";
  conversationId?: string;
  content?: string;
  done?: boolean;
  messageId?: string;
  tokenCount?: number;
  durationMs?: number;
  error?: string;
}

export interface AIHealthStatus {
  online: boolean;
  model: string;
  modelAvailable: boolean;
}
