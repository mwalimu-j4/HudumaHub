// AI Feature — Shared Types

export interface StructuredStep {
  number: number;
  text: string;
}

export interface StructuredFee {
  amount: string;
  description: string;
}

export interface StructuredLink {
  url: string;
  label: string;
}

export interface StructuredData {
  steps: StructuredStep[];
  fees: StructuredFee[];
  links: StructuredLink[];
  hasSteps: boolean;
  hasFees: boolean;
  hasLinks: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  isStreaming?: boolean;
  fromCache?: boolean;
  structuredData?: StructuredData;
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

export interface GroupedConversations {
  today: Conversation[];
  yesterday: Conversation[];
  last7Days: Conversation[];
  older: Conversation[];
}

export interface ConversationListResponse {
  success: boolean;
  data: Conversation[];
  grouped?: GroupedConversations;
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
  fromCache?: boolean;
  structuredData?: StructuredData;
}

export interface TrendingQuestion {
  question_text: string;
  hit_count: number;
  category: string;
}

export interface AIHealthStatus {
  online: boolean;
  model: string;
  modelAvailable: boolean;
}
