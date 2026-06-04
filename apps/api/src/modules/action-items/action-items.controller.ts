import type { NextFunction, Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db";
import { actionItem, meeting } from "../../db/schema";
import type { AppRequest } from "../../types";
import { ApiError } from "../../utils/api-error";
import {
  responseOk,
  responseCreated,
  responseFail,
} from "../../utils/api-response";
import {
  createActionItemSchema,
  updateActionItemSchema,
  updateActionItemStatusSchema,
} from "./action-items.validation";
import { logger } from "../../logger";
import { scheduleReminder, cancelReminder } from "../reminders/reminder.queue";

function parseOffset(offset: string): number {
  const map: Record<string, number> = {
    "15min": 15 * 60 * 1000,
    "1h":    60 * 60 * 1000,
    "1d":    24 * 60 * 60 * 1000,
    "2d":    2 * 24 * 60 * 60 * 1000,
    "1w":    7 * 24 * 60 * 60 * 1000,
  };
  return map[offset] ?? 0;
}

export async function createActionItem(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createActionItemSchema.safeParse(req.body);

    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors;
      responseFail(
        req,
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid action item data",
        details,
      );
      return;
    }

    const data = parsed.data;

    // Verify user owns the meeting
    const [foundMeeting] = await db
      .select()
      .from(meeting)
      .where(and(eq(meeting.id, data.meetingId), eq(meeting.userId, req.user!.id)))
      .limit(1);

    if (!foundMeeting) {
      throw new ApiError(404, "NOT_FOUND", "Meeting not found");
    }

    const [created] = await db
      .insert(actionItem)
      .values({
        meetingId: data.meetingId,
        analysisId: data.analysisId,
        task: data.task,
        assignee: data.assignee,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        reminderOffset: data.reminderOffset,
        citations: data.citations || [],
      })
      .returning();

    if (created && data.dueDate && data.reminderOffset && data.reminderOffset !== "none") {
      if (data.reminderOffset === "now") {
        await scheduleReminder(created.id, 15000, "upcoming");
      } else {
        const dueMs = new Date(data.dueDate).getTime();
        const offsetMs = parseOffset(data.reminderOffset);
        const delayMs = dueMs - offsetMs - Date.now();

        if (delayMs > 0) {
          await scheduleReminder(created.id, delayMs, "upcoming");
        } else {
          await scheduleReminder(created.id, 0, "upcoming"); // ????
        }
      }
    }

    logger.info({ event: "action_item.created", actionItemId: created?.id });
    responseCreated(req, res, created);
  } catch (error) {
    logger.error({ event: "action_item.create.error", error });
    next(error);
  }
}

export async function updateActionItem(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    if (!id) throw new ApiError(400, "VALIDATION_ERROR", "Action Item ID is required");

    const parsed = updateActionItemSchema.safeParse(req.body);
    if (!parsed.success) {
      responseFail(req, res, 400, "VALIDATION_ERROR", "Invalid data", parsed.error.flatten().fieldErrors);
      return;
    }

    const [found] = await db
      .select({ actionItem: actionItem })
      .from(actionItem)
      .innerJoin(meeting, eq(actionItem.meetingId, meeting.id))
      .where(and(eq(actionItem.id, id), eq(meeting.userId, req.user!.id)))
      .limit(1);

    if (!found) {
      throw new ApiError(404, "NOT_FOUND", "Action item not found");
    }

    const updates: Record<string, any> = {};
    if (parsed.data.task !== undefined) updates.task = parsed.data.task;
    if (parsed.data.assignee !== undefined) updates.assignee = parsed.data.assignee;
    if (parsed.data.dueDate !== undefined) updates.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
    if (parsed.data.reminderOffset !== undefined) updates.reminderOffset = parsed.data.reminderOffset;

    const [updated] = await db
      .update(actionItem)
      .set(updates)
      .where(eq(actionItem.id, id))
      .returning();

    const effectiveDueDate = updated?.dueDate;
    const effectiveOffset = updated?.reminderOffset;

    await cancelReminder(id);

    if (updated && effectiveDueDate && effectiveOffset && effectiveOffset !== "none" && updated.status !== "COMPLETED") {
      if (effectiveOffset === "now") {
        await scheduleReminder(id, 15000, "upcoming");
      } else {
        const dueMs = effectiveDueDate.getTime();
        const offsetMs = parseOffset(effectiveOffset);
        const delayMs = dueMs - offsetMs - Date.now();
        await scheduleReminder(id, Math.max(delayMs, 0), "upcoming");
      }
    }

    logger.info({ event: "action_item.updated", actionItemId: id });
    responseOk(req, res, updated);
  } catch (error) {
    logger.error({ event: "action_item.update.error", error });
    next(error);
  }
}

export async function updateActionItemStatus(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    if (!id) throw new ApiError(400, "VALIDATION_ERROR", "Action Item ID is required");

    const parsed = updateActionItemStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      responseFail(req, res, 400, "VALIDATION_ERROR", "Invalid status", parsed.error.flatten().fieldErrors);
      return;
    }

    // Verify user owns the meeting for this action item
    const [found] = await db
      .select({ id: actionItem.id })
      .from(actionItem)
      .innerJoin(meeting, eq(actionItem.meetingId, meeting.id))
      .where(and(eq(actionItem.id, id), eq(meeting.userId, req.user!.id)))
      .limit(1);

    if (!found) {
      throw new ApiError(404, "NOT_FOUND", "Action item not found");
    }

    const [updated] = await db
      .update(actionItem)
      .set({ status: parsed.data.status })
      .where(eq(actionItem.id, id))
      .returning();

    if (parsed.data.status === "COMPLETED") {
      await cancelReminder(id);
    }

    logger.info({ event: "action_item.status.updated", actionItemId: id, status: updated?.status });
    responseOk(req, res, updated);
  } catch (error) {
    logger.error({ event: "action_item.update_status.error", error });
    next(error);
  }
}

export async function deleteActionItem(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    if (!id) throw new ApiError(400, "VALIDATION_ERROR", "Action Item ID is required");

    // Verify user owns the meeting for this action item
    const [found] = await db
      .select({ id: actionItem.id })
      .from(actionItem)
      .innerJoin(meeting, eq(actionItem.meetingId, meeting.id))
      .where(and(eq(actionItem.id, id), eq(meeting.userId, req.user!.id)))
      .limit(1);

    if (!found) {
      throw new ApiError(404, "NOT_FOUND", "Action item not found");
    }

    await cancelReminder(id);

    await db.delete(actionItem).where(eq(actionItem.id, id));

    logger.info({ event: "action_item.deleted", actionItemId: id });
    responseOk(req, res, { success: true });
  } catch (error) {
    logger.error({ event: "action_item.delete.error", error });
    next(error);
  }
}

export async function getActionItem(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    if (!id) throw new ApiError(400, "VALIDATION_ERROR", "Action Item ID is required");

    const [found] = await db
      .select({ actionItem: actionItem })
      .from(actionItem)
      .innerJoin(meeting, eq(actionItem.meetingId, meeting.id))
      .where(and(eq(actionItem.id, id), eq(meeting.userId, req.user!.id)))
      .limit(1);

    if (!found) {
      throw new ApiError(404, "NOT_FOUND", "Action item not found");
    }

    responseOk(req, res, found.actionItem);
  } catch (error) {
    logger.error({ event: "action_item.get.error", error });
    next(error);
  }
}

export async function listActionItems(
  req: AppRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { meetingId, status, assignee } = req.query;

    const query = db
      .select({
        actionItem: actionItem,
      })
      .from(actionItem)
      .innerJoin(meeting, eq(actionItem.meetingId, meeting.id))
      .where(
        and(
          eq(meeting.userId, req.user!.id),
          meetingId ? eq(actionItem.meetingId, meetingId as string) : undefined,
          status ? eq(actionItem.status, status as any) : undefined,
          assignee ? eq(actionItem.assignee, assignee as string) : undefined
        )
      )
      .orderBy(desc(actionItem.createdAt));

    const results = await query;
    const items = results.map(r => r.actionItem);

    logger.info({ event: "action_items.listed", count: items.length });
    responseOk(req, res, items);
  } catch (error) {
    logger.error({ event: "action_items.list.error", error });
    next(error);
  }
}
