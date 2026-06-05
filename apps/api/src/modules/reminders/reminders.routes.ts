import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { listReminderLogs } from "./reminders.controller";

export const remindersModule = Router();

remindersModule.use(requireAuth);

remindersModule.get("/logs", listReminderLogs);
