// Chat Container — Main chat UI with sidebar, messages, and input
import { useRef, useEffect, useState, useCallback } from "react";
import { Bot, Menu, PenSquare } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { EmptyChat } from "./empty-chat";
import { ConversationSidebar } from "./conversation-sidebar";
import { useChat } from "../hooks/use-chat";
import { fetchConversation } from "../api";

interface ChatContainerProps {
  conversationId?: string;
  initialQuery?: string;
}

export function ChatContainer({
  conversationId: initialConvId,
  initialQuery,
}: ChatContainerProps) {
  const {
    messages,
    isLoading,
    conversationId,
    sessionId,
    sendMessage,
    stopGenerating,
    clearChat,
    setConversationId,
    loadMessages,
  } = useChat({ conversationId: initialConvId });

  const scrollRef = useRef<HTMLDivElement>(null);
  const initialQuerySent = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-send initial query from landing page
  useEffect(() => {
    if (initialQuery && !initialQuerySent.current && messages.length === 0) {
      initialQuerySent.current = true;
      void sendMessage(initialQuery);
    }
  }, [initialQuery, messages.length, sendMessage]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleSelectPrompt = useCallback(
    (prompt: string) => {
      void sendMessage(prompt);
    },
    [sendMessage],
  );

  const handleNewChat = useCallback(() => {
    clearChat();
  }, [clearChat]);

  const handleSelectThread = useCallback(
    async (threadId: string) => {
      try {
        const conversation = await fetchConversation(threadId);
        if (conversation?.messages) {
          setConversationId(threadId);
          loadMessages(
            conversation.messages.map((m) => ({
              id: m.id,
              role: m.role.toLowerCase() as "user" | "assistant",
              content: m.content,
              createdAt: m.createdAt,
              structuredData: m.structuredData,
            })),
          );
        }
      } catch {
        // fail silently
      }
    },
    [setConversationId, loadMessages],
  );

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-1 huduma-chat-bg overflow-hidden">
      {/* Sidebar */}
      <ConversationSidebar
        sessionId={sessionId}
        activeThreadId={conversationId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chat Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[#0a0f0a]/95 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-[#9ca3af] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors lg:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Bot className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white">
                  HudumaHub Assistant
                </h1>
                <p className="text-[10px] text-[#6b7280]">
                  AI-powered civic services guide
                </p>
              </div>
            </div>
          </div>
          {hasMessages && (
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#9ca3af] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
            >
              <PenSquare className="h-3.5 w-3.5" />
              New Chat
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
        >
          {!hasMessages ? (
            <EmptyChat onSelectPrompt={handleSelectPrompt} />
          ) : (
            <div className="mx-auto w-full max-w-3xl pb-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0">
          <ChatInput
            onSend={sendMessage}
            onStop={stopGenerating}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
