import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { env } from "./config/env";
import routes from "./routes/index";
import { errorHandler, notFoundHandler } from "./middlewares/error";
import { configurePassport } from "./modules/auth/index";

const app: Express = express();

// ── Security ────────────────────────────────────────────
app.use(helmet());

// Trust proxy in production (Render / Vercel)
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ── CORS ────────────────────────────────────────────────
const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// ── Logging ─────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Body parsing ────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Session ─────────────────────────────────────────────
const PgStore = connectPgSimple(session);
app.use(
  session({
    store: new PgStore({
      conString: env.DATABASE_URL,
      tableName: "session",
      createTableIfMissing: true,
    }),
    name: "hudumahub.sid",
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

// ── Passport ────────────────────────────────────────────
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ──────────────────────────────────────────────
app.use("/api", routes);

// ── Error handling ──────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
