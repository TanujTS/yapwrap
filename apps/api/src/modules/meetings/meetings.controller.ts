import type { NextFunction, Response } from "express";
import { eq, and, desc, ilike, count } from "drizzle-orm";
import { db } from "../../db";
import { meeting } from "../../db/schema";
import type { AppRequest } from "../../types";
import { ApiError } from "../../utils/api-error";
import {
  responseOk,
  responseCreated,
  responseFail,
} from "../../utils/api-response";
import { createMeetingSchema } from "./meetings.validation";
import { logger } from "../../logger";

export async function createMeeting(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createMeetingSchema.safeParse(req.body);

    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors;
      responseFail(
        req,
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid meeting data",
        details,
      );
      return;
    }

    const { title, participants, meetingDate, transcript } = parsed.data;

    const participantObjects = participants.map((email) => ({
      name: email.split("@")[0] ?? email,
      email,
    }));

    const [created] = await db
      .insert(meeting)
      .values({
        userId: req.user!.id,
        title,
        participants: participantObjects,
        meetingDate: new Date(meetingDate),
        transcript,
      })
      .returning();

    logger.info({ event: "meeting.created", userId: req.user!.id, meetingId: created?.id });
    responseCreated(req, res, created);
  } catch (error) {
    logger.error({ event: "meeting.create.error", error });
    next(error);
  }
}

export async function getMeeting(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;

    if (!id) {
      throw new ApiError(400, "VALIDATION_ERROR", "Meeting ID is required");
    }

    const [found] = await db
      .select()
      .from(meeting)
      .where(
        and(
          eq(meeting.id, id),
          eq(meeting.userId, req.user!.id),
        ),
      )
      .limit(1);

    if (!found) {
      logger.warn({ event: "meeting.not_found", userId: req.user!.id, meetingId: id });
      throw new ApiError(404, "NOT_FOUND", "Meeting not found");
    }

    logger.info({ event: "meeting.fetched", userId: req.user!.id, meetingId: id });
    responseOk(req, res, found);
  } catch (error) {
    logger.error({ event: "meeting.get.error", error });
    next(error);
  }
}

export async function listMeetings(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 20),
    );
    const offset = (page - 1) * limit;
    const search = req.query.search as string | undefined;

    const conditions = and(
      eq(meeting.userId, req.user!.id),
      search ? ilike(meeting.title, `%${search}%`) : undefined
    );

    const meetings = await db
      .select()
      .from(meeting)
      .where(conditions)
      .orderBy(desc(meeting.meetingDate))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [total] = await db
      .select({ count: count() })
      .from(meeting)
      .where(conditions);

    const totalCount = total?.count ?? 0;

    logger.info({ event: "meetings.listed", userId: req.user!.id, count: meetings.length, total: totalCount, page });

    responseOk(req, res, meetings, 200, {
      page,
      limit,
      count: totalCount,
    });
  } catch (error) {
    logger.error({ event: "meetings.list.error", error });
    next(error);
  }
}

export async function deleteMeeting(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;

    if (!id) {
      throw new ApiError(400, "VALIDATION_ERROR", "Meeting ID is required");
    }

    const [found] = await db
      .select({ id: meeting.id })
      .from(meeting)
      .where(
        and(
          eq(meeting.id, id),
          eq(meeting.userId, req.user!.id),
        ),
      )
      .limit(1);

    if (!found) {
      throw new ApiError(404, "NOT_FOUND", "Meeting not found");
    }

    await db.delete(meeting).where(eq(meeting.id, id));

    logger.info({ event: "meeting.deleted", userId: req.user!.id, meetingId: id });
    responseOk(req, res, { success: true });
  } catch (error) {
    logger.error({ event: "meeting.delete.error", error });
    next(error);
  }
}
