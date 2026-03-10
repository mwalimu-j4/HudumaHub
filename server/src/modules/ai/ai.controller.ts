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
import { checkAIHealth } from "../../lib/ai-client.js";
import { getTrendingQuestions } from "../cache/index.js";
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
      const { conversationId, stream, fromCache, structuredData } =
        await handleChatStream(input);

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      res.write(
        `data: ${JSON.stringify({ type: "meta", conversationId, fromCache: !!fromCache })}\n\n`,
      );

      if (fromCache) {
        // Cached response — send as single chunk
        for await (const chunk of stream) {
          res.write(
            `data: ${JSON.stringify({
              type: "chunk",
              content: chunk.content,
              done: true,
              fromCache: true,
              structuredData,
            })}\n\n`,
          );
          res.write(
            `data: ${JSON.stringify({
              type: "done",
              conversationId,
              fromCache: true,
              structuredData,
            })}\n\n`,
          );
        }
        res.end();
        return;
      }

      let fullContent = "";
      let lastDuration: number | undefined;
      let lastTokenCount: number | undefined;

      for await (const chunk of stream) {
        fullContent += chunk.content;

        if ("totalDuration" in chunk && chunk.totalDuration) {
          lastDuration = chunk.totalDuration;
        }
        if ("evalCount" in chunk && chunk.evalCount) {
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
          const saved = await saveAssistantMessage(
            conversationId,
            fullContent,
            lastDuration,
            lastTokenCount,
            input.message,
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
    // If headers already sent (streaming failed mid-way), send SSE error
    if (res.headersSent) {
      const errorMsg =
        err instanceof Error ? err.message : "Stream interrupted";
      console.error("❌ AI stream error:", errorMsg);
      res.write(
        `data: ${JSON.stringify({ type: "error", error: errorMsg })}\n\n`,
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
 * Check AI provider status.
 */
export async function aiHealthHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const health = await checkAIHealth();
    res.status(health.online ? 200 : 503).json({
      success: health.online,
      data: health,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/trending
 * Get trending questions from the cache.
 */
export async function trendingQuestionsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 5, 1),
      20,
    );
    const questions = await getTrendingQuestions(limit);

    // Fallback to default if DB has no data yet
    const defaults = [
      {
        question_text: "How do I apply for a National ID card in Kenya?",
        hit_count: 0,
        category: "national_id",
      },
      {
        question_text: "How do I register for a KRA PIN on iTax?",
        hit_count: 0,
        category: "kra_pin",
      },
      {
        question_text: "What documents do I need for a Kenyan e-Passport?",
        hit_count: 0,
        category: "passport",
      },
      {
        question_text: "How do I apply for a HELB student loan?",
        hit_count: 0,
        category: "helb",
      },
      {
        question_text: "How do I register for SHA (formerly NHIF)?",
        hit_count: 0,
        category: "nhif_sha",
      },
    ];

    res.status(200).json({
      success: true,
      data: questions.length > 0 ? questions : defaults,
    });
  } catch (err) {
    // On error, return defaults silently
    res.status(200).json({
      success: true,
      data: [
        {
          question_text: "How do I apply for a National ID card in Kenya?",
          hit_count: 0,
          category: "national_id",
        },
        {
          question_text: "How do I register for a KRA PIN on iTax?",
          hit_count: 0,
          category: "kra_pin",
        },
        {
          question_text: "What documents do I need for a Kenyan e-Passport?",
          hit_count: 0,
          category: "passport",
        },
        {
          question_text: "How do I apply for a HELB student loan?",
          hit_count: 0,
          category: "helb",
        },
        {
          question_text: "How do I register for SHA (formerly NHIF)?",
          hit_count: 0,
          category: "nhif_sha",
        },
      ],
    });
  }
}
