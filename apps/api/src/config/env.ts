import { config } from "dotenv";
import { z } from "zod";
import path from "path";

// Load .env file from the project root
config({ path: path.resolve(__dirname, "../../../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("8000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  LOG_LEVEL: z.string().optional(),
  LOGS_DIR: z.string().optional(),
  WEB_URL: z.string(),
  AUTH_BASE_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  REDIS_URL: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  CANDIDATE_EMAIL: z.string()
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
