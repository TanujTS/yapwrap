import app from "./app";
import { logger } from "./logger";
import { env } from "./config/env";
import { startReminderWorker } from "./modules/reminders/reminder.worker";

const port = env.PORT;

app.listen(port, () => {
  logger.info({ event: "server.started", port });

  // Start the BullMQ worker in the same process
  startReminderWorker();
});