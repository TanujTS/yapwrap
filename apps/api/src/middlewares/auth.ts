import type { NextFunction, Request, Response } from "express";

export function requireAuth(_req: Request, _res: Response, next: NextFunction) {
  // TODO: plug in JWT/session verification here.
  next();
}
