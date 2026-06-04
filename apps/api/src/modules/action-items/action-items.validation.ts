import { z } from "zod";
import { actionItemStatusEnum } from "../../db/schema";

export const createActionItemSchema = z.object({
  meetingId: z.string().uuid(),
  analysisId: z.string().uuid().optional(),
  task: z.string().min(1),
  assignee: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  citations: z.array(
    z.object({
      timestamp: z.string(),
      speaker: z.string().optional(),
    })
  ).optional(),
});

export const updateActionItemStatusSchema = z.object({
  status: z.enum(actionItemStatusEnum.enumValues),
});
