// Conversation Sidebar — ChatGPT-style thread history
import { useState, useEffect, useCallback } from "react";
import { Plus, MessageSquare, Trash2, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchConversations, deleteConversationApi } from "../api";
import type { Conversation } from "../types";
import { useAuth } from "@/features/auth";

interface ConversationSidebarProps {
  sessionId: string;
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface GroupedThreads {
  today: Conversation[];
  yesterday: Conversation[];
  last7Days: Conversation[];
  older: Conversation[];
}

function groupByDate(conversations: Conversation[]): GroupedThreads {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

  const grouped: GroupedThreads = {
    today: [],
    yesterday: [],
    last7Days: [],
    older: [],
  };

  for (const conv of conversations) {
    const date = new Date(conv.updatedAt);
    if (date >= todayStart) grouped.today.push(conv);
    else if (date >= yesterdayStart) grouped.yesterday.push(conv);
    else if (date >= weekStart) grouped.last7Days.push(conv);
    else grouped.older.push(conv);
  }

  return grouped;
}

function ThreadGroup({
  label,
  threads,
  activeThreadId,
  onSelect,
  onDelete,
}: {
  label: string;
  threads: Conversation[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (threads.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] px-3 mb-1">
        {label}
      </h4>
      {threads.map((t) => (
        <div
          key={t.id}
          className={cn(
            "group flex items-center gap-2 px-3 py-2 rounded-lg mx-1 cursor-pointer transition-colors",
            activeThreadId === t.id
              ? "bg-emerald-500/10 border-l-2 border-emerald-400"
              : "hover:bg-[rgba(255,255,255,0.05)] border-l-2 border-transparent",
          )}
          onClick={() => onSelect(t.id)}
        >
          <MessageSquare className="h-3.5 w-3.5 shrink-0 text-[#6b7280]" />
          <span className="flex-1 truncate text-xs text-[#d1d5db]">
            {t.title.slice(0, 40)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(t.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#6b7280] hover:text-red-400 transition-all"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ConversationSidebar({
  sessionId,
  activeThreadId,
  onSelectThread,
  onNewChat,
  isOpen,
  onClose,
}: ConversationSidebarProps) {
  const { isAuthenticated, login } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const result = await fetchConversations(sessionId);
      setConversations(result.data ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, activeThreadId]);

  const handleDelete = useCallback(
    async (threadId: string) => {
      try {
        await deleteConversationApi(threadId);
        setConversations((prev) => prev.filter((c) => c.id !== threadId));
        if (activeThreadId === threadId) onNewChat();
      } catch {
        // fail silently
      }
    },
    [activeThreadId, onNewChat],
  );

  const grouped = groupByDate(conversations);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[260px] flex flex-col",
          "bg-[#0d1210] border-r border-[rgba(255,255,255,0.06)]",
          "transition-transform duration-200 ease-out",
          "lg:static lg:translate-x-0 lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium
              transition-colors cursor-pointer
            "
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
          <button
            onClick={onClose}
            className="ml-2 p-1.5 rounded lg:hidden text-[#6b7280] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-[#374151] mb-2" />
              <p className="text-xs text-[#6b7280]">No conversations yet</p>
            </div>
          ) : (
            <>
              <ThreadGroup
                label="Today"
                threads={grouped.today}
                activeThreadId={activeThreadId}
                onSelect={(id) => {
                  onSelectThread(id);
                  onClose();
                }}
                onDelete={handleDelete}
              />
              <ThreadGroup
                label="Yesterday"
                threads={grouped.yesterday}
                activeThreadId={activeThreadId}
                onSelect={(id) => {
                  onSelectThread(id);
                  onClose();
                }}
                onDelete={handleDelete}
              />
              <ThreadGroup
                label="Last 7 Days"
                threads={grouped.last7Days}
                activeThreadId={activeThreadId}
                onSelect={(id) => {
                  onSelectThread(id);
                  onClose();
                }}
                onDelete={handleDelete}
              />
              <ThreadGroup
                label="Older"
                threads={grouped.older}
                activeThreadId={activeThreadId}
                onSelect={(id) => {
                  onSelectThread(id);
                  onClose();
                }}
                onDelete={handleDelete}
              />
            </>
          )}
        </div>

        {/* Login CTA for anonymous users */}
        {!isAuthenticated && (
          <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
            <button
              onClick={login}
              className="
                w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]
                text-[#d1d5db] text-xs hover:bg-[rgba(255,255,255,0.08)]
                transition-colors cursor-pointer
              "
            >
              <LogIn className="h-3.5 w-3.5" />
              Login to save history
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
