// Rate Limiting Middleware for AI Endpoints
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Rate limiter for AI chat endpoint.
 * Prevents abuse of the AI service.
 */
export const aiRateLimiter = rateLimit({
  windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
  max: env.AI_RATE_LIMIT_MAX,
  message: {
    success: false,
    error: "Too many AI requests. Please wait a moment before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by session ID or IP
    const sessionId =
      typeof req.body === "object" && req.body !== null
        ? (req.body as Record<string, unknown>).sessionId
        : undefined;
    return (typeof sessionId === "string" ? sessionId : req.ip) ?? "unknown";
  },
});

/**
 * General API rate limiter.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
