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
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading AI Assistant...</p>
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
    <div className="flex flex-1 flex-col overflow-hidden">
      <Suspense fallback={<ChatPageFallback />}>
        <ChatContainer initialQuery={q} />
      </Suspense>
    </div>
  );
}
