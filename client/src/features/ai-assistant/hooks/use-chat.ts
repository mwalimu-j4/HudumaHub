// AI Feature — useChat Hook
// Manages chat state, streaming, and conversation persistence

import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { streamChatMessage } from "../api";
import type { ChatMessage } from "../types";

const SESSION_STORAGE_KEY = "hudumahub-session-id";

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

interface UseChatOptions {
  conversationId?: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  sendMessage: (content: string) => Promise<void>;
  stopGenerating: () => void;
  clearChat: () => void;
  setConversationId: (id: string | null) => void;
}

export function useChat(options?: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(
    options?.conversationId ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionId = useRef(getSessionId()).current;

  // Reset when conversationId changes externally
  useEffect(() => {
    if (options?.conversationId && options.conversationId !== conversationId) {
      setConversationId(options.conversationId);
    }
  }, [options?.conversationId, conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);
      setIsLoading(true);

      // Add user message
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      // Add placeholder assistant message for streaming
      const assistantMessage: ChatMessage = {
        id: `streaming-${Date.now()}`,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        await streamChatMessage(
          {
            message: content.trim(),
            conversationId: conversationId ?? undefined,
            sessionId,
          },
          {
            onMeta: (newConversationId) => {
              setConversationId(newConversationId);
            },
            onChunk: (chunkContent) => {
              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg && lastMsg.isStreaming) {
                  updated[updated.length - 1] = {
                    ...lastMsg,
                    content: lastMsg.content + chunkContent,
                  };
                }
                return updated;
              });
            },
            onDone: (data) => {
              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg && lastMsg.isStreaming) {
                  updated[updated.length - 1] = {
                    ...lastMsg,
                    id: data.messageId ?? lastMsg.id,
                    isStreaming: false,
                  };
                }
                return updated;
              });
              setIsLoading(false);
            },
            onError: (errMsg) => {
              setError(errMsg);
              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg && lastMsg.isStreaming) {
                  updated[updated.length - 1] = {
                    ...lastMsg,
                    content: "Sorry, I encountered an error. Please try again.",
                    isStreaming: false,
                  };
                }
                return updated;
              });
              setIsLoading(false);
            },
          },
          abortController.signal,
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // User cancelled — finalize the streaming message
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.isStreaming) {
              updated[updated.length - 1] = {
                ...lastMsg,
                isStreaming: false,
                content: lastMsg.content || "Response was cancelled.",
              };
            }
            return updated;
          });
        } else {
          setError((err as Error).message);
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.isStreaming) {
              updated[updated.length - 1] = {
                ...lastMsg,
                content:
                  "Sorry, I couldn't connect to the AI service. Please try again later.",
                isStreaming: false,
              };
            }
            return updated;
          });
        }
        setIsLoading(false);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [conversationId, isLoading, sessionId],
  );

  const stopGenerating = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    conversationId,
    isLoading,
    error,
    sessionId,
    sendMessage,
    stopGenerating,
    clearChat,
    setConversationId,
  };
}
