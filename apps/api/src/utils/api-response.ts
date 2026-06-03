import type { Response } from "express";
import type { AppRequest } from "../types";

type Meta = Record<string, unknown>;

export function responseOk<T>(
  req: AppRequest,
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Meta,
) {
  return res.status(statusCode).json({
    traceId: req.traceId,
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function responseCreated<T>(
  req: AppRequest,
  res: Response,
  data: T,
  meta?: Meta,
) {
  return responseOk(req, res, data, 201, meta);
}

export function responseFail(
  req: AppRequest,
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return res.status(statusCode).json({
    traceId: req.traceId,
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}
