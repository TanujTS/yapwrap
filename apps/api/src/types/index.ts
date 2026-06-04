import type { Request } from "express";
import type { auth } from "../utils/auth";

export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;

declare global {
  namespace Express {
    interface Request {
      traceId: string;
      user?: AuthUser;
      session?: AuthSession;
    }
  }
}

export type AppRequest = Request;
