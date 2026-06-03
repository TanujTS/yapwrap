import pino from "pino";
import pinoHttp from "pino-http";
import { getLoggerConfig } from "./config";
import { getTransports } from "./transports";
import type { AppRequest } from "../types";

const config = getLoggerConfig();
const transport = getTransports(config);

export const logger = pino(
  {
    level: config.logLevel,
  },
  transport,
);

const httpLogger = pinoHttp({
  logger,

  autoLogging: {
    ignore: (req) => req.url === "/health",
  },

  customProps: (req) => ({
    traceId: (req as AppRequest).traceId,
    environment: config.environment,
  }),

  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} - ${res.statusCode}`,

  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`,

  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    if (res.statusCode >= 300) return "silent";
    return "info";
  },

  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "duration",
  },

  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

export default httpLogger;
