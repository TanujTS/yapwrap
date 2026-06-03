import fs from "fs";
import path from "path";
import pino from "pino";
import type { LoggerConfig } from "./config";

export function ensureLogsDirectory(logsDir: string): void {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

export function getTransports(config: LoggerConfig) {
  const { isDevelopment, isProduction, logsDirectory } = config;

  ensureLogsDirectory(logsDirectory);

  if (isDevelopment) {
    return pino.transport({
      targets: [
        {
          level: "debug",
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname,request,response",
            singleLine: true,
          },
        },
        {
          level: "debug",
          target: "pino-roll",
          options: {
            file: path.join(logsDirectory, "app.log"),
            maxSize: "10M",
            maxFiles: 5,
          },
        },
        {
          level: "error",
          target: "pino-roll",
          options: {
            file: path.join(logsDirectory, "error.log"),
            maxSize: "10M",
            maxFiles: 5,
          },
        },
      ],
    });
  }

  if (isProduction) {
    return pino.transport({
      targets: [
        {
          level: "info",
          target: "pino-roll",
          options: {
            file: path.join(logsDirectory, "app.log"),
            maxSize: "10M",
            maxFiles: 10,
          },
        },
        {
          level: "error",
          target: "pino-roll",
          options: {
            file: path.join(logsDirectory, "error.log"),
            maxSize: "10M",
            maxFiles: 10,
          },
        },
      ],
    });
  }

  return undefined;
}
