import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().default("postgresql://localhost:5432/hudumahub"),
  JWT_SECRET: z.string().default("hudumahub-dev-secret-change-in-production"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  CLIENT_URL: z.string().default("http://localhost:5173"),

  // Session
  SESSION_SECRET: z.string().default("hudumahub-session-secret-change-in-prod"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_CALLBACK_URL: z
    .string()
    .default("http://localhost:5000/api/auth/google/callback"),

  // Cloud AI Provider config (OpenAI-compatible: Groq, OpenAI, Together, etc.)
  AI_API_KEY: z.string().default(""),
  AI_PROVIDER_URL: z.string().default("https://api.groq.com/openai/v1"),
  AI_MODEL: z.string().default("llama-3.3-70b-versatile"),
  AI_MAX_TOKENS: z.coerce.number().default(2048),
  AI_RATE_LIMIT_MAX: z.coerce.number().default(20),
  AI_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
