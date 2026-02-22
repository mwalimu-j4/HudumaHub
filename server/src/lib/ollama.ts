// Ollama AI Client — HudumaHub
// Wraps the Ollama SDK for civic-focused AI interactions

import { Ollama } from "ollama";
import { env } from "../config/env.js";

let ollamaClient: Ollama | null = null;

export function getOllamaClient(): Ollama {
  if (!ollamaClient) {
    ollamaClient = new Ollama({ host: env.OLLAMA_BASE_URL });
  }
  return ollamaClient;
}

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

/**
 * Send a chat request to Ollama and stream the response.
 * Returns an async generator of content chunks.
 */
export async function* streamChat(
  messages: ChatMessage[],
  model?: string,
): AsyncGenerator<ChatStreamChunk> {
  const client = getOllamaClient();
  const response = await client.chat({
    model: model ?? env.OLLAMA_MODEL,
    messages,
    stream: true,
    options: {
      num_predict: env.AI_MAX_TOKENS,
      temperature: 0.7,
      top_p: 0.9,
    },
  });

  for await (const chunk of response) {
    yield {
      content: chunk.message?.content ?? "",
      done: chunk.done ?? false,
      totalDuration: chunk.total_duration,
      evalCount: chunk.eval_count,
    };
  }
}

/**
 * Send a non-streaming chat request to Ollama.
 */
export async function chat(
  messages: ChatMessage[],
  model?: string,
): Promise<{ content: string; totalDuration?: number; evalCount?: number }> {
  const client = getOllamaClient();
  const response = await client.chat({
    model: model ?? env.OLLAMA_MODEL,
    messages,
    stream: false,
    options: {
      num_predict: env.AI_MAX_TOKENS,
      temperature: 0.7,
      top_p: 0.9,
    },
  });

  return {
    content: response.message?.content ?? "",
    totalDuration: response.total_duration,
    evalCount: response.eval_count,
  };
}

/**
 * Check if Ollama is reachable and the model is available.
 */
export async function checkOllamaHealth(): Promise<{
  online: boolean;
  model: string;
  modelAvailable: boolean;
}> {
  try {
    const client = getOllamaClient();
    const models = await client.list();
    const modelNames = models.models.map((m) => m.name);
    const targetModel = env.OLLAMA_MODEL;
    const modelAvailable = modelNames.some(
      (n) => n === targetModel || n.startsWith(`${targetModel}:`),
    );

    return { online: true, model: targetModel, modelAvailable };
  } catch {
    return { online: false, model: env.OLLAMA_MODEL, modelAvailable: false };
  }
}
