// AI Routes — /api/ai
import { Router } from "express";
import type { IRouter } from "express";
import {
  chatHandler,
  getConversationHandler,
  listConversationsHandler,
  deleteConversationHandler,
  aiHealthHandler,
  trendingQuestionsHandler,
} from "./ai.controller.js";

const aiRouter: IRouter = Router();

// AI Health check
aiRouter.get("/health", aiHealthHandler);

// Trending questions
aiRouter.get("/trending", trendingQuestionsHandler);

// Chat endpoint (streaming SSE or JSON)
aiRouter.post("/chat", chatHandler);

// Conversation CRUD
aiRouter.get("/conversations", listConversationsHandler);
aiRouter.get("/conversations/:conversationId", getConversationHandler);
aiRouter.delete("/conversations/:conversationId", deleteConversationHandler);

export default aiRouter;
