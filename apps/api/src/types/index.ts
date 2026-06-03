import type { Request } from "express";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
}; //replace with better auth schema later

declare global {
  namespace Express {
    interface Request {
      traceId: string;
      user?: AuthenticatedUser;
    }
  }
}

export type AppRequest = Request;
