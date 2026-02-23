// Passport Configuration — Google OAuth 2.0 Strategy
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "../../config/env.js";
import {
  findOrCreateGoogleUser,
  getUserById,
  type GoogleProfile,
} from "./auth.service.js";

export function configurePassport(): void {
  // Serialize user ID into session
  passport.serializeUser((user, done) => {
    done(null, (user as { id: string }).id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await getUserById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Google OAuth 2.0 Strategy
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
          scope: ["profile", "email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email returned from Google"), false);
            }

            const googleProfile: GoogleProfile = {
              id: profile.id,
              email,
              displayName: profile.displayName,
              photos: profile.photos,
            };

            const user = await findOrCreateGoogleUser(googleProfile);
            done(null, user);
          } catch (err) {
            done(err as Error, false);
          }
        },
      ),
    );
    console.log("  ✅  Google OAuth strategy configured");
  } else {
    console.warn(
      "  ⚠️  GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not set — Google OAuth disabled",
    );
  }
}
