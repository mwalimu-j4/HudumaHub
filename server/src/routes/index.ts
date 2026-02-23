import { Router, Request, Response } from "express";
import type { IRouter } from "express";
import { aiRouter } from "../modules/ai/index.js";
import { authRouter } from "../modules/auth/index.js";
import { aiRateLimiter, apiRateLimiter } from "../middlewares/rate-limit.js";

const router: IRouter = Router();

// General API rate limiting
router.use(apiRateLimiter);

router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "HudumaHub API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to HudumaHub API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// Auth routes
router.use("/auth", authRouter);

// AI module routes — dedicated rate limiter on chat BEFORE the router
router.use("/ai/chat", aiRateLimiter);
router.use("/ai", aiRouter);

export default router;
