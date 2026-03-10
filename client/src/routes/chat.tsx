// Chat Route — Lazy loaded AI Assistant page
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// Code-split: ChatContainer is only loaded when user navigates to /chat
const ChatContainer = lazy(() =>
  import("@/features/ai-assistant").then((mod) => ({
    default: mod.ChatContainer,
  })),
);

type ChatSearch = { q?: string };

function ChatPageFallback() {
  return (
    <div className="flex flex-1 items-center justify-center huduma-chat-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-[#6b7280]">Loading AI Assistant...</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>): ChatSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: ChatPage,
});

function ChatPage() {
  const { q } = Route.useSearch();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<ChatPageFallback />}>
        <ChatContainer initialQuery={q} />
      </Suspense>
    </div>
  );
}
