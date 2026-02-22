// Chat Container — Main chat UI component
// Composes message list, input, and empty state

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { EmptyChat } from "./empty-chat";
import { useChat } from "../hooks/use-chat";

interface ChatContainerProps {
  conversationId?: string;
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    stopGenerating,
    clearChat: _clearChat,
  } = useChat({ conversationId });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }
  }, [messages]);

  const handleSelectPrompt = (prompt: string) => {
    void sendMessage(prompt);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex flex-col">
          {messages.length === 0 ? (
            <EmptyChat onSelectPrompt={handleSelectPrompt} />
          ) : (
            <div className="mx-auto w-full max-w-3xl divide-y divide-border/50">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        onSend={sendMessage}
        onStop={stopGenerating}
        isLoading={isLoading}
      />
    </div>
  );
}
