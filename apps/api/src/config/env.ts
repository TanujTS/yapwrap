export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  LOG_LEVEL: process.env.LOG_LEVEL,
  LOGS_DIR: process.env.LOGS_DIR,
  WEB_URL: process.env.WEB_URL,
};
