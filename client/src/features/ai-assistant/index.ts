// AI Assistant Feature — Barrel Export
export { ChatContainer } from "./components/chat-container";
export { EmptyChat } from "./components/empty-chat";
export { useChat } from "./hooks/use-chat";
export {
  fetchTrendingQuestions,
  fetchConversations,
  fetchConversation,
  deleteConversationApi,
} from "./api";
export type {
  ChatMessage,
  Conversation,
  AIHealthStatus,
  TrendingQuestion,
  StructuredData,
  GroupedConversations,
} from "./types";
