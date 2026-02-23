// Auth Controller — HTTP handlers for authentication
import { Request, Response, NextFunction } from "express";
import { getUserById } from "./auth.service.js";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
export async function meHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Not authenticated" });
    }

    const user = await getUserById((req.user as { id: string }).id);
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    if (!user.isActive) {
      req.logout(() => {});
      return res
        .status(403)
        .json({ success: false, error: "Account disabled" });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Destroys the session and clears the cookie.
 */
export function logoutHandler(req: Request, res: Response) {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error("Session destroy error:", sessionErr);
      }
      res.clearCookie("hudumahub.sid");
      res.status(200).json({ success: true, message: "Logged out" });
    });
  });
}
