import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

export function traceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const incoming = req.header("x-trace-id") ?? req.header("x-request-id");
  const traceId = incoming?.trim() || crypto.randomUUID();

  req.traceId = traceId;
  res.setHeader("x-trace-id", traceId);
  next();
}
