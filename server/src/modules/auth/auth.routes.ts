// Auth Routes — /api/auth
import { Router } from "express";
import type { IRouter } from "express";
import passport from "passport";
import { env } from "../../config/env.js";
import { meHandler, logoutHandler } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";
import { AccountDisabledError } from "./auth.service.js";

const authRouter: IRouter = Router();

// ──────────────────────────────────────────────
// Google OAuth
// ──────────────────────────────────────────────

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow.
 */
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

/**
 * GET /api/auth/google/callback
 * Google redirects here after authentication.
 */
authRouter.get("/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    (err: Error | null, user: Express.User | false) => {
      if (err) {
        console.error("Google auth error:", err.message);
        const redirectUrl =
          err instanceof AccountDisabledError
            ? `${env.CLIENT_URL}/login?error=disabled`
            : `${env.CLIENT_URL}/login?error=auth_failed`;
        return res.redirect(redirectUrl);
      }

      if (!user) {
        return res.redirect(`${env.CLIENT_URL}/login?error=auth_failed`);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.redirect(`${env.CLIENT_URL}/login?error=auth_failed`);
        }
        // Successful login → redirect to dashboard
        return res.redirect(`${env.CLIENT_URL}/dashboard`);
      });
    },
  )(req, res, next);
});

// ──────────────────────────────────────────────
// Session endpoints
// ──────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Returns the current user's profile (requires auth).
 */
authRouter.get("/me", requireAuth, meHandler);

/**
 * POST /api/auth/logout
 * Destroys session, logs out.
 */
authRouter.post("/logout", logoutHandler);

export default authRouter;
