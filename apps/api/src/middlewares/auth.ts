import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth";
import { responseFail } from "../utils/api-response";
import type { AppRequest } from "../types";

export async function requireAuth(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      responseFail(
        req,
        res,
        401,
        "UNAUTHORIZED",
        "Authentication required. Please sign in.",
      );
      return;
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    responseFail(
      req,
      res,
      401,
      "UNAUTHORIZED",
      "Invalid or expired session.",
    );
  }
}
