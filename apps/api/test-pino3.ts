import pino from "pino";

const logger1 = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true }
  }
});

logger1.info("This uses single target pino-pretty transport");

