import type { NextFunction, Response } from "express";
import { eq, and, desc, ilike } from "drizzle-orm";
import { db } from "../../db";
import { reminderLog, actionItem, meeting } from "../../db/schema";
import type { AppRequest } from "../../types";
import { responseOk } from "../../utils/api-response";
import { logger } from "../../logger";

export async function listReminderLogs(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { actionItemId, status } = req.query;

    const query = db
      .select({
        id: reminderLog.id,
        sentTo: reminderLog.sentTo,
        status: reminderLog.status,
        sentAt: reminderLog.sentAt,
        task: actionItem.task,
        meetingTitle: meeting.title,
      })
      .from(reminderLog)
      .innerJoin(actionItem, eq(reminderLog.actionItemId, actionItem.id))
      .innerJoin(meeting, eq(actionItem.meetingId, meeting.id))
      .where(
        and(
          eq(meeting.userId, req.user!.id),
          actionItemId ? eq(reminderLog.actionItemId, actionItemId as string) : undefined,
          status ? ilike(reminderLog.status, `%${status as string}%`) : undefined
        )
      )
      .orderBy(desc(reminderLog.sentAt));

    const results = await query;

    logger.info({ event: "reminder_logs.listed", count: results.length });
    responseOk(req, res, results);
  } catch (error) {
    logger.error({ event: "reminder_logs.list.error", error });
    next(error);
  }
}
