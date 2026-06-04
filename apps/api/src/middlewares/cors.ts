import cors from "cors";
import { env } from "../config/env";
import { logger } from "../logger";

const allowedOrigins = [
  env.WEB_URL,
  "http://localhost:3000",
].filter(Boolean);

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    logger.warn({ event: "cors.blocked", origin, message: "Blocked by CORS" });
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});
