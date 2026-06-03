import type { NextFunction, Response } from "express";
import { logger } from "../logger";
import type { AppRequest } from "../types";
import { ApiError } from "../utils/api-error";
import { responseFail } from "../utils/api-response";

export function errorHandler(
  err: unknown,
  req: AppRequest,
  res: Response,
  _next: NextFunction,
) {
  if (res.headersSent) return;

  if (err instanceof SyntaxError && "body" in err) {
    responseFail(
      req,
      res,
      400,
      "MALFORMED_JSON",
      "Request body contains malformed JSON",
    );
    return;
  }

  if (err instanceof ApiError) {
    logger.warn(
      {
      traceId: req.traceId,
      method: req.method,
      path: req.originalUrl,
      statusCode: err.statusCode,
      errorCode: err.code,
      message: err.message,
      details: err.details,
      },
      "API Error",
    );

    responseFail(req, res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  logger.error(
    {
      traceId: req.traceId,
      method: req.method,
      path: req.originalUrl,
      statusCode: 500,
      error: err instanceof Error ? err.message : String(err),
    },
    "Unexpected error",
  );

  responseFail(req, res, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
}
