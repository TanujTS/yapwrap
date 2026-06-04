import { z } from "zod";
import { actionItemStatusEnum } from "../../db/schema";

export const REMINDER_OFFSETS = ["none", "now", "15min", "1h", "1d", "2d", "1w"] as const;
export type ReminderOffset = (typeof REMINDER_OFFSETS)[number];

export const createActionItemSchema = z.object({
  meetingId: z.string().uuid(),
  analysisId: z.string().uuid().optional(),
  task: z.string().min(1),
  assignee: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  reminderOffset: z.enum(REMINDER_OFFSETS).default("none"),
  citations: z.array(
    z.object({
      timestamp: z.string(),
      speaker: z.string().optional(),
    })
  ).optional(),
});

export const updateActionItemSchema = z.object({
  task: z.string().min(1).optional(),
  assignee: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  reminderOffset: z.enum(REMINDER_OFFSETS).optional(),
});

export const updateActionItemStatusSchema = z.object({
  status: z.enum(actionItemStatusEnum.enumValues),
});
