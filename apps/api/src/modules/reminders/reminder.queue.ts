import { Queue } from "bullmq";
import { redisConnection } from "../../config/redis";

// The queue name — all jobs on this queue are reminder-related
export const reminderQueue = new Queue("action-item-reminders", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,            // Retry up to 3 times if the job fails
    backoff: {
      type: "exponential",  // Wait 1s, then 2s, then 4s between retries
      delay: 1000,
    },
    removeOnComplete: {
      count: 100,           // Keep last 100 completed jobs for debugging
    },
    removeOnFail: {
      count: 200,           // Keep last 200 failed jobs for debugging
    },
  },
});

// ---------- Helper to schedule a reminder ----------

export type ReminderJobData = {
  actionItemId: string;
  type: "upcoming" | "overdue";
};

/**
 * Schedule a reminder job with a delay.
 *
 * @param actionItemId - The action item to remind about
 * @param delayMs      - How many ms from NOW to fire (0 = immediately)
 * @param type         - "upcoming" (before due) or "overdue" (after due)
 */
export async function scheduleReminder(
  actionItemId: string,
  delayMs: number,
  type: "upcoming" | "overdue" = "upcoming",
) {
  // jobId ensures we don't accidentally double-schedule the same reminder
  const jobId = `reminder-${type}-${actionItemId}`;

  // Remove any existing job with this ID first (in case user changed the offset)
  const existing = await reminderQueue.getJob(jobId);
  if (existing) {
    await existing.remove();
  }

  await reminderQueue.add(
    "send-reminder",          // job name (for logging/filtering)
    { actionItemId, type },   // job data (available in the worker)
    {
      delay: Math.max(delayMs, 0), // BullMQ accepts delay in ms
      jobId,                        // Deduplicate by this ID
    },
  );
}

/**
 * Remove a scheduled reminder (e.g. when action item is completed or deleted)
 */
export async function cancelReminder(actionItemId: string) {
  for (const type of ["upcoming", "overdue"] as const) {
    const jobId = `reminder-${type}-${actionItemId}`;
    const job = await reminderQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }
}