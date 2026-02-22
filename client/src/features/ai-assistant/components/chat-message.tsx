// Chat Message Bubble Component
import { Bot, User, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-4",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <Avatar
        className={cn(
          "h-8 w-8 shrink-0 border",
          isUser
            ? "border-primary/30 bg-primary/10"
            : "border-accent/30 bg-accent/10",
        )}
      >
        <AvatarFallback
          className={cn(
            isUser ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isUser ? "items-end" : "items-start",
        )}
      >
        <span className="text-xs font-medium text-muted-foreground">
          {isUser ? "You" : "HudumaHub Assistant"}
        </span>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md",
            isStreaming && "animate-pulse",
          )}
        >
          {message.content ? (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          ) : isStreaming ? (
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : null}
        </div>

        {/* Copy button for assistant messages */}
        {!isUser && message.content && !isStreaming && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            title="Copy message"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
