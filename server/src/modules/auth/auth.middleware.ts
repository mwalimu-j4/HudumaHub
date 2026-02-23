// Auth Middleware — Protect routes that require authentication
import { Request, Response, NextFunction } from "express";

/**
 * Requires the user to be authenticated via session/passport.
 * Returns 401 if not authenticated.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({
    success: false,
    error: "Authentication required",
  });
}

/**
 * Requires the user to have ADMIN role.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, error: "Authentication required" });
  }

  const user = req.user as { role: string };
  if (user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ success: false, error: "Admin access required" });
  }

  next();
}
