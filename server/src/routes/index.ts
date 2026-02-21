import { Router, Request, Response } from "express";
import type { IRouter } from "express";

const router: IRouter = Router();

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

export default router;
