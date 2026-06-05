import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { listReminderLogs } from "./reminders.controller";

export const remindersModule = Router();

remindersModule.use(requireAuth);

/**
 * @openapi
 * /api/reminders/logs:
 *   get:
 *     summary: List all email reminder logs
 *     tags: [Reminders]
 *     parameters:
 *       - in: query
 *         name: actionItemId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of delivery logs
 */
remindersModule.get("/logs", listReminderLogs);
