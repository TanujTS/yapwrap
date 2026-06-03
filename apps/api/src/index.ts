import app from "./app";
import { logger } from "./logger";
import { env } from "./config/env";

const port = env.PORT;

app.listen(port, () => {
  logger.info({ event: "server.started", port });
});
