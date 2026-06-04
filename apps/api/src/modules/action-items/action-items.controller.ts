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
  updateActionItemStatusSchema,
} from "./action-items.validation";
import { logger } from "../../logger";

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
        citations: data.citations || [],
      })
      .returning();

    logger.info({ event: "action_item.created", actionItemId: created?.id });
    responseCreated(req, res, created);
  } catch (error) {
    logger.error({ event: "action_item.create.error", error });
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

    await db.delete(actionItem).where(eq(actionItem.id, id));

    logger.info({ event: "action_item.deleted", actionItemId: id });
    responseOk(req, res, { success: true });
  } catch (error) {
    logger.error({ event: "action_item.delete.error", error });
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
