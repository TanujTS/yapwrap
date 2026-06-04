import pino from "pino";

const logger1 = pino({
  transport: {
    target: "pino-pretty"
  }
});

logger1.info("This uses pino-pretty transport");

const logger2 = pino();
logger2.info("This is plain pino");

