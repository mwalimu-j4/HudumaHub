// Chat Route — Lazy loaded AI Assistant page
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// Code-split: ChatContainer is only loaded when user navigates to /chat
const ChatContainer = lazy(() =>
  import("@/features/ai-assistant").then((mod) => ({
    default: mod.ChatContainer,
  })),
);

function ChatPageFallback() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading AI Assistant...</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <Suspense fallback={<ChatPageFallback />}>
        <ChatContainer />
      </Suspense>
    </div>
  );
}
