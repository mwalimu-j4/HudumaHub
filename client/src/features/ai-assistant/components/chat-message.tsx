// Chat Message Bubble — World-class structured rendering
import {
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Zap,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType, StructuredData } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
}

/** Parse structured data from message content on the fly (client-side fallback) */
function parseClientStructured(content: string): StructuredData | null {
  const steps: { number: number; text: string }[] = [];
  const fees: { amount: string; description: string }[] = [];
  const links: { url: string; label: string }[] = [];

  // Steps
  const stepRegex = /^\s*(\d+)[.)]\s+(.+)$/gm;
  let m;
  while ((m = stepRegex.exec(content)) !== null) {
    steps.push({ number: parseInt(m[1], 10), text: m[2].trim() });
  }

  // Fees
  const feeRegex = /KES\s*([\d,]+(?:\.\d{2})?)\s*(\([^)]*\))?/gi;
  while ((m = feeRegex.exec(content)) !== null) {
    const amount = `KES ${m[1]}`;
    const desc = m[2] ? m[2].replace(/[()]/g, "").trim() : "";
    if (!fees.some((f) => f.amount === amount)) {
      fees.push({ amount, description: desc });
    }
  }
  if (/\bfree\b/i.test(content) && fees.length === 0) {
    fees.push({ amount: "KES 0", description: "Free" });
  }

  // Links
  const urlRegex = /https?:\/\/[^\s,)]+/gi;
  while ((m = urlRegex.exec(content)) !== null) {
    const url = m[0].replace(/[.)]+$/, "");
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      const label = domain.includes(".go.ke") ? `${domain} (Official)` : domain;
      if (!links.some((l) => l.url === url)) {
        links.push({ url, label });
      }
    } catch {
      // skip invalid URLs
    }
  }

  if (steps.length === 0 && fees.length === 0 && links.length === 0)
    return null;

  return {
    steps,
    fees,
    links,
    hasSteps: steps.length > 0,
    hasFees: fees.length > 0,
    hasLinks: links.length > 0,
  };
}

/** Remove step lines from content if we're rendering them as a stepper */
function getContentWithoutSteps(content: string): string {
  return content.replace(/^\s*\d+[.)]\s+.+$/gm, "").trim();
}

/** Stepper component for numbered steps */
function StepperView({ steps }: { steps: { number: number; text: string }[] }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => (
        <div key={step.number} className="flex gap-3 items-start">
          {/* Step circle + connector line */}
          <div className="flex flex-col items-center">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              {step.number}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px h-full min-h-[16px] bg-emerald-500/20 my-1" />
            )}
          </div>
          {/* Step text */}
          <p className="text-sm text-[#e5e7eb] leading-relaxed pt-0.5 pb-2">
            {step.text}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Fee badge chip */
function FeeBadge({ fee }: { fee: { amount: string; description: string } }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
      💰 Fee: {fee.amount}
      {fee.description && ` (${fee.description})`}
    </span>
  );
}

/** Link pill button */
function LinkPill({ link }: { link: { url: string; label: string } }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(255,255,255,0.06)] text-[#93c5fd] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] hover:underline transition-colors"
    >
      🔗 {link.label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);
  const [showCacheBadge, setShowCacheBadge] = useState(!!message.fromCache);
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;

  // Fade out cache badge after 2s
  useState(() => {
    if (message.fromCache) {
      const timer = setTimeout(() => setShowCacheBadge(false), 2000);
      return () => clearTimeout(timer);
    }
  });

  const structured = useMemo(() => {
    if (isUser || isStreaming) return null;
    return message.structuredData ?? parseClientStructured(message.content);
  }, [message.content, message.structuredData, isUser, isStreaming]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  const plainContent = useMemo(() => {
    if (!structured?.hasSteps) return message.content;
    return getContentWithoutSteps(message.content);
  }, [message.content, structured]);

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 huduma-msg-enter",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          isUser
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-emerald-400" />
        ) : (
          <Bot className="h-4 w-4 text-emerald-400" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[85%] md:max-w-[70%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Cache hit badge */}
        {showCacheBadge && !isUser && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse">
            <Zap className="h-3 w-3" /> Instant answer
          </span>
        )}

        {/* Sender label on hover */}
        <span className="text-[10px] font-medium text-[#6b7280] opacity-0 group-hover:opacity-100 transition-opacity">
          {isUser ? "You" : "HudumaHub Assistant"}
        </span>

        {/* Bubble */}
        <div
          className={cn(
            "rounded-[18px] px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-[4px]"
              : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#e5e7eb] rounded-bl-[4px]",
          )}
        >
          {message.content ? (
            isUser || !structured ? (
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Plain text above steps */}
                {plainContent && (
                  <div className="whitespace-pre-wrap break-words">
                    {plainContent}
                  </div>
                )}
                {/* Stepper for numbered steps */}
                {structured.hasSteps && (
                  <StepperView steps={structured.steps} />
                )}
                {/* Fee badges */}
                {structured.hasFees && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {structured.fees.map((fee, i) => (
                      <FeeBadge key={i} fee={fee} />
                    ))}
                  </div>
                )}
                {/* Link pills */}
                {structured.hasLinks && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {structured.links.map((link, i) => (
                      <LinkPill key={i} link={link} />
                    ))}
                  </div>
                )}
              </div>
            )
          ) : isStreaming ? (
            <div className="flex items-center gap-1.5 py-1">
              <span
                className="huduma-dot h-2 w-2 rounded-full bg-emerald-400"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="huduma-dot h-2 w-2 rounded-full bg-emerald-400"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="huduma-dot h-2 w-2 rounded-full bg-emerald-400"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          ) : null}
        </div>

        {/* Reaction row for assistant messages */}
        {!isUser && message.content && !isStreaming && (
          <div className="flex items-center gap-1 mt-0.5">
            <button
              onClick={() => setReaction(reaction === "up" ? null : "up")}
              className={cn(
                "p-1 rounded hover:bg-[rgba(255,255,255,0.08)] transition-colors",
                reaction === "up" ? "text-emerald-400" : "text-[#6b7280]",
              )}
              title="Helpful"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setReaction(reaction === "down" ? null : "down")}
              className={cn(
                "p-1 rounded hover:bg-[rgba(255,255,255,0.08)] transition-colors",
                reaction === "down" ? "text-red-400" : "text-[#6b7280]",
              )}
              title="Not helpful"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1 rounded text-[#6b7280] hover:bg-[rgba(255,255,255,0.08)] hover:text-white transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
