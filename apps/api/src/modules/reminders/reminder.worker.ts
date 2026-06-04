import { Worker, type Job } from "bullmq";
import { eq, and } from "drizzle-orm";
import { redisConnection } from "../../config/redis";
import { db } from "../../db";
import { actionItem, meeting, user, reminderLog } from "../../db/schema";
import { sendReminderEmail } from "./email.service";
import { scheduleReminder } from "./reminder.queue";
import { logger } from "../../logger";
import type { ReminderJobData } from "./reminder.queue";

async function processReminderJob(job: Job<ReminderJobData>) {
  const { actionItemId, type } = job.data;

  logger.info({ event: "reminder.processing", actionItemId, type, jobId: job.id });

  // 1. Fetch the action item + meeting + user (to get email)
  const [result] = await db
    .select({
      actionItem: actionItem,
      meetingTitle: meeting.title,
      userEmail: user.email,
      userName: user.name,
    })
    .from(actionItem)
    .innerJoin(meeting, eq(actionItem.meetingId, meeting.id))
    .innerJoin(user, eq(meeting.userId, user.id))
    .where(eq(actionItem.id, actionItemId))
    .limit(1);

  if (!result) {
    logger.warn({ event: "reminder.item_not_found", actionItemId });
    return; // Item was deleted — nothing to do
  }

  // 2. Skip if already completed
  if (result.actionItem.status === "COMPLETED") {
    logger.info({ event: "reminder.skipped_completed", actionItemId });
    return;
  }

  // 3. Send the email
  const emailResult = await sendReminderEmail({
    to: result.userEmail,
    userName: result.userName,
    task: result.actionItem.task,
    assignee: result.actionItem.assignee,
    dueDate: result.actionItem.dueDate,
    meetingTitle: result.meetingTitle,
    meetingId: result.actionItem.meetingId,
    type,
  });

  // 4. Log the send
  await db.insert(reminderLog).values({
    actionItemId,
    sentTo: result.userEmail,
    status: emailResult.success ? "SENT" : "FAILED",
    providerMessageId: emailResult.messageId ?? null,
  });

  // 5. Update lastReminderSentAt
  await db
    .update(actionItem)
    .set({ lastReminderSentAt: new Date() })
    .where(eq(actionItem.id, actionItemId));

  // 6. If this was an "upcoming" reminder and there's a due date,
  //    schedule the OVERDUE job to fire exactly when the due date arrives.
  //    We DO NOT schedule recurring chase emails.
  if (type === "upcoming" && result.actionItem.dueDate) {
    const overdueDelay = result.actionItem.dueDate.getTime() - Date.now();
    await scheduleReminder(actionItemId, Math.max(overdueDelay, 0), "overdue");
    logger.info({ event: "reminder.overdue_check_scheduled", actionItemId });
  }

  logger.info({ event: "reminder.sent", actionItemId, type, to: result.userEmail });
}

// --- Start the worker ---

export function startReminderWorker() {
  const worker = new Worker(
    "action-item-reminders",  // Must match the queue name!
    processReminderJob,        // The function to run for each job
    {
      connection: redisConnection,
      concurrency: 5, // Process up to 5 jobs in parallel
    },
  );

  worker.on("completed", (job) => {
    logger.info({ event: "reminder.job.completed", jobId: job.id });
  });

  worker.on("failed", (job, err) => {
    logger.error({ event: "reminder.job.failed", jobId: job?.id, error: err.message });
  });

  logger.info({ event: "reminder.worker.started" });
  return worker;
}