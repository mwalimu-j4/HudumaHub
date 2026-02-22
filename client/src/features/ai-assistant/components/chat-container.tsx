// Chat Container — Main chat UI component
// Composes message list, input, and empty state

import { useRef, useEffect } from "react";
import { Bot, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { EmptyChat } from "./empty-chat";
import { useChat } from "../hooks/use-chat";

interface ChatContainerProps {
  conversationId?: string;
  initialQuery?: string;
}

export function ChatContainer({
  conversationId,
  initialQuery,
}: ChatContainerProps) {
  const { messages, isLoading, sendMessage, stopGenerating, clearChat } =
    useChat({ conversationId });

  const scrollRef = useRef<HTMLDivElement>(null);
  const initialQuerySent = useRef(false);

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

  const handleSelectPrompt = (prompt: string) => {
    void sendMessage(prompt);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">HudumaHub Assistant</h1>
            <p className="text-xs text-muted-foreground">
              AI-powered civic services guide
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            New Chat
          </Button>
        )}
      </div>

      {/* Messages Area — scrollable */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        {messages.length === 0 ? (
          <EmptyChat onSelectPrompt={handleSelectPrompt} />
        ) : (
          <div className="mx-auto w-full max-w-3xl pb-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      {/* Input Area — sticky at bottom */}
      <ChatInput
        onSend={sendMessage}
        onStop={stopGenerating}
        isLoading={isLoading}
      />
    </div>
  );
}
