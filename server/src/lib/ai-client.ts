// Cloud AI Client — OpenAI-compatible API (Groq, OpenAI, Together, OpenRouter, etc.)
// Replaces local Ollama with a cloud provider for production use.

import { env } from "../config/env.js";

/* ------------------------------------------------------------------ */
/*  Shared types                                                       */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatStreamChunk {
  content: string;
  done: boolean;
  totalDuration?: number;
  evalCount?: number;
}

/* ------------------------------------------------------------------ */
/*  Internal OpenAI-compatible types                                   */
/* ------------------------------------------------------------------ */

interface StreamDelta {
  role?: string;
  content?: string;
}

interface StreamChoice {
  index: number;
  delta: StreamDelta;
  finish_reason: string | null;
}

interface StreamChunkPayload {
  id: string;
  choices: StreamChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface CompletionChoice {
  index: number;
  message: { role: string; content: string };
  finish_reason: string;
}

interface CompletionResponse {
  id: string;
  choices: CompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (env.AI_API_KEY) {
    headers["Authorization"] = `Bearer ${env.AI_API_KEY}`;
  }
  return headers;
}

function buildRequestBody(
  messages: ChatMessage[],
  stream: boolean,
  model?: string,
) {
  return {
    model: model ?? env.AI_MODEL,
    messages,
    stream,
    max_tokens: env.AI_MAX_TOKENS,
    temperature: 0.7,
    top_p: 0.9,
  };
}

/* ------------------------------------------------------------------ */
/*  Streaming chat                                                     */
/* ------------------------------------------------------------------ */

/**
 * Send a chat request to the AI provider and stream response chunks.
 * Returns an async generator compatible with the existing SSE controller.
 */
export async function* streamChat(
  messages: ChatMessage[],
  model?: string,
): AsyncGenerator<ChatStreamChunk> {
  const startTime = Date.now();

  const response = await fetch(`${env.AI_PROVIDER_URL}/chat/completions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(buildRequestBody(messages, true, model)),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(`AI provider error (${response.status}): ${errorBody}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body from AI provider");

  const decoder = new TextDecoder();
  let buffer = "";
  let totalTokens = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);

        // OpenAI-compatible terminal signal
        if (data === "[DONE]") {
          yield {
            content: "",
            done: true,
            totalDuration: Date.now() - startTime,
            evalCount: totalTokens || undefined,
          };
          return;
        }

        try {
          const parsed = JSON.parse(data) as StreamChunkPayload;
          const choice = parsed.choices?.[0];

          if (parsed.usage) {
            totalTokens = parsed.usage.completion_tokens;
          }

          if (choice?.delta?.content) {
            yield {
              content: choice.delta.content,
              done: false,
            };
          }

          if (choice?.finish_reason === "stop") {
            yield {
              content: "",
              done: true,
              totalDuration: Date.now() - startTime,
              evalCount: totalTokens || undefined,
            };
            return;
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Safety: if we exit the read loop without emitting done, send it now
  yield {
    content: "",
    done: true,
    totalDuration: Date.now() - startTime,
    evalCount: totalTokens || undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Non-streaming chat                                                 */
/* ------------------------------------------------------------------ */

/**
 * Send a non-streaming chat completion request.
 */
export async function chat(
  messages: ChatMessage[],
  model?: string,
): Promise<{ content: string; totalDuration?: number; evalCount?: number }> {
  const startTime = Date.now();

  const response = await fetch(`${env.AI_PROVIDER_URL}/chat/completions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(buildRequestBody(messages, false, model)),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(`AI provider error (${response.status}): ${errorBody}`);
  }

  const result = (await response.json()) as CompletionResponse;
  const content = result.choices?.[0]?.message?.content ?? "";

  return {
    content,
    totalDuration: Date.now() - startTime,
    evalCount: result.usage?.completion_tokens,
  };
}

/* ------------------------------------------------------------------ */
/*  Health check                                                       */
/* ------------------------------------------------------------------ */

/**
 * Check if the AI provider is reachable and the model endpoint works.
 */
export async function checkAIHealth(): Promise<{
  online: boolean;
  model: string;
  provider: string;
}> {
  try {
    const response = await fetch(`${env.AI_PROVIDER_URL}/models`, {
      headers: getHeaders(),
    });

    return {
      online: response.ok,
      model: env.AI_MODEL,
      provider: env.AI_PROVIDER_URL,
    };
  } catch {
    return {
      online: false,
      model: env.AI_MODEL,
      provider: env.AI_PROVIDER_URL,
    };
  }
}
