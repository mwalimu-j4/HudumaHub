// AI Controller — HTTP Request Handlers
// Handles SSE streaming and JSON responses for AI chat

import { Request, Response, NextFunction } from "express";
import {
  sendMessageSchema,
  getConversationSchema,
  listConversationsSchema,
  deleteConversationSchema,
} from "./ai.validation.js";
import {
  handleChatStream,
  handleChatComplete,
  saveAssistantMessage,
  getConversation,
  listConversations,
  deleteConversation,
} from "./ai.service.js";
import { checkOllamaHealth } from "../../lib/ollama.js";
import type { AppError } from "../../middlewares/error.js";

/**
 * POST /api/ai/chat
 * Main chat endpoint — supports SSE streaming and JSON response.
 */
export async function chatHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      const error: AppError = new Error(
        parsed.error.issues.map((i) => i.message).join(", "),
      );
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const input = parsed.data;

    if (input.stream) {
      // SSE Streaming response
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      const { conversationId, stream } = await handleChatStream(input);

      // Send conversation ID first
      res.write(
        `data: ${JSON.stringify({ type: "meta", conversationId })}\n\n`,
      );

      let fullContent = "";
      let lastDuration: number | undefined;
      let lastTokenCount: number | undefined;

      for await (const chunk of stream) {
        fullContent += chunk.content;

        if (chunk.totalDuration) {
          lastDuration = Math.round(chunk.totalDuration / 1_000_000);
        }
        if (chunk.evalCount) {
          lastTokenCount = chunk.evalCount;
        }

        res.write(
          `data: ${JSON.stringify({
            type: "chunk",
            content: chunk.content,
            done: chunk.done,
          })}\n\n`,
        );

        if (chunk.done) {
          // Save complete assistant message
          const saved = await saveAssistantMessage(
            conversationId,
            fullContent,
            lastDuration,
            lastTokenCount,
          );

          res.write(
            `data: ${JSON.stringify({
              type: "done",
              messageId: saved.id,
              conversationId,
              tokenCount: lastTokenCount,
              durationMs: lastDuration,
            })}\n\n`,
          );
        }
      }

      res.end();
    } else {
      // Non-streaming JSON response
      const result = await handleChatComplete(input);
      res.status(200).json({
        success: true,
        data: result,
      });
    }
  } catch (err) {
    // If headers already sent (streaming failed mid-way), end the response
    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({ type: "error", error: "Stream interrupted" })}\n\n`,
      );
      res.end();
      return;
    }
    next(err);
  }
}

/**
 * GET /api/ai/conversations/:conversationId
 * Get a conversation with all messages.
 */
export async function getConversationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = getConversationSchema.safeParse(req.params);
    if (!parsed.success) {
      const error: AppError = new Error("Invalid conversation ID");
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const conversation = await getConversation(parsed.data.conversationId);
    if (!conversation) {
      const error: AppError = new Error("Conversation not found");
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/conversations
 * List conversations for a session.
 */
export async function listConversationsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = listConversationsSchema.safeParse(req.query);
    if (!parsed.success) {
      const error: AppError = new Error(
        parsed.error.issues.map((i) => i.message).join(", "),
      );
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const { sessionId, page, limit } = parsed.data;
    const result = await listConversations(sessionId, page, limit);

    res.status(200).json({
      success: true,
      data: result.conversations,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/ai/conversations/:conversationId
 * Delete a conversation.
 */
export async function deleteConversationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = deleteConversationSchema.safeParse(req.params);
    if (!parsed.success) {
      const error: AppError = new Error("Invalid conversation ID");
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    await deleteConversation(parsed.data.conversationId);

    res.status(200).json({
      success: true,
      message: "Conversation deleted",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/health
 * Check Ollama status.
 */
export async function aiHealthHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const health = await checkOllamaHealth();
    res.status(health.online ? 200 : 503).json({
      success: health.online,
      data: health,
    });
  } catch (err) {
    next(err);
  }
}
