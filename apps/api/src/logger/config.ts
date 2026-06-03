export interface LoggerConfig {
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
  logLevel: string;
  logsDirectory: string;
}

export function getLoggerConfig(): LoggerConfig {
  const environment = process.env.NODE_ENV || "development";
  const isDevelopment = environment === "development";
  const isProduction = environment === "production";
  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info");
  const logsDirectory = process.env.LOGS_DIR || "./logs";

  return {
    environment,
    isDevelopment,
    isProduction,
    logLevel,
    logsDirectory,
  };
}
