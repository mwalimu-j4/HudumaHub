// AI Module Input Validation — Zod Schemas
import { z } from "zod";

export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message must be under 4000 characters")
    .trim(),
  conversationId: z.string().optional(),
  sessionId: z.string().uuid(),
  model: z.string().optional(),
  stream: z.boolean().default(true),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const getConversationSchema = z.object({
  conversationId: z.string(),
});

export const listConversationsSchema = z.object({
  sessionId: z.string().uuid(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const deleteConversationSchema = z.object({
  conversationId: z.string(),
});
