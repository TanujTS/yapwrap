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
}).superRefine((data, ctx) => {
  if (data.dueDate) {
    const dueDate = new Date(data.dueDate)
    const now = new Date()
    // Give a 1-minute grace period
    if (dueDate.getTime() < now.getTime() - 60000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date cannot be in the past",
        path: ["dueDate"]
      })
    }

    if (data.reminderOffset && data.reminderOffset !== "none" && data.reminderOffset !== "now") {
      const map: Record<string, number> = {
        "15min": 15 * 60 * 1000,
        "1h": 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
        "2d": 2 * 24 * 60 * 60 * 1000,
        "1w": 7 * 24 * 60 * 60 * 1000,
      };
      const offsetMs = map[data.reminderOffset] ?? 0;
      if (dueDate.getTime() - offsetMs < now.getTime() - 60000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reminder time cannot be in the past",
          path: ["reminderOffset"]
        })
      }
    }
  }
});

export const updateActionItemSchema = z.object({
  task: z.string().min(1).optional(),
  assignee: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  reminderOffset: z.enum(REMINDER_OFFSETS).optional(),
}).superRefine((data, ctx) => {
  if (data.dueDate) {
    const dueDate = new Date(data.dueDate)
    const now = new Date()
    // Give a 1-minute grace period
    if (dueDate.getTime() < now.getTime() - 60000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date cannot be in the past",
        path: ["dueDate"]
      })
    }

    if (data.reminderOffset && data.reminderOffset !== "none" && data.reminderOffset !== "now") {
      const map: Record<string, number> = {
        "15min": 15 * 60 * 1000,
        "1h": 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
        "2d": 2 * 24 * 60 * 60 * 1000,
        "1w": 7 * 24 * 60 * 60 * 1000,
      };
      const offsetMs = map[data.reminderOffset] ?? 0;
      if (dueDate.getTime() - offsetMs < now.getTime() - 60000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reminder time cannot be in the past",
          path: ["reminderOffset"]
        })
      }
    }
  }
});

export const updateActionItemStatusSchema = z.object({
  status: z.enum(actionItemStatusEnum.enumValues),
});
