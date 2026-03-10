// Chat Input Component — Premium bottom bar with animated placeholder
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import { SendHorizontal, Square } from "lucide-react";

const PLACEHOLDER_QUESTIONS = [
  "How do I get a National ID?",
  "What's the process for a KRA PIN?",
  "How do I apply for a passport?",
  "How to register for SHA?",
];

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  isLoading,
  disabled,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cycle through placeholder questions
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex(
          (prev) => (prev + 1) % PLACEHOLDER_QUESTIONS.length,
        );
        setPlaceholderVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  return (
    <div
      className="border-t border-[rgba(255,255,255,0.06)] bg-[#0a0f0a]/95 backdrop-blur-sm px-4 py-3"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            disabled={disabled}
            className="
              w-full min-h-[56px] max-h-[200px] resize-none rounded-2xl
              bg-[rgba(255,255,255,0.05)] border border-[rgba(16,185,129,0.3)]
              px-4 py-4 pr-12 text-sm text-white placeholder-transparent
              focus:outline-none focus:border-emerald-500/50 focus:shadow-[0_0_0_2px_rgba(16,185,129,0.4)]
              transition-all duration-200
            "
            rows={1}
          />
          {/* Animated placeholder overlay */}
          {!value && (
            <span
              className={`
                absolute left-4 top-4 text-sm text-[#6b7280] pointer-events-none
                transition-opacity duration-300
                ${placeholderVisible ? "opacity-100" : "opacity-0"}
              `}
            >
              {PLACEHOLDER_QUESTIONS[placeholderIndex]}
            </span>
          )}
        </div>
        {isLoading ? (
          <button
            onClick={onStop}
            className="
              h-[56px] w-[56px] shrink-0 rounded-2xl
              bg-red-500/80 hover:bg-red-500 text-white
              flex items-center justify-center
              transition-colors duration-150
              cursor-pointer
            "
            title="Stop generating"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="
              h-[56px] w-[56px] shrink-0 rounded-2xl
              bg-emerald-500 hover:bg-emerald-400 hover:scale-105 text-white
              flex items-center justify-center
              transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
              cursor-pointer
            "
            title="Send message"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-[#6b7280]">
        HudumaHub AI may make mistakes. Always verify with official government
        sources.
      </p>
    </div>
  );
}
