import { env } from "../config/env";

export interface LoggerConfig {
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
  logLevel: string;
  logsDirectory: string;
}

export function getLoggerConfig(): LoggerConfig {
  const environment = env.NODE_ENV;
  const isDevelopment = environment === "development";
  const isProduction = environment === "production";
  const logLevel = env.LOG_LEVEL || (isDevelopment ? "debug" : "info");
  const logsDirectory = env.LOGS_DIR || "./logs";

  return {
    environment,
    isDevelopment,
    isProduction,
    logLevel,
    logsDirectory,
  };
}
